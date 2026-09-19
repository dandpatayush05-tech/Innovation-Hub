import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';
import { ApiError, BadRequestError, ForbiddenError, NotFoundError } from '../utils/ApiError';
import { buildPaymentGroup, createPaymentGroup } from '../services/paymentGroupService';
import { createOrder, verifySignature, verifyWebhookSignature } from '../services/razorpayService';
import { createNotification } from './notificationController';
import { sendPaymentSuccessSMS, sendPaymentFailureSMS, sendBookingConfirmationSMS } from '../services/notifications/smsService';
import { generateReceiptPdf, generateCombinedReceipt } from '../services/receiptService';


export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingIds, discountCode } = req.body;
    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      throw new BadRequestError('bookingIds must be a non-empty array', undefined);
    }

    const { paymentGroup, groupData } = await createPaymentGroup(req.user!.id, bookingIds, discountCode);
    const order = await createOrder(paymentGroup.total);

    await supabase.from('payment_groups').update({ razorpay_order_id: order.id }).eq('id', paymentGroup.id);

    res.json({
      paymentGroupId: paymentGroup.id,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      calculatedAmount: paymentGroup.total
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw new ApiError(500, error.message || 'Failed to create order', 'INTERNAL_ERROR', undefined);
  }
};

export const verifyRazorpaySignature = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentGroupId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      // NOTE: Webhook handles DB updates. We can just reject the frontend request.
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    res.json({ success: true, message: 'Payment signature verified locally. Awaiting webhook confirmation.' });
  } catch (error: any) {
    console.error('Error verifying signature locally:', error);
    throw new ApiError(500, 'Failed to verify payment locally', 'INTERNAL_ERROR', undefined);
  }
};

export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    let { bookingIds } = req.query;
    let ids: string[] = [];
    if (typeof bookingIds === 'string') {
      ids = bookingIds.split(',');
    } else if (Array.isArray(bookingIds)) {
      ids = bookingIds as string[];
    }

    if (!ids || ids.length === 0) {
      throw new BadRequestError('bookingIds query param required', undefined);
    }

    const group = await buildPaymentGroup(req.user!.id, ids);

    // Static benefits based on groupType
    let benefits: string[] = [];
    if (group.groupType === 'whole_trip') {
      benefits = ['Free cancellation up to 24h', 'Priority support', 'Free trip modifications'];
    } else {
      benefits = ['Standard support'];
    }

    res.json({
      tripLabel: group.tripId ? 'Trip Payment' : 'Booking Payment',
      items: group.items,
      subtotal: group.subtotal,
      discountAmount: group.discountAmount,
      discountLabel: group.discountLabel,
      serviceFee: group.serviceFee,
      total: group.total,
      benefits
    });
  } catch (error: any) {
    console.error('Error in getOverview:', error);
    throw new ApiError(500, error.message || 'Failed to get overview', 'INTERNAL_ERROR', undefined);
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  // Keeping Phase 9 getPayments unchanged
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, count, error } = await supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('user_id', req.user?.id)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw new ApiError(500, 'Failed to fetch payments');

  res.json({
    data: data || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
  });
};

export const downloadReceipt = async (req: AuthRequest, res: Response) => {
  // Phase 9 download receipt (per item)
  const paymentId = req.params.id as string;
  const { data: payment } = await supabase.from('payments').select('user_id').eq('id', paymentId).single();
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.user_id !== req.user?.id && req.user?.role !== 'admin') throw new ForbiddenError('Access denied');

  const doc = await generateReceiptPdf(paymentId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt_${paymentId.substring(0, 8)}.pdf`);
  doc.pipe(res);
  doc.end();
};

export const downloadCombinedReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate access and get group data
    const { data: group } = await supabase
      .from('payment_groups')
      .select('*, items:payment_group_items(*)')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (!group) throw new NotFoundError('Payment group not found', undefined);

    const pdfBuffer = await generateCombinedReceipt(group, group.items);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-group-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to generate combined receipt', 'INTERNAL_ERROR', undefined);
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // This could be paymentGroupId

    // First try group
    const { data: group } = await supabase
      .from('payment_groups')
      .select('id, status, razorpay_order_id')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (group) {
      return res.json({ id: group.id, status: group.status, type: 'group' });
    }

    // Then try individual payment row (just in case)
    const { data: payment } = await supabase
      .from('payments')
      .select('id, status, razorpay_order_id')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (payment) {
      return res.json({ id: payment.id, status: payment.status, type: 'payment' });
    }

    throw new NotFoundError('Payment or payment group not found', undefined);
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch payment status', 'INTERNAL_ERROR', undefined);
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return res.status(500).send('Webhook secret missing');
    }

    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return res.status(400).send('Missing signature');
    }

    // req.body should be a Buffer because of express.raw
    if (!Buffer.isBuffer(req.body)) {
      console.error('Webhook body is not a Buffer! Ensure express.raw is configured correctly.');
      return res.status(400).send('Invalid body format');
    }

    const isValid = verifyWebhookSignature(req.body, signature, secret);
    if (!isValid) {
      return res.status(400).send('Invalid webhook signature');
    }

    const event = JSON.parse(req.body.toString('utf8'));
    
    // Process known events
    if (event.event === 'payment.captured') {
      const order_id = event.payload.payment.entity.order_id;
      const payment_id = event.payload.payment.entity.id;

      // Find the group
      const { data: group } = await supabase
        .from('payment_groups')
        .select('id, user_id, status')
        .eq('razorpay_order_id', order_id)
        .single();

      if (!group) {
        console.error('Webhook: Payment group not found for order', order_id);
        return res.status(200).send('OK'); // Ack to stop retries for unknown orders
      }

      // Idempotency check
      if (group.status === 'paid') {
        return res.status(200).send('OK');
      }

      // Transactionally confirm
      const { error: txnError } = await supabase.rpc('verify_payment_txn', {
        p_group_id: group.id,
        p_user_id: group.user_id,
        p_provider_order_id: order_id,
        p_provider_payment_id: payment_id
      });

      if (txnError) {
        console.error('Webhook transaction error:', txnError);
        return res.status(500).send('Transaction failed');
      }

      // Fetch user phone
      const { data: user } = await supabase.from('users').select('phone').eq('id', group.user_id).single();
      const phone = user?.phone;

      if (phone) {
        // Send success SMS asynchronously
        sendPaymentSuccessSMS(phone, group.subtotal, group.id, payment_id).catch(err => console.error(err));
      }

      // Send notifications
      const { data: items } = await supabase.from('payment_group_items').select('booking_id, item_type').eq('payment_group_id', group.id);
      if (items) {
        for (const item of items) {
          await createNotification(
            group.user_id,
            'payment_success',
            'Payment Successful',
            `Your payment has been successfully verified.`
          );
          await createNotification(
            group.user_id,
            'booking_confirmation',
            'Booking Confirmed',
            `Your ${item.item_type} booking has been confirmed! You can view it in your dashboard.`
          );
          if (phone) {
             sendBookingConfirmationSMS(phone, item.booking_id, item.item_type, payment_id).catch(err => console.error(err));
          }
        }
      }

    } else if (event.event === 'payment.failed') {
      const order_id = event.payload.payment.entity.order_id;
      const error_desc = event.payload.payment.entity.error_description || 'Payment failed';
      const amount = (event.payload.payment.entity.amount || 0) / 100;
      const payment_id = event.payload.payment.entity.id;
      
      const { data: group } = await supabase
        .from('payment_groups')
        .select('id, user_id, status')
        .eq('razorpay_order_id', order_id)
        .single();

      if (group && group.status !== 'paid' && group.status !== 'failed') {
        await supabase.from('payment_groups').update({ 
          status: 'failed', 
          failure_reason: error_desc 
        }).eq('id', group.id);

        const { data: user } = await supabase.from('users').select('phone').eq('id', group.user_id).single();
        if (user?.phone) {
          sendPaymentFailureSMS(user.phone, amount, payment_id).catch(err => console.error(err));
        }
      }
    }

    // Always Ack
    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
};

import PDFDocument from 'pdfkit';
import { supabase } from '../config/supabase';
import { NotFoundError } from '../utils/ApiError';

export const generateReceiptPdf = async (paymentId: string): Promise<PDFKit.PDFDocument> => {
  // Fetch payment with user
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*, user:users(name, email)')
    .eq('id', paymentId)
    .single();

  if (paymentError || !payment) {
    throw new NotFoundError('Payment not found', undefined);
  }

  // Fetch booking details based on booking_type
  let tripDetails = 'Trip Details Unavailable';
  const { booking_id, booking_type } = payment;

  try {
    if (booking_type === 'hotel') {
      const { data } = await supabase.from('bookings').select('*, hotel:hotels(name, destination:destinations(name))').eq('id', booking_id).single();
      if (data && data.hotel) tripDetails = `Hotel Stay at ${data.hotel.name} (${data.hotel.destination?.name}) - Check In: ${data.check_in}`;
    } else if (booking_type === 'tour') {
      const { data } = await supabase.from('guide_bookings').select('*, tour:tours(name)').eq('id', booking_id).single();
      if (data && data.tour) tripDetails = `Tour/Experience: ${data.tour.name} on ${data.date}`;
    } else if (booking_type === 'flight') {
      const { data } = await supabase.from('flight_bookings').select('*, flight:flights(departure_airport, arrival_airport)').eq('id', booking_id).single();
      if (data && data.flight) tripDetails = `Flight from ${data.flight.departure_airport} to ${data.flight.arrival_airport}`;
    } else if (booking_type === 'bus_leg') {
      const { data } = await supabase.from('bus_bookings').select('*, bus:buses(origin, destination)').eq('id', booking_id).single();
      if (data && data.bus) tripDetails = `Bus Journey from ${data.bus.origin} to ${data.bus.destination}`;
    } else if (booking_type === 'auto') {
      const { data } = await supabase.from('auto_bookings').select('*').eq('id', booking_id).single();
      if (data) tripDetails = `Auto/Taxi Ride from ${data.pickup_location} to ${data.dropoff_location}`;
    }
  } catch (err) {
    console.error('Failed to fetch booking details for receipt', err);
  }

  // Initialize PDF
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc
    .fontSize(24)
    .text('INNOVATION HUB TOUR / YATRA SETU', { align: 'center' })
    .moveDown();
    
  doc
    .fontSize(16)
    .text('PAYMENT RECEIPT', { align: 'center' })
    .moveDown(2);

  // Invoice Details
  doc
    .fontSize(12)
    .text(`Receipt #: INV-${payment.id.split('-')[0].toUpperCase()}`)
    .text(`Date: ${new Date(payment.paid_at || payment.created_at).toLocaleString()}`)
    .text(`Status: ${payment.status.toUpperCase()}`)
    .moveDown();

  // Customer Details
  doc
    .text(`Customer: ${payment.user?.name || 'Guest'}`)
    .text(`Email: ${payment.user?.email || 'N/A'}`)
    .moveDown();

  // Trip Details
  doc
    .fontSize(14)
    .text('Booking Summary', { underline: true })
    .moveDown(0.5);
    
  doc
    .fontSize(12)
    .text(`Type: ${booking_type.toUpperCase()}`)
    .text(`Description: ${tripDetails}`)
    .text(`Booking Reference: ${booking_id}`)
    .moveDown();

  // Payment Details
  doc
    .fontSize(14)
    .text('Payment Details', { underline: true })
    .moveDown(0.5);
    
  doc
    .fontSize(12)
    .text(`Provider: ${payment.provider.toUpperCase()}`)
    .text(`Transaction ID: ${payment.provider_payment_id || 'N/A'}`)
    .moveDown();

  // Amount
  doc
    .fontSize(18)
    .text(`Total Paid: ${payment.currency} ${Number(payment.amount).toFixed(2)}`, { align: 'right' })
    .moveDown();

  doc
    .fontSize(10)
    .fillColor('gray')
    .text('Thank you for choosing Yatra Setu!', { align: 'center' });

  return doc;
};


export const generateCombinedReceipt = async (paymentGroupId: string): Promise<PDFKit.PDFDocument> => {
  const { data: group, error: groupError } = await supabase
    .from('payment_groups')
    .select('*, user:users(name, email)')
    .eq('id', paymentGroupId)
    .single();

  if (groupError || !group) throw new NotFoundError('Payment group not found');

  const { data: items, error: itemsError } = await supabase
    .from('payment_group_items')
    .select('*')
    .eq('payment_group_id', paymentGroupId);

  if (itemsError || !items) throw new NotFoundError('Payment items not found');

  const doc = new PDFDocument({ margin: 50 });

  doc
    .fontSize(24)
    .text('INNOVATION HUB TOUR / YATRA SETU', { align: 'center' })
    .moveDown();
    
  doc
    .fontSize(16)
    .text('COMBINED PAYMENT RECEIPT', { align: 'center' })
    .moveDown(2);

  doc
    .fontSize(12)
    .text(`Receipt #: GRP-${group.id.split('-')[0].toUpperCase()}`)
    .text(`Date: ${new Date(group.created_at).toLocaleString()}`)
    .text(`Status: ${group.status.toUpperCase()}`)
    .moveDown();

  doc
    .text(`Customer: ${group.user?.name || 'Guest'}`)
    .text(`Email: ${group.user?.email || 'N/A'}`)
    .moveDown();

  doc
    .fontSize(14)
    .text('Itemized Summary', { underline: true })
    .moveDown(0.5);

  items.forEach((item: any, i: number) => {
    doc.fontSize(12).text(`${i + 1}. ${item.item_type.toUpperCase()} - ${item.label}`);
    doc.text(`   Amount: INR ${Number(item.amount).toFixed(2)}`);
    doc.moveDown(0.5);
  });

  doc.moveDown();

  doc
    .fontSize(14)
    .text('Totals', { underline: true })
    .moveDown(0.5);

  doc.fontSize(12);
  doc.text(`Subtotal: INR ${Number(group.subtotal).toFixed(2)}`, { align: 'right' });
  
  if (group.discount_amount > 0) {
    doc.text(`Discount: - INR ${Number(group.discount_amount).toFixed(2)}`, { align: 'right' });
  }
  
  doc.text(`Service Fee: INR ${Number(group.service_fee).toFixed(2)}`, { align: 'right' });
  doc.moveDown();

  doc
    .fontSize(18)
    .text(`Total Paid: INR ${Number(group.total).toFixed(2)}`, { align: 'right' })
    .moveDown(2);

  doc
    .fontSize(10)
    .fillColor('gray')
    .text('Thank you for choosing Yatra Setu!', { align: 'center' });

  return doc;
};

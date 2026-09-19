import twilio from 'twilio';
import { supabase } from '../../config/supabase';

// Twilio Config
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_placeholder_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'placeholder_token';
const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Lazy initialize client so it doesn't crash on boot if credentials are missing
let twilioClient: twilio.Twilio | null = null;
const getClient = () => {
  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

/**
 * Log notification to the database.
 */
async function logNotification(paymentId: string | null, type: string, status: string, details?: string) {
  try {
    await supabase.from('notifications_log').insert({
      payment_id: paymentId,
      type,
      status,
      details,
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}

export async function sendPaymentSuccessSMS(phone: string, amount: number, bookingId: string, paymentId: string) {
  try {
    const message = `Innovation Hub Tour: Payment of ₹${amount} successful. Booking #${bookingId} is confirmed. Payment ID: ${paymentId}.`;
    console.log(`[SMS] Sending Success SMS to ${phone}`);
    const result = await getClient().messages.create({
      body: message,
      from: fromNumber,
      to: phone
    });
    await logNotification(paymentId, 'sms_payment_success', 'sent', `Twilio SID: ${result.sid}`);
    return result;
  } catch (error: any) {
    console.error('[SMS Service Error]:', error.message);
    await logNotification(paymentId, 'sms_payment_success', 'failed', error.message);
    // Suppress error so it doesn't crash the webhook flow
    return null;
  }
}

export async function sendPaymentFailureSMS(phone: string, amount: number, paymentId?: string) {
  try {
    const message = `Innovation Hub Tour: Payment of ₹${amount} failed. Your booking has not been confirmed. Please try again.`;
    console.log(`[SMS] Sending Failure SMS to ${phone}`);
    const result = await getClient().messages.create({
      body: message,
      from: fromNumber,
      to: phone
    });
    await logNotification(paymentId || null, 'sms_payment_failure', 'sent', `Twilio SID: ${result.sid}`);
    return result;
  } catch (error: any) {
    console.error('[SMS Service Error]:', error.message);
    await logNotification(paymentId || null, 'sms_payment_failure', 'failed', error.message);
    return null;
  }
}

export async function sendBookingConfirmationSMS(phone: string, bookingId: string, tripLabel: string, paymentId?: string) {
  try {
    const message = `Innovation Hub Tour: Booking #${bookingId} for ${tripLabel} is confirmed. Have a great trip!`;
    console.log(`[SMS] Sending Booking Confirmation SMS to ${phone}`);
    const result = await getClient().messages.create({
      body: message,
      from: fromNumber,
      to: phone
    });
    await logNotification(paymentId || null, 'sms_booking_confirmation', 'sent', `Twilio SID: ${result.sid}`);
    return result;
  } catch (error: any) {
    console.error('[SMS Service Error]:', error.message);
    await logNotification(paymentId || null, 'sms_booking_confirmation', 'failed', error.message);
    return null;
  }
}

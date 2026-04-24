const twilio = require('twilio');
const NotificationLog = require('../models/NotificationLog');

// Twilio placeholders - Populate in .env
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const fromNumber = process.env.TWILIO_FROM_NUMBER || '+1234567890'; // SMS From
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio Sandbox

const client = twilio(accountSid, authToken);

const sendNotification = async ({ userId, phone, message, type, channel = 'sms' }) => {
  try {
    let result;
    const to = channel === 'whatsapp' ? `whatsapp:${phone}` : phone;
    const from = channel === 'whatsapp' ? whatsappFrom : fromNumber;

    if (process.env.NODE_ENV === 'production' || (process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.startsWith('ACxxx'))) {
      result = await client.messages.create({
        body: message,
        from: from,
        to: to
      });
    } else {
      console.log(`[Notification Mock] To: ${to}, Message: ${message}`);
      result = { sid: 'MOCK_' + Date.now() };
    }

    await NotificationLog.create({
      user: userId,
      phone,
      channel,
      type,
      message,
      status: 'sent',
      twilioSid: result.sid
    });

    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('Notification Error:', err.message);
    
    await NotificationLog.create({
      user: userId,
      phone,
      channel,
      type,
      message,
      status: 'failed',
      error: err.message
    });

    return { success: false, error: err.message };
  }
};

module.exports = { sendNotification };

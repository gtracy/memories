const twilio = require('twilio');
require('dotenv-json')();


module.exports.sendSMS = async function (msg, recipient, media_url) {
    try {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        let msg_obj = {
            body: msg,
            to: recipient,
            from: process.env.TWILIO_NUMBER,
        };
        if (media_url) {
            msg_obj.mediaUrl = [media_url];
        }

        const message = await client.messages.create(msg_obj);
        return message;
    } catch (e) {
        throw e;
    }
};
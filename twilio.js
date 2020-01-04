var twilio = require('twilio');

module.exports.sendSMS = async function(msg,recipient,callback) {

    try {
        var client = new twilio(process.env.TWILIO_SID,process.env.TWILIO_TOKEN);
        const message = await client.messages.create({
            body: msg,
            to: recipient,
            from: process.env.TWILIO_NUMBER
        });
        return message.sid;
    } catch (e) {
        throw e;
    }

}
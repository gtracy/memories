const twilio = require('twilio');
try {
    require('dotenv-json')();
} catch (error) {
    // do nothing
}

/**
 * Get twilio client - separated for testability
 */
function getClient(sid, token) {
    return twilio(sid, token);
}

module.exports.sendSMS = async function (msg, recipient, media_url, _getClient = getClient) {
    try {
        const client = _getClient(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
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

// For testing
module.exports._getClient = getClient;
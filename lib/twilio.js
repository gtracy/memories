var twilio = require('twilio');
var config = require('./config');

module.exports.sendSMS = function(msg,recipient,callback) {

    var client = new twilio(config.TWILIO_ACCOUNT_SID,config.TWILIO_AUTH_TOKEN);
    client.messages.create({
        body: msg,
        to: recipient,
        from: config.TWILIO_NUMBER
    })
    .then((message) => {
        console.dir(message);
        callback(message.sid)
    });

}
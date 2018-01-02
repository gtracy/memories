
var twilioClient = require('./twilio');
var config = require('./config');

exports.lambdaHandler = function(event, context, callback) {
    console.log('Loading function...');
    console.dir(event);
    console.dir(context);
    twilioClient.sendSMS('Hello, Greg. Your Lambda job is working. :)',config.NOTIFICATION_SMS_NUMBER, (message_sid) => {
        console.log('Time remaining after Twilio API call : ' + context.getRemainingTimeInMillis());
        callback(null,{msg:'done. sid => ' + message_sid});
    });
};

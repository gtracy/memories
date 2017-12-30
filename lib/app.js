'use strict';

var twilioClient = require('./twilio');
var config = require('./config');

const express = require('express')
const app = express()
app.get('/', (req, res) => {
    twilioClient.sendSMS('Hello, Greg. Your Lambda job is working. :)',config.NOTIFICATION_SMS_NUMBER, (err) => {
        if( err ) {
            res.send('Hello, Greg. We failed! ' + err);
        } else {
            res.send('Hello, Greg. Message sent!');
        }
    })
});

app.listen(3000, () => console.log('Server running... listening on port 3000'))

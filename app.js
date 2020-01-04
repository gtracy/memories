'use strict';

require('dotenv-json')();
const async = require('async');

const twilioClient = require('./twilio');
const Google = require('./google');

// Query spreadsheet data values for today's month and day
//
const queryDates = (data) => {

    // find today's date
    const today = new Date();
    const this_year = today.getFullYear();
    today.setYear(0);
    today.setHours(0, 0, 0, 0);

    // stash row numbers when we find matching dates
    let date_rows = [];
    data.forEach((timestamp, index) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        date.setYear(0);
        date.setHours(0, 0, 0, 0);
        if (this_year !== year && date.getTime() === today.getTime()) {
            // skip the header row
            date_rows.push(index + 2);
        }
    });
    return date_rows;
}

// Fetch specific message
exports.handler = async (event, context) => {

    // setup a google api client
    const google = new Google();
    const response = await google.init();

    // fetch the memory dates from the sheet
    console.log('ok, ready. go get the data sheet');
    let date_rows;
    try {
        const data = await google.getSheetData(process.env.GOOGLE_SHEET_ID, process.env.GOOGLE_SHEET_RANGE);
        date_rows = queryDates(data);
        console.dir('Query rows for matchind date : ' + date_rows);
    } catch (e) {
        console.error(e);
    }

    // re-fetch the a random message for this date
    const picker = Math.floor(Math.random() * date_rows.length);
    const cell = "Form Responses 1!A" + date_rows[picker] + ":B" + date_rows[picker];
    const message_data = await google.getSheetData(process.env.GOOGLE_SHEET_ID, cell);

    const message = message_data[0][1];
    const year = new Date(message_data[0][0]).getFullYear();
    const sms = year + " : " + message;
    console.dir('results -> ' + sms);

    // send out the message via SMS
    const sid = await twilioClient.sendSMS(sms, process.env.RECIPIENT_PHONE);
    console.log('Twilio send. ' + sid);

};

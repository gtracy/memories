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
exports.handler = async (sheet_row, event, context) => {

    // setup a google api client
    const google = new Google();
    const response = await google.init();

    // fetch the memory dates from the sheet
    console.log('ok, ready. go get the data sheet');
    let date_rows;
    try {
        const data = await google.getSheetData(process.env.GOOGLE_SHEET_ID, process.env.GOOGLE_SHEET_RANGE);
        // find all of the rows with a matching date unless a specific row was specified
        if( sheet_row ) {
            date_rows = [sheet_row];
        } else{
            date_rows = queryDates(data);
        }
        console.dir('Query rows for matchind date : ' + date_rows);
    } catch (e) {
        console.error(e);
    }

    // re-fetch a random message for this date
    const picker = Math.floor(Math.random() * date_rows.length);
    const cell = "Form Responses 1!A" + date_rows[picker] + ":C" + date_rows[picker];
    const message_data = await google.getSheetData(process.env.GOOGLE_SHEET_ID, cell);
    console.dir(message_data);

    // assemble the message details
    const message = message_data[0][1];
    const year = new Date(message_data[0][0]).getFullYear();
    const sms = year + " : " + message;
    console.dir('message -> ' + sms);

    // determine if there is media to include. if so, we have to transform the 
    // link found in the sheet to be a link with the appropriate image content type
    // Example sheet link: https://drive.google.com/open?id=1ch51tiEYBdALwwmwUpSznmuVF47hUIqn
    // Example transformation: https://drive.google.com/uc?export=view&id=1ch51tiEYBdALwwmwUpSznmuVF47hUIqn
    const media = message_data[0][2];
    let media_url = undefined;
    if( media ) {
        media_url = "https://drive.google.com/uc?export=view&id=" + media.split('id=')[1];
    }
    console.log('media -> ' + media_url);

    // send out the message via SMS
    try {
        let twilio_result = await twilioClient.sendSMS(sms, process.env.RECIPIENT_PHONE, media_url);
        console.log('Twilio send success! ' + twilio_result.accountSid);
    } catch(e) {
        console.log('failed to send sms');
        console.dir(e);
    }

};

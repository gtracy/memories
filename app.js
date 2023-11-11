'use strict';

require('dotenv-json')();
const createPresignedUrl = require('./s3');
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
    let message_data;
    try {
        const data = await google.getSheetData(process.env.GOOGLE_SHEET_ID, process.env.GOOGLE_SHEET_RANGE);
        // find all of the rows with a matching date unless a specific row was specified
        if( sheet_row ) {
            date_rows = [sheet_row];
        } else{
            date_rows = queryDates(data);
        }
        console.dir('Query rows for matchind date : ' + JSON.stringify(date_rows));

        // re-fetch a random message for this date
        const picker = Math.floor(Math.random() * date_rows.length);
        const cell = "Form Responses 1!A" + date_rows[picker] + ":C" + date_rows[picker];
        message_data = await google.getSheetData(process.env.GOOGLE_SHEET_ID, cell);
        console.dir(message_data);
    } catch (e) {
        console.error(e);
    }

    // assemble the message details
    const message = message_data[0][1];
    const year = new Date(message_data[0][0]).getFullYear();
    const sms = year + " : " + message;
    console.dir('message -> ' + sms);

    let media_url = undefined;
    if( message_data[0][2] ) {
        // example: https://memories-photo-archive.s3.us-east-2.amazonaws.com/2023-november-9.jpg
        const media_cell = message_data[0][2];
        const objectKey = media_cell.substring(media_cell.lastIndexOf('/') + 1);
        console.log('objectKey -> ' + objectKey);
        media_url = await createPresignedUrl(objectKey);
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

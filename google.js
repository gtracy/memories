
const {google} = require('googleapis');
const util = require('util')

const Google = function() {
    var self = this;

    const auth = new google.auth.GoogleAuth({
        // Scopes can be specified either as an array or as a single, space-delimited string.
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    this.init = async function() {

        self.oauth2Client = await auth.getClient();            
        this.sheets = google.sheets({
            version: 'v4',
            auth: self.oauth2Client,
        });
    };    
};

/**
 * Fetch a list of data spreadsheets
 *
 */
Google.prototype.getSheetData = async function(sheetID, range) {

    try {

        let response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: sheetID,
            range: range
        });
        console.log('... data read in');
        return response.data.values;

    } catch (e) {
        throw(e);
    }

};

module.exports = Google;

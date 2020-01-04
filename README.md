# memories
periodic SMS notifications that delivers notes from the past

## background
this app connects to a google sheet that stores daily diary entries i write via a google form. it dips into the archives everyday to deliver me a messaage as a reminder of gratitude, lessons learns and experiences gained. 

in its geekiest form, it's a lambda function with a datastore backed by google sheets and a UI built with twilio. 

## configuration
the app depends on two configuration files that store credentials and app settings to execute. 

### google oauth
the google api uses process.env.GOOGLE_APPLICATION_CREDENTIALS to point to your credential file. This should be the same json file you download from the [google console](https://support.google.com/googleapi/answer/6158862?hl=en). 

to make deployment easier, i moved this file - creds.json - into this repo although it isn't shown here. 

### app config
.env.json lists out instance specific configuration for the google sheet and twilio api settings. 

## running locally
```
npm install
node app.local.js
```

## deploying to aws
this repo is setup to deploy via [claudia](https://claudiajs.com/).

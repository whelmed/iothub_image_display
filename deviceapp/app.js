'use strict';

var Protocol    = require('azure-iot-device-mqtt').Mqtt,
    Client      = require('azure-iot-device').Client,
    Message     = require('azure-iot-device').Message,
    creds       = require('./creds.js'),
    os          = require('os'),
    client      = null,
    request     = require('request');

const exec = require('child_process').exec;    

function main() {

    // Create the connection string
    var con = Object.keys(creds).reduce(function(prev, curr, i) {
        if (prev) {
            prev += ';';
        }
        return prev + curr + '=' + creds[curr];
    }, '');

    // open a connection to the device
    client = Client.fromConnectionString(con, Protocol);
    client.open(connect);
}

// The function to run when the IoT Hub client connects
function connect(err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
        return;
    } 

    // Set up generic client listenters
    client.on('error', function (err) {
        console.error(err.message);
    });

    client.on('disconnect', function () {
        client.removeAllListeners();
    });   

    // Listen for IoT Hub sending messages
    client.on('message', function(msg) {
        if (os.platform() === 'linux') {
            download(msg.imageUrl, function() {
                // Kill any image viewers
                var file = '/tmp/' + getFileName(uri);
                exec(`pkill fbi -2 && fbi -T 2 ${file}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return;
                    }
                    
                });
            });
        }
        console.log('Feedback message:')
        console.log(msg.getData().toString('utf-8'));
    });
}

function getFileName(uri) {
    var urlSections = uri.split('/');
    return urlSections[urlSections-1];
}

function download(uri, callback) {
  console.log("Downloading new image from: ", uri);
  
  request.head(uri, function(err, res, body) {
      
    var r = request(uri).pipe(fs.createWriteStream('/tmp/' + getFileName(uri)));
    r.on('close', callback);
    r.on('error', error);
  });
}

main();
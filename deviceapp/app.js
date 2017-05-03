'use strict';

var Protocol    = require('azure-iot-device-mqtt').Mqtt,
    Client      = require('azure-iot-device').Client,
    Message     = require('azure-iot-device').Message,
    creds       = require('./creds.js'),
    client      = null;
    
    

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
    client.on('message', function(message) {
        console.log('Feedback message:')
        console.log(msg.getData().toString('utf-8'));
    });
}
main();
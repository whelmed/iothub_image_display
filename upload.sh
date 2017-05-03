#!/bin/bash

if [ ! -z "$1" ] 
then
    curl -F "image=@$1" https://ca-iot-hub-solution.azurewebsites.net/api/HttpTriggerCSharp/device/DemoDevice?code=8Qds6ZMYAMGroSfXFH7P8ESpZDRN/3cae5oCCbX1Uhg6jskav5HEag== -v
else
    echo "Usage upload.sh path/file.ext"
fi
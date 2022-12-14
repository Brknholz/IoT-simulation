import fs from "fs";
import { parse } from "csv-parse";
import { argv, config } from "process";
import * as mqtt from 'mqtt';
import { response } from "express";
import { error } from "console";

const client = mqtt.connect('mqtt://test.mosquitto.org', { protocol: 'mqtt' });

const dataNameArray = ['Array_of_Things_Locations.csv', 'Beach_Weather_Stations_-_Automated_Sensors.csv', 'private_mobile_devices.csv', 'private_static_devices.csv', 'loop_test.csv']

const datasets = {
    set0: [],
    set1: [],
    set2: [],
    set3: [],
    set4: []
}

const LoadDatasetsToArrays = async (fileName) => {
    console.log(fileName)
    fs.createReadStream(`./datasets/${fileName}`)
        .pipe(
            parse({
            delimiter: ",",
            columns: true,
            ltrim: true,
            })
        )
        .on("data", function (row) {
            datasets[`set${dataNameArray.indexOf(fileName)}`].push(row);
        })
        .on("error", function (error) {
            console.log('ERROR in loading sets',error.message);
        })
        .on("end", function () {
            console.log("parsed csv data:");
            // console.log(datasets);
        });
        }

const fileName = dataNameArray[argv[2]] //find filename by file number
LoadDatasetsToArrays(fileName) // specified dataset to array
let i = 0;

// get latest configuration from configuration server
function getConfig() {
  return fetch(`http://localhost:3001/configs/src${argv[2]}`)
  .then(response => response.json())
  .then(data => data);
}

// alternative for sending source config
async function sendCofigAlt(config) {
    console.log((config), 'parsed config');
    fetch(`http://localhost:3001/configs/src${argv[2]}`, { 
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json' // text/plain
      },
      body: JSON.stringify(config)
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('config uploaded:', data);
    })
    .catch((error) => {
      console.error('ERROR while uploading:', error);
    });
}

let actualInterval;
runDataTransferInterval();

// dynamic change interval and other parameters
function runDataTransferInterval() {
    let actualConfig;
    clearInterval(actualInterval)
    const fetchConfig = getConfig();
    fetchConfig.then(config => {
        console.log('POBRANY KONFIG: ', config);
        actualConfig = config
        // console.log(actualConfig)
        return actualConfig
    })
    .then(configToSet => {
        sendCofigAlt(configToSet);
        // console.log(configToSet)
        const {interval, method, destination, registerName, share, filter, filterAttributes} = configToSet;
        console.log(interval, method, destination, registerName, share, filter, filterAttributes);

        // implement new method, destination, and interval
        intervalInnerFunction(method, destination, share, filter, filterAttributes);
        actualInterval = setInterval(runDataTransferInterval, interval);
        // const reserveName = `src${argv[2]}`;
    });
    // console.log(actualConfig, 'global saved');
}

function intervalInnerFunction(method, destination, shareSwitch, filter, attributes) {
    console.log(destination)
    const numberOfRows = datasets[`set${Number(argv[2])}`].length;
    let rowInfo = datasets[`set${Number(argv[2])}`][i];
    
    
    console.log(numberOfRows, i);

    // CHECK SHARE SWITCH (ON/OFF)
    console.log(shareSwitch);
    if (shareSwitch) {
      // SENDING TO AGGREGATOR NON FILTERED DATA - separate service
      httpClientPost(rowInfo, `/agg/src${Number(argv[2])}/measurment`, 3004);

      // if filter enabled, change rowInfo structure
      if (filter) {
        const filterData = {
          rowInfo,
          config: {
            rootDestination: destination,
            attributes
          }
        };
  
        destination = `/filtration/recieve/data`;
        rowInfo = filterData;
      }

      if (method === 'http') {
          console.log(rowInfo, 'INSIDE HTTP');
          httpClientPost(rowInfo, destination, filter ? 3005 : 3000);
          i += 1;
      } else if(method === 'mqtt') {
              console.log(`PUBLISHER source:`, rowInfo);
              client.publish(`${destination}`, `${JSON.stringify(rowInfo)}`); //storage/data/send/mqtt
              i += 1;
            };

      if ( i === (numberOfRows - 1) ) {
          console.log('LOOP again');
          i = 0;
      };
    };
};

// HTTP sending function
async function httpClientPost(data, localisation = 'http://localhost:3000/storage/data/send', port = 3000, ) {
    fetch(`http://localhost:${port}${localisation}`, { 
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'application/json' // text/plain
  },
  body: JSON.stringify(data)
})
  .then((response) => response.json())
  .then((data) => {
    console.log('Success:', data);
  })
  .catch((error) => {
    // console.error(`Error POST on port:${port}:`, error);
    console.error(`Error POST on port:${port}:`, error.name);
  });
};


/*
before sending data from source, check if filtering is enabled.
If filtering is enabled, send data frame to the filterig app endpoint in pocket with destination address and 
*/

//change method for status checking
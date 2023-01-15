import express from 'express';
import {engine, create} from 'express-handlebars';
import bodyParser from 'body-parser';


import { fileURLToPath } from 'url';
import path from 'path'

import * as mqtt from 'mqtt';
const client = mqtt.connect('mqtt://test.mosquitto.org', { protocol: 'mqtt' });


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbs = create({});

// register hbs helpers
hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
})

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
    console.error(`Error POST on port:${port}:`, error);
  });
};

function generateRoomTemperature() {
    let randTemp = Math.floor(Math.random() * 100);
    while (randTemp < 16 || randTemp > 25) {
        randTemp = Math.floor(Math.random() * 100);
    }
    return randTemp;
}

async function getSourceAttributes(sourceName) {
    const response = await fetch(`http://localhost:3004/agg/actuator/show/stats/attributes`);
    const attributes = await response.json();
    return attributes;
};


const temperature = [];

function heatRoom(power) {
    return (power/20000 + (power/2000));
}

let roomTemp = generateRoomTemperature();

const initActuatorConfig = {
    active: 0,
    state: 1,
    setRoomTemp: 21,
    heatPower: 1000,
    actualRoomTemp: roomTemp,
    status: '',
    filter: false,
    method: 'http',
    destination: '/storage/recieve/actuator',
    registerName: 'actuator',
    filterAttributes: []
};


// interval = 30min in real
setInterval(() => {
    //check if auto mode is enabled

    // temperature bias
    if (Number(initActuatorConfig.active)) {
        if ( initActuatorConfig.actualRoomTemp < (initActuatorConfig.setRoomTemp - 0.5) ) {
            console.log('roomTemp is NOT OK, heating ON', initActuatorConfig.actualRoomTemp);
            initActuatorConfig.status = 'Temperature out of scope, heating ON';
            initActuatorConfig.state = 1;
            initActuatorConfig.actualRoomTemp += heatRoom(initActuatorConfig.heatPower);
            temperature.push(initActuatorConfig.actualRoomTemp);
            
        } else {
            initActuatorConfig.actualRoomTemp -= 0.2;
            initActuatorConfig.status = 'Temperature ok, heating OFF';
            console.log(`roomTemp is OK, cooling ${initActuatorConfig.actualRoomTemp}`)
            temperature.push(initActuatorConfig.actualRoomTemp);
        }
    } else {
        initActuatorConfig.actualRoomTemp -= 0.2;
        temperature.push(initActuatorConfig.actualRoomTemp);
        // console.log(initActuatorConfig.actualRoomTemp);
    }

    // httpClientPost(initActuatorConfig, '/storage/recieve/actuator', 3000);
    httpClientPost(initActuatorConfig, '/agg/actuator/measurment', 3004);

    let rowInfo = initActuatorConfig;

    let destination = initActuatorConfig.destination;
    if (initActuatorConfig.filter) {
        // SENDING TO AGGREGATOR NON FILTERED DATA - separate service
        httpClientPost(rowInfo, `/agg/actuator/measurment`, 3004);
        
        // if filter enabled, change rowInfo structure
        if (initActuatorConfig.filter) {
          const filterData = {
            rowInfo: initActuatorConfig,
            config: {
              rootDestination: destination,
              attributes: initActuatorConfig.filterAttributes
            }
          };
    
          destination = `/filtration/recieve/data`;
          rowInfo = filterData;
        }
    }

    if (initActuatorConfig.method === 'http') {
        console.log(rowInfo, 'INSIDE HTTP');
        httpClientPost(rowInfo, destination, initActuatorConfig.filter ? 3005 : 3000);
    } else if(initActuatorConfig.method === 'mqtt') {
        console.log(`PUBLISHER source:`, rowInfo);
        client.publish(`${destination}`, `${JSON.stringify(rowInfo)}`); //storage/data/send/mqtt
    };
}, 2000);

const app = express();
app.use(express.json());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/actuator/config/info', (req, res) => {
    res.json(initActuatorConfig);
})

app.get('/actuator/config', async (req, res) => {
    // res.json(initActuatorConfig);
    getSourceAttributes('actuator')
    .then(attributes => {
        res.render('actuator_home', { 
            config: initActuatorConfig,
            sourceAttributes: attributes
        });
    })
});

app.post('/actuator/config', (req, res) => {
    const {change_active, change_setRoomTemp, change_heatPower} = req.body;
    console.log(change_active, change_setRoomTemp, change_heatPower);
    initActuatorConfig.active = req.body.stateOn ? req.body.stateOn : initActuatorConfig.active;
    initActuatorConfig.active = req.body.stateOff ? req.body.stateOff : initActuatorConfig.active;
    initActuatorConfig.heatPower = req.body.heatPower ? req.body.heatPower : initActuatorConfig.heatPower;
    initActuatorConfig.setRoomTemp = req.body.roomTemp ? req.body.roomTemp : initActuatorConfig.setRoomTemp;
    initActuatorConfig.method = req.body.method ? req.body.method : initActuatorConfig.method;
    initActuatorConfig.destination = req.body.destination ? req.body.destination : initActuatorConfig.destination;

    // initActuatorConfig.filter = req.body.filtering ? req.body.filtering : initActuatorConfig.filter;

    try {
        if (req.body.filtered_att.length !== 0) {
            initActuatorConfig.filterAttributes = [...new Set(req.body.filtered_att)];
        } 
    } catch (err) {
        console.log('no length ERROR');
    }

    switch(req.body.filtering) {
        case 'on':
            initActuatorConfig.filter = true;
            break;
        case 'off':
            initActuatorConfig.filter = false;
            break;
        default:
            initActuatorConfig.filter = initActuatorConfig.filter;
            break;
    }

    console.log(initActuatorConfig);
    res.redirect('/actuator/config');
})

app.listen(3006, 'localhost');



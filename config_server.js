import bodyParser from 'body-parser';
import express from 'express';
import {engine} from 'express-handlebars';

import { fileURLToPath } from 'url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server config
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

// storage
let onlineSources = [];
let dynamicOnlineSources = [];
const actualSourceConfigs = {}; // online sources configs
const dynamicSourceConfigs = {};

// update lists of online sources and actual configs
setInterval(() => {
    onlineSources = [...dynamicOnlineSources]
   
    dynamicOnlineSources.length = 0;
}, 2000)

// initial configuration for any source:
const initialSourceConfig = {
    interval: 3000,
    method: 'http',
    destination: '/storage/recieve/inital',
    registerName: 'src1'
}

// REST endpoints
app.get('/', (req, res) => {
    res.render('home')
});

app.get('/configs/online', (req, res) => {
    res.send(onlineSources);
})

app.get('/configs/online/list', (req, res) => {
    res.send(actualSourceConfigs);
})

// post online source here and store each config inside actual source configs
app.post('/configs/:sourceName', (req, res) => {
    const sourceConfigName = req.params.sourceName;
    console.log(req.body, 'recieved configuration');
    actualSourceConfigs[sourceConfigName] = req.body;
    const onlineSourceName = req.params.sourceName;
    if (dynamicOnlineSources.includes(onlineSourceName) === false) {
        dynamicOnlineSources.push(onlineSourceName);
    }
    // console.log(onlineSources)
    res.json(`recieved config from: ${req.params.sourceName}`)
})

app.get('/configs/:sourceName', (req, res) => {
    const registerConfig = JSON.parse(JSON.stringify(initialSourceConfig));
    registerConfig.registerName = req.params.sourceName;
    if (actualSourceConfigs.hasOwnProperty(req.params.sourceName)) {
        console.log('ACTUAL CONFIG IS AVAILABLE!!!!!!!!')
        registerConfig.interval = actualSourceConfigs[req.params.sourceName].interval;
        registerConfig.method = actualSourceConfigs[req.params.sourceName].method;
        registerConfig.destination = actualSourceConfigs[req.params.sourceName].destination;
        // console.log(registerConfig)
        // console.log(actualSourceConfigs[req.params.sourceName]);
    }
    // res.send(initialSourceConfig);
    // console.log(JSON.stringify(initialSourceConfig))
    res.send(registerConfig);
    // console.log(registerConfig);
})

app.get('/configs/:sourceName/change', (req, res) => {
    res.render('config_form', {
        sourceName: req.params.sourceName,
        sourceConfig: JSON.stringify(actualSourceConfigs[req.params.sourceName])
    });
})

app.post('/configs/:sourceName/change', (req, res) => {

    const {interval, destination, method} = req.body;
    console.log(interval, destination, method)

    const configSourceName = req.params.sourceName;
    actualSourceConfigs[configSourceName].interval = interval;
    actualSourceConfigs[configSourceName].destination = destination;
    actualSourceConfigs[configSourceName].method = method;
    res.render('config_form', {
        isUploaded: true

    })
})

app.listen(3001, 'localhost');
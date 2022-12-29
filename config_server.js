import bodyParser from 'body-parser';
import express from 'express';
import {engine, create} from 'express-handlebars';

import { fileURLToPath } from 'url';
import path from 'path'
import { config } from 'process';

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

const hbs = create({});

// register hbs helpers
hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
})

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
    registerName: 'src1',
    share: true,
    filter: false,
    filterAttributes: []
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
        console.log('ACTUAL CONFIG IS AVAILABLE!')
        registerConfig.interval = actualSourceConfigs[req.params.sourceName].interval;
        registerConfig.method = actualSourceConfigs[req.params.sourceName].method;
        registerConfig.destination = actualSourceConfigs[req.params.sourceName].destination;
        registerConfig.share = actualSourceConfigs[req.params.sourceName].share;
        registerConfig.filter = actualSourceConfigs[req.params.sourceName].filter;
        registerConfig.filterAttributes = actualSourceConfigs[req.params.sourceName].filterAttributes;
        // console.log(registerConfig)
        // console.log(actualSourceConfigs[req.params.sourceName]);
    }
    // res.send(initialSourceConfig);
    // console.log(JSON.stringify(initialSourceConfig))
    res.send(registerConfig);
    // console.log(registerConfig);
})

// get source attributes for filtering
async function getSourceAttributes(sourceName) {
    const response = await fetch(`http://localhost:3004/agg/${sourceName}/show/stats/attributes`);
    const attributes = await response.json();
    return attributes;
};

app.get('/configs/:sourceName/change', async (req, res) => {
    const sourceName = req.params.sourceName;
    getSourceAttributes(sourceName)
    .then(attributes => {
        res.render('config_form', {
            sourceName: req.params.sourceName,
            sourceConfig: (actualSourceConfigs[req.params.sourceName]),
            sourceAttributes: attributes
        });
    })
})

// recieve new configuration parameters from html form
app.post('/configs/:sourceName/change', (req, res) => {

    const {interval, destination, method, switchStatus, filtering, filtered_att} = req.body;
    console.log(interval, destination, method, switchStatus);
    console.log('switch: ', switchStatus, Boolean(switchStatus));
    try {
        console.log(`filtered attributes: ${filtered_att}, length = ${filtered_att.length}`);
    } catch {
        console.log('no length in filtered attributes!')
    }
    
    const configSourceName = req.params.sourceName;
    actualSourceConfigs[configSourceName].interval = interval !== '' ? interval : initialSourceConfig.interval;
    actualSourceConfigs[configSourceName].destination = destination !== '' ? destination : initialSourceConfig.destination;
    actualSourceConfigs[configSourceName].method = method !== '' ? method : initialSourceConfig.method;
    // actualSourceConfigs[configSourceName].filter_attributes = filtered_att.length !== 0 ? set(filtered_att) : initialSourceConfig;

    try {
        if (filtered_att.length !== 0) {
            actualSourceConfigs[configSourceName].filterAttributes = [...new Set(filtered_att)];
        } 
    } catch (err) {
        console.log('no length ERROR');
    }

    switch(switchStatus) {
        case 'on':
            actualSourceConfigs[configSourceName].share = true;
            break;
        case 'off':
            actualSourceConfigs[configSourceName].share = false;
            break;
        default:
            actualSourceConfigs[configSourceName].share = initialSourceConfig.share;
            break;
    }
    
    switch(filtering) {
        case 'on':
            actualSourceConfigs[configSourceName].filter = true;
            break;
        case 'off':
            actualSourceConfigs[configSourceName].filter = false;
            break;
        default:
            actualSourceConfigs[configSourceName].filter = actualSourceConfigs[configSourceName].filter;
            break;
    }
    // res.render('config_form', {
    //     isUploaded: true,
    //     sourceName: req.params.sourceName,
    //     sourceConfig: JSON.stringify(actualSourceConfigs[req.params.sourceName])
    // })
    res.redirect('back');
});

app.listen(3001, 'localhost');
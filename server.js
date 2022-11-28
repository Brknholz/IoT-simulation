//SERVER
import express from 'express';

const app = express();

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Server site')
})

// initial endpoint for all sources when they have very first run procedure
app.post('/storage/recieve/inital', (req, res) => {
    const recievedData = req.body;
    console.log(`SERVER recieved on initial endpoint - Please change endpoint =>`);
    console.log(recievedData), typeof(recievedData);
    res.json('server OK');
});

app.post('/storage/recieve/source0', (req, res) => {
    const recievedData = req.body;
    console.log(`SERVER recieved on source1 =>`);
    console.log(recievedData), typeof(recievedData);
    res.json('server OK');
});

app.post('/storage/recieve/source1', (req, res) => {
    const recievedData = req.body;
    console.log(`SERVER recieved on source2 =>`);
    console.log(recievedData), typeof(recievedData);
    res.json('server OK');
})

app.post('/storage/recieve/source2', (req, res) => {
    const recievedData = req.body;
    console.log(`SERVER recieved on source3 =>`);
    console.log(recievedData), typeof(recievedData);
    res.json('server OK');
})

app.post('/storage/recieve/source3', (req, res) => {
    const recievedData = req.body;
    console.log(`SERVER recieved on source4 =>`);
    console.log(recievedData), typeof(recievedData);
    res.json('server OK');
})

//DEFAULT endpoint
app.post('/storage/data/send', (req, res) => {
    const recievedData = req.body;
    console.log(`SERVER recieved =>`);
    console.log(recievedData), typeof(recievedData);
    res.json('server OK');
})

// IF MQTT SUBSCRIBE
import * as mqtt from 'mqtt';

const client = mqtt.connect('mqtt://test.mosquitto.org', {protocol: 'mqtt'})

client.subscribe('storage/data/send/mqtt');
client.subscribe('storage/mqtt/source0');
client.subscribe('storage/mqtt/source1');
client.subscribe('storage/mqtt/source2');
client.subscribe('storage/mqtt/source3');

let recievedData = '';
client.on("message", async function (topic, message) {
    recievedData = JSON.parse(message)
    console.log(`SUBSCRIBER: on ${topic}`, recievedData);
})

app.listen(3000, () => console.log(3000))
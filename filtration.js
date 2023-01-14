import express from 'express';

async function httpClientPost(data, localisation, port = 3000) {
    fetch(`http://localhost:${port}${localisation}`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error(`Error POST on port:${port}:`, error);
    });
};

const app = express();

app.use(express.json());

// recieve data with filtering configuration if source has filtration enabled.
// filtration only with HTTP - MQTT not implemented
app.post('/filtration/recieve/data', (req, res) => {
    const {rowInfo} = req.body;
    const {rootDestination, attributes} = req.body.config;
    
    const filtered = Object.keys(rowInfo)
        .filter(key => attributes.includes(key))
        .reduce((obj, key) => {
            obj[key] = rowInfo[key];
            return obj
        }, {});

    console.log(filtered, rootDestination);

    // forward data from filter
    httpClientPost(filtered, rootDestination);
})

app.listen(3005, 'localhost');
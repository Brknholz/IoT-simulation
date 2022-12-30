import express from 'express';
import { engine } from 'express-handlebars';

import { fileURLToPath } from 'url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));

// store data in array
const storage = { };

app.get('/', (req, res) => {
    res.send(storage);
});

app.get('/agg/:srcName/show/stats', (req, res) => {
    const sourceName = req.params.srcName;
    const lastNumber = req.query.lastNumber;
    const filterAttribute = req.query.getAttribute;
    try {
        const lastMs = [storage[sourceName][`last${lastNumber}`].slice(-1)[0].slice(0, -1)];
    const shareDataTimestamp = 
        storage[sourceName][`last${lastNumber}`].slice(-1)[0].slice(-1)[0];
    const filterData = [];
    for (let measure of lastMs[0]) {
        filterData.push(Number(measure[filterAttribute]));
    }
    const max = Math.max(...filterData);
    const min = Math.min(...filterData);
    const mean = filterData.reduce((acc, curr) => acc + curr, 0) / filterData.length;
    res.render('show_stats', {
        rows: lastNumber,
        shareData: filterData,
        attribute: filterAttribute,
        timestamp: shareDataTimestamp,
        max: max,
        min: min,
        average: mean
    });
    } catch {
        res.render('show_stats');
    }
});

app.get('/agg/:SrcName/show/stats/attributes', (req, res) => {
    const sourceName = req.params.SrcName;
    res.json((storage[sourceName]['attributes']));
    console.log('get att')
    // res.send(JSON.stringify(storage[sourceName]['attributes']));
})

app.get('/agg/:srcName/show', (req, res) => {
    const sourceName = req.params.srcName;
    const rowsNumber = req.query.getData;
    console.log(sourceName, rowsNumber);
    console.log(storage[sourceName]);
    
    try {
        const shareData = 
            [storage[sourceName][`last${rowsNumber}`].slice(-1)[0].slice(0, -1)];
        const shareDataTimestamp = 
            storage[sourceName][`last${rowsNumber}`].slice(-1)[0].slice(-1)[0];
        console.log('awaiting for data');
        console.log(shareDataTimestamp);
        // console.log('original', shareData);
        res.render('show_stored_data', {
            shareData: shareData,
            rows: rowsNumber,
            srcName: sourceName,
            attributes: storage[sourceName]['attributes'],
            package: storage[sourceName][`last${rowsNumber}`],
            timestamp: shareDataTimestamp
        });
    } catch {
        res.render('show_stored_data', {
            shareData: [],
            rows: rowsNumber,
            srcName: sourceName,
            attributes: storage[sourceName]['attributes'],
            package: storage[sourceName][`last${rowsNumber}`]
        });
    }
});

app.post('/agg/:srcName/measurment', (req, res) => {
    const row = req.body;
    const sourceName = req.params.srcName;
    // console.log(row);

    if (!storage.hasOwnProperty(sourceName)) {
        storage[sourceName] = {};
        storage[sourceName]['last5'] = [];
        storage[sourceName]['last10'] = [];
        storage[sourceName]['last15'] = [];
        storage[sourceName]['last20'] = [];

        storage[sourceName]['temp5'] = [];
        storage[sourceName]['temp10'] = [];
        storage[sourceName]['temp15'] = [];
        storage[sourceName]['temp20'] = [];

        storage[sourceName]['attributes'] = Object.keys(row);
    }

    const collectAndStoreLast = lastStore => {
        lastStore = parseInt(lastStore);
        if (storage[sourceName][`temp${lastStore}`].length < lastStore) {
            storage[sourceName][`temp${lastStore}`].push(row);
        } else {
            const curr = new Date();
            const timestamp = 
            `${curr.getDate()}/${curr.getMonth()}/${curr.getFullYear()} \
            ${curr.getHours()}:${('0'+curr.getMinutes()).slice(-2)}::${('0'+curr.getSeconds()).slice(-2)}`;

            storage[sourceName][`temp${lastStore}`].push(timestamp);
            const pushPackage = storage[sourceName][`temp${lastStore}`];
            storage[sourceName][`last${lastStore}`].push(pushPackage);
            
            storage[sourceName][`temp${lastStore}`] = [];
        }
    }

    collectAndStoreLast(5);
    collectAndStoreLast(10);
    collectAndStoreLast(15);
    collectAndStoreLast(20);

    res.status(200);
});

app.listen(3004, 'localhost');
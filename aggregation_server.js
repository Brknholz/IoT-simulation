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
const storage = {

}

app.get('/', (req, res) => {
    res.send(storage);
})

app.get('/agg/:srcName/show', (req, res) => {
    const sourceName = req.params.srcName;
    const rowsNumber = req.query.getData;
    console.log(sourceName, rowsNumber);
    console.log(Object.keys(storage[sourceName][0]));
    const shareData = storage[sourceName].slice(-rowsNumber);
    res.render('show_stored_data', {
        shareData: shareData,
        rows: rowsNumber,
        labels: Object.keys(storage[sourceName][0]),
        srcName: sourceName
    });
})

app.post('/agg/:srcName/measurment', (req, res) => {
    const row = req.body;
    const sourceName = req.params.srcName;
    console.log(row)
    if (!storage.hasOwnProperty(sourceName)) {
        storage[sourceName] = [];
        storage[sourceName].push(row);
    } else {
        storage[sourceName].push(row);
    }
    res.send('ok')
})


app.listen(3004, 'localhost')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const mongodb = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const PORT = process.env.PORT || 3000;
let currentDB;
let dbConnectionError = false;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression());

app.get('/api/get', async (req, res) => {
    if (!dbConnectionError) {
        try {
            const contacts = await currentDB.collection('contacts').find().toArray();
            res.send(JSON.stringify(contacts));
        } catch (error) {
            res.status(503).send("Something wrong's happened on server. Please reload the page")
        }
    } else res.status(503).send('Can not connect to DB at the time. Please try again later')
})

app.post('/api/add', (req, res) => {
    currentDB.collection('contacts').insertOne(req.body, (err, result) => {
        if (err) console.log(err);
        res.send(JSON.stringify({status: 'Ok'}));
    });
});

app.put('/api/edit', (req, res) => {
    const contact = {id: Number(req.body.id)}
    const set = {}
    const newKeys = Object.keys(req.body).filter(item => item.substring(0, 2) !== '$$' && item.substring(0, 1) !== '_')
    newKeys.forEach(item => set[item] = req.body[item])
    currentDB.collection('contacts').updateOne(contact, { $set: set }, (err, res) => {
        if (err) console.log(err);
    })
});

app.delete('/api/delete/:id', (req, res) => {
    const contact = {id: Number(req.params.id)}
    currentDB.collection('contacts').deleteOne(contact, (err, result) => {
        if (err) console.log(err);
    });
})

MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) dbConnectionError = true;
    console.log("Connected correctly to DB server");
    dbConnectionError = false;
    currentDB = db.db("cluster0");
    app.listen(PORT, () => console.log(`Server started on ${PORT} port`));

});

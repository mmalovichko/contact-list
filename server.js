const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const mongodb = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://AndrewBubnov:acnot88_0175A@cluster0-shard-00-00-edszp.mongodb.net:27017,cluster0-shard-00-01-' +
    'edszp.mongodb.net:27017,cluster0-shard-00-02-edszp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
const PORT = process.env.PORT || 3000;
let currentDB;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression());

app.get('', async (req, res) => {
    const contacts = await currentDB.collection('contacts').find().toArray()
    res.send(contacts);
})

app.post('/api', (req, res) => {
    currentDB.collection('contacts').insertOne(req.body, (err, result) => {
        if (err) console.log(err);
        res.send(req.body);
    });
});

app.put('/api', (req, res) => {
    const set = {}
    const newKeys = Object.keys(req.body).filter(item => item.substring(0, 2) !== '$$' && item.substring(0, 1) !== '_')
    newKeys.forEach(item => set[item] = req.body[item])
    currentDB.collection('contacts').updateOne({_id: mongodb.ObjectID(req.body._id)}, { $set: set }, (err, result) => {
        if (err) console.log(err);
        res.send(200)
    })
});

app.delete('/api/:id', (req, res) => {
    currentDB.collection('contacts').deleteOne({_id: mongodb.ObjectID(req.params.id)}, (err, result) => {
        if (err) console.log(err);
        res.send(200)
    });
})

MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) throw Error;
    console.log("Connected correctly to DB server");
    currentDB = db.db("cluster0");
    app.listen(PORT, () => console.log(`Server started on ${PORT} port`));

});

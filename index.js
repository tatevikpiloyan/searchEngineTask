import express from "express"
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 3000;
const namePost = "/file";
const nameGet = "/search";
const app = express();

const url = 'mongodb://localhost:27017';
const clientGlob = new MongoClient(url);
clientGlob.connect((err, res) => {
    if (err) {
        console.log(err);
    }
})
const db =  clientGlob.db('Search');
const documents = db.collection('documents');


app.use(express.urlencoded({extended : true}));

app.get(nameGet, async (req, res) => {
    let queryData = req.query.content;
    let sendData = [];
    await documents.find({content: {$regex : queryData}}).toArray((err, text) => {
        if (err) {
            console.log(err);
        }
        text.forEach(doc => sendData.push(doc.name));
        res.send(sendData);
    })
});

app.post(namePost, (req, res) => {
    const fileName = req.body.name;
    const fileContent = req.body.content;
    
    try {
        documents.find({name: fileName}).toArray((err, text) => {
            text.length === 0 ? documents.insertOne({name : fileName, content : fileContent}, (err, result) => {console.log(result)})
                            : documents.updateOne({name: fileName}, {$set: {content: fileContent}}, {upsert: true})
        })
    } catch(e) {
        console.log(e);
    }

    res.send("Data received");
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
});
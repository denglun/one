// const Mongorito = require('mongorito');
// const Model = Mongorito.Model;
const MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGO_URL;
const uuid = require('uuid');



module.exports = {
    all: callback => {
        MongoClient.connect(url, (err, db) => {
            // db.stats((err, stats) => {
            //     console.dir(stats);
            // });
            db.collection('posts').find({}).toArray().then(posts => {
                callback(posts);
                db.close();
            }, err => {
                console.log(err.stack)
            });
        });
    },
    add: ({title, content}, callback) => {
        MongoClient.connect(url, (err, db) => {
            const doc = { id: uuid(), time: Date.now(), title, content };
            db.collection('posts').insert(doc, (err, result) => {
                callback(result.ops[0]);
                db.close();
            });
        });
    },
    remove: (id, callback) => {
        MongoClient.connect(url, (err, db) => {
            db.collection('posts').deleteOne({ id }, (err, result) => {
                if (!err) {
                    callback();
                }
            });
            setTimeout(() => {
                db.close();
            }, 5000);
        });

    },
    last: callback => {
        MongoClient.connect(url, (err, db) => {
            if(err){
                console.log("MongoDB Connection Failed:", err);
            }
            db.collection('posts').find({}).sort({ 'time': -1 }).toArray().then(
                posts => {
                    callback(posts[0]);
                    db.close();
                }
            );
        });
    }
};
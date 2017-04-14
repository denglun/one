const MongoDb = require("mongodb");
const fs = require("fs");
const MongoClient = MongoDb.MongoClient;
const url = process.env.MONGO_URL;


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
    add: (doc, image, callback) => {
        MongoClient.connect(url, (err, db) => {
            if (image) {
                const data = fs.readFileSync(image.path);
                doc.image = new MongoDb.Binary(data);
                doc.imageType = image.headers['content-type'];
            }
            db.collection('posts').insert(doc, (err, result) => {
                callback(result.ops[0]);
                db.close();
            });
        });
    },
    import: (posts, callback) => {
        function insert(db, blog, callback) {
            db.collection('posts').insert(blog, (err, result) => {
                console.log("imported: ", result.ops[0].title);
                callback();
            });
        };
        MongoClient.connect(url, (err, db) => {
            const requests = posts.reduce((proChain, item) => (
                proChain.then(() => new Promise(resolve => {
                    insert(db, item, resolve);
                }))), Promise.resolve());
            requests.then(() => { db.close(); console.log('done.'); });
        });
    },
    remove: (id, callback) => {
        MongoClient.connect(url, (err, db) => {
            if (err) {
                console.log("MongoDB Connection Failed:", err);
            } else {
                db.collection('posts').deleteOne({ id }, (err, result) => {
                    if (!err) {
                        callback();
                    }
                });
                setTimeout(() => {
                    db.close();
                }, 5000);

            }
        });

    },
    last: callback => {
        MongoClient.connect(url, (err, db) => {
            if (err) {
                console.log("MongoDB Connection Failed:", err);
                return callback(null, err);
            }
            db.collection('posts').find({}).sort({ 'time': -1 }).toArray().then(
                posts => {
                    const post = posts[0];
                    callback(post ? post : {});
                    //  console.log("posts0", posts[0]);
                    db.close();
                }
            );
        });
    },
    find: (condition, callback) => {
        MongoClient.connect(url, (err, db) => {
            if (err) {
                console.log("MongoDB Connection Failed:", err);
                callback(err);
            } else {
                //   console.log("condition", condition);
                db.collection('posts').findOne(condition,
                    (err, post) => {
                        //  console.log("post", post);
                        callback(err, post);
                        db.close();
                    }
                );
            }
        });
    }
};
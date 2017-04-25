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
    import: (file, callback) => {
        function insert(table, blog, resolve, reject) {
            table.findOne({ id: blog.id }, (err, item) => {
                if (item) {
                    console.log("exist: ", blog.title);
                    reject(blog.title);
                } else {
                    if ((blog.hasImage && blog.hasImage === "true") || blog.image) {
                        blog.hasImage = true;
                    } else {
                        blog.hasImage = false;
                    }
                    table.insert(blog, (err, result) => {
                        console.log("imported: ", result.ops[0].title);
                        resolve(result.ops[0].title);
                    });
                }
            });
        };
        MongoClient.connect(url, (err, db) => {
            const table = db.collection('posts');
            table.find({}).toArray().then(posts => {
                posts.map(
                    ({_id, id, title}) => {
                        // console.log("id=", p.id);
                        // console.log("_id", p._id);
                        // console.log("title", p.title);
                        console.log(`${_id},${id},${title}`);
                    });
            });
            const data = fs.readFileSync(file.path).toString();
            const posts = JSON.parse(data);
            const message = [];
            const requests = posts.reduce((proChain, item) => (
                proChain.then(fulfillmentValue => {
                    message.push("imported: " + fulfillmentValue);
                    return new Promise((resolve, reject) => {
                        insert(table, item, resolve, reject);
                    });
                }, rejectedValue => {
                    message.push("skipped: " + rejectedValue);
                })), Promise.resolve()).then(() => {
                    db.close();
                    console.log('done.');
                    callback(message);
                });
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
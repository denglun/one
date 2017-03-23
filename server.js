const http = require('http');
const fetch = require('node-fetch');
const low = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');
const Cryptr = require("cryptr");
const cryptr = new Cryptr('my secret key');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const port = 3001;
const uuid = require('uuid');

const db = low('db.json', {
  storage: fileAsync,
  format: {
    deserialize: (str) => {
      const decrypted = cryptr.decrypt(str);
      const obj = JSON.parse(decrypted);
      return obj;
    },
    serialize: (obj) => {
      const str = JSON.stringify(obj);
      const encrypted = cryptr.encrypt(str);
      return encrypted;
    }
  }
});


app.use(bodyParser.json());

app.get('/posts/:id', (req, res) => {
  const post = db.get('posts')
    .find({ id: req.params.id })
    .value();
  res.send(post)
})

app.get('/posts', (req, res) => {
  res.send(db.get('posts').sortBy('time', 'desc'));
})

const last = res => {
  const post = db.get('posts').last().value();
  res.send(JSON.stringify(post));
}


app.get('/last', (req, res) => {
  last(res);
})

app.post('/posts', (req, res) => {
  //const count = db.get('posts').size().value();
  db.get('posts')
    .push({ id: uuid(), time: Date.now(), title: new Date().toLocaleString(), content: req.body.post })
    .write()
    .then(last(res));
})

app.put('/uuid', (req, res) => {
  console.log("put start.")
  db.get('posts').find().assign({ id: uuid() }).write().then(() => res.send({ msg: 'uuid.' }));

});

app.delete('/posts/:id', function (req, res) {
  db.get('posts')
    .remove({ id: req.params.id })
    .write().then(res.send({ msg: 'deleted!' }));
})


db.defaults({ posts: [] })
  .write()
  .then(() => {
    app.listen(port, hostname, () => console.log('Server is listening'));
  });

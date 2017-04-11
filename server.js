
require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const port = process.env.PORT && Number.parseInt(process.env.PORT) || 3001;
const db = require('./mongodb');
const multiparty = require('multiparty');
const uuid = require('uuid');

app.use(bodyParser.json());

app.get('/posts/:id', (req, res) => {
  db.find({ id: req.params.id }, post => res.send(post));
});

app.get('/posts', (req, res) => {
  db.all(data => res.send(data));
});

app.get('/last', (req, res) => {
  db.last((post, err) => { res.send(err ? { msg: err.message } : post) });
});

app.get("/posts/:id/image", (req, res) => {
  db.find({ id: req.params.id }, (error, result) => {
    if (error) {
      res.send({ msg: error.message });
    } else if (!result || !result.hasImage || !result.imageType || !result.image || !result.image.buffer || !result.image.buffer.length) {
      res.sendStatus(404);
    } else {
      res.contentType(result.imageType);
      res.end(result.image.buffer, "binary");
    }
  });
});

app.post('/posts', (req, res) => {
  var form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.send({ msg: err.message });
    } else {
      const { title, content, hasImage } = fields;
      const doc = { id: uuid(), time: Date.now(), title: title[0], content: content[0], hasImage: hasImage[0] };
      const image = files.image && files.image[0];
      db.add(doc, image, result => res.send(result));
    }
  });

});


app.delete('/posts/:id', function (req, res) {
  db.remove(req.params.id, () => res.send({ msg: 'deleted!' }));
});


app.use(express.static(__dirname + "/build"));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


app.listen(port, hostname, () => console.log('Server is listening on ' + port));

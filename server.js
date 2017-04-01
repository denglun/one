
require('dotenv').config();

const http = require('http');
const fetch = require('node-fetch');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const port = process.env.PORT && Number.parseInt(process.env.PORT) || 3001;
const Cryptr = require("cryptr");
const cryptr = new Cryptr('my secret key');
const db = require('./mongodb');


app.use(bodyParser.json());

app.get('/posts/:id', (req, res) => {
  const post = db.byId(req.params.id);
  res.send(post);
});

app.get('/posts', (req, res) => {
  db.all(data => res.send(data));
});

app.get('/last', (req, res) => {
  db.last(post => res.send(post));
});

app.post('/posts', (req, res) => {
  //console.log("req.body", req.body)
  db.add(req.body, result => res.send(result));
});


app.delete('/posts/:id', function (req, res) {
  db.remove(req.params.id, () => res.send({ msg: 'deleted!' }));
});


app.use(express.static(__dirname + "/build"));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


app.listen(port, hostname, () => console.log('Server is listening on ' + port));

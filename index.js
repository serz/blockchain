const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');

const PORT = 3000;

const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub({blockchain});

setTimeout(() => {
    pubSub.broadcastChain();
}, 1000);

app.use(bodyParser.json());

app.get('/api/blocks', (request, response) => {
    response.json(blockchain.chain);
});

app.post('/api/mine', (request, response) => {
    const {data} = request.body;

    blockchain.addBlock({data});

    response.redirect('/api/blocks');
});

app.listen(PORT);
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./app/blockchain/chain');
const PubSub = require('./app/pubsub');

const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub({blockchain});

let PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${PORT}`;

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
    pubSub.broadcastChain();

    response.redirect('/api/blocks');
});

const syncChains = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('replaced chain synced from root');
            blockchain.replaceChain(rootChain);
        }
    });
};

if (process.env.GENERATE_PEER_PORT === 'true') {
    PORT += Math.ceil(Math.random() * 1000);
}

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
    if (PORT !== 3000) {
        syncChains();
    }
});
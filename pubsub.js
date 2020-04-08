const redis = require('redis');

const CHANNELS = {
    CHAIN: 'CHAIN',
};

class PubSub {
    constructor() {
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscriber.subscribe(CHANNELS.CHAIN);

        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage(channel, message)
        );
    }

    handleMessage(channel, message) {
        // implement message handling
    }
}
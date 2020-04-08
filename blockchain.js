const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data,
        });

        this.chain.push(newBlock);

        return newBlock;
    }

    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i=1; i<chain.length; i++) {
            const {timestamp, lastHash, hash, nonce, difficulty, data} = chain[i];
            const prevBlock = chain[i-1];

            const prevBlockHash = prevBlock.hash;
            const prevBlockDifficulty = prevBlock.difficulty;

            const isLastHashValid = (lastHash === prevBlockHash);

            const validatedHash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);
            const isNewHashValid = (hash === validatedHash);

            const isDifficultyValid = Math.abs(prevBlockDifficulty - difficulty) <= 1;

            if (!isLastHashValid || !isNewHashValid || !isDifficultyValid) {
                return false;
            }
        }

        return true;
    }

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        console.log('replacing chain with: ', chain);
        this.chain = chain;
    }
}

module.exports = Blockchain;
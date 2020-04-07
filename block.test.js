const Block = require('./block');
const {GENESIS_DATA, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const timestamp = 200;
    const lastHash = 'l-hash';
    const hash = 'hash';
    const nonce = 1;
    const difficulty = 1;
    const data = ['blockchain', 'date'];

    const block = new Block({
        timestamp,
        hash,
        lastHash,
        nonce,
        difficulty,
        data,
    });

    it('has a timestamp, hash, last hash, data props', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
        expect(block.data).toEqual(data);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns a Block istance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to be the `hash` of the last block', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('sets a SHA-256 `hash` based on input', () => {
            expect(minedBlock.hash)
                .toEqual(cryptoHash(
                    minedBlock.timestamp,
                    lastBlock.hash,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    data
                ));
        });

        it('sets a `hash` that meets the difficulty criteria', () => {
            expect(minedBlock.hash.substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [
                lastBlock.difficulty + 1,
                lastBlock.difficulty,
                lastBlock.difficulty - 1,
            ];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('raises the difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100,
            })).toEqual(block.difficulty + 1);
        });

        it('lowers the difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100,
            })).toEqual(block.difficulty - 1);
        });
    });
});
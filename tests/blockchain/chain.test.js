const Blockchain = require('../../app/blockchain/chain');
const Block = require('../../app/blockchain/block');
const cryptoHash = require('../../app/utils/crypto-hash');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to chain', () => {
        const newData = 'foo';
        const newBlock = blockchain.addBlock({data: newData});

        expect(newBlock instanceof Block).toBe(true);
        expect(newBlock.data).toEqual(newData)
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with genesis', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake'};

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with genesis and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({data: 'asd'});
                blockchain.addBlock({data: 'qwe'});
                blockchain.addBlock({data: 'zxc'});
            });

            describe('and a lastHash changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'bad';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with wrong difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length  - 1];

                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                    const badBlock = new Block({
                        timestamp,
                        lastHash,
                        hash,
                        nonce,
                        difficulty,
                        data,
                    });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('chain contains valid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({data: 'asd'});
                newChain.addBlock({data: 'qwe'});
                newChain.addBlock({data: 'zxc'});
            });

            describe('when the new chain is not valid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'faked';
                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the new chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs about chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });
});
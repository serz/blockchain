const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 2;

const GENESIS_DATA = {
    timestamp: 1586163056,
    lastHash: '-',
    hash: '76b0ed962e05cde1b28f1a0fb8755a2c',
    data: "genesis",
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
};

const STARTING_BALANCE = 1000;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
};
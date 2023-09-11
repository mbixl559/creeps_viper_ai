
let costs = {};
costs[TOUGH] = 10;
costs[MOVE] = 50;
costs[CARRY] = 50;
costs[ATTACK] = 80;
costs[WORK] = 100;
costs[RANGED_ATTACK] = 150;
costs[HEAL] = 250;
costs[CLAIM] = 600;

let numExtentionsPerRCL = {
    1: 0,
    2: 5,
    3: 10,
    4: 20,
    5: 30,
    6: 40,
    7: 50,
    8: 60
}

export const EXTENTIONS_PER_RCL = numExtentionsPerRCL;

export const BODY_COSTS = costs;

export const ROLE_SIMPLE_MINER = "simple_miner";

export const ROLE_TRANSPORT_MINER = "transport_miner";

export const ROLE_SIMPLE_BUILDER = "simple_builder";

export const ROLE_SIMPLE_UPGRADER = "simple_upgrader";

export const MINING_MODE_TRANSPORT = "transport_mining";

export const MINING_MODE_CONTAINER = "container_mining";
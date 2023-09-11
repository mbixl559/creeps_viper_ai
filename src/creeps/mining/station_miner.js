import { BODY_COSTS } from "../../constants";
import { CreepBase } from "../creep";

export class StationMiner extends CreepBase {
    static body = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];

    source;

    container;

    /** @param {Creep} creep */
    constructor(creep) {
        super(creep);
        this.creep = creep;
    }
    
    static bodyCost() {
        let cost = 0;
        StationMiner.body.forEach((part) => cost += BODY_COSTS[part]);
        return cost;
    }

    run() {
        
    }
}
import { BODY_COSTS } from "../../constants";
import { CreepBase } from "../creep";

export class TransportMiner extends CreepBase {

    static body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];

    /** @property {string} source */
    source;

    /** @property {string} role */
    role;

    creep;
    
    /** @param {Creep} creep */
    constructor(creep) {
        super(creep);
        this.creep = creep;
    }

    static bodyCost() {
        let cost = 0;
        TransportMiner.body.forEach((part) => cost += BODY_COSTS[part]);
        return cost;
    }

    run() {
        if(this.creep.memory.working && this.creep.store[RESOURCE_ENERGY] == 0) {
            this.creep.memory.working = false;
        }
        if(!this.creep.memory.working && this.creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            this.creep.memory.working = true;
        }
        let target = undefined;
        for(var spawnName in Game.spawns) {
            if(Game.spawns[spawnName].room.name == this.creep.room.name) {
                target = Game.spawns[spawnName];
                break;
            }
        }

        if(target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
        } else {
            this.creep.moveTo(target);
        }
    }
    
}
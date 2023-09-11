import { CreepBase } from "./creep";
import { ROLE_SIMPLE_MINER, ROLE_SIMPLE_BUILDER, ROLE_SIMPLE_UPGRADER } from "../constants";

export class SimpleWorker extends CreepBase{

    static body = [WORK, WORK, CARRY, MOVE];

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

    run() {
        if(this.creep.memory.working && this.creep.store[RESOURCE_ENERGY] == 0) {
            this.creep.memory.working = false;
        }
        if(!this.creep.memory.working && this.creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            this.creep.memory.working = true;
        }

        if(this.creep.memory.working) {
            switch(this.creep.memory.role) {
                case ROLE_SIMPLE_MINER: {
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
                        break;
                    }
                }
                case ROLE_SIMPLE_BUILDER: {
                    let targets = this.creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                    if(targets && targets.length > 0) {
                        let closest;
                        if(targets.length == 1) {
                            closest = targets[0];
                        } else {
                            closest = this.creep.pos.findClosestByRange(targets);
                        }
                        if(closest) {
                            if(this.creep.build(closest) == ERR_NOT_IN_RANGE) {
                                this.creep.moveTo(closest);
                                
                            }
                        }
                        break;
                    }
                }
                case ROLE_SIMPLE_UPGRADER: {
                    let target = this.creep.room.controller;
                    if(this.creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                        this.creep.moveTo(target);
                    }
                    break;
                }
            }
        } else {
            if(!this.creep.memory.source) {
                return;
            }
            var source = Game.getObjectById(this.creep.memory.source);
            if(this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(source);
            }
        }
    }
}
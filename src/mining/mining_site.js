import { SimpleWorker } from "../creeps/simple_worker";

export class MiningSite {

    /** @property {Source} source */
    source;

    /** @property {CreepBase[]} workers */
    workers;

    /** @property {number} maxWorkers */
    maxWorkers;

    has_keeper_lair;

    has_container;

    constructor(site) {
        let _this = this;
        this.source = Game.getObjectById(site.source);
        this.workers = [];

        this.maxWorkers = site.maxWorkers;
        if(site.keeper_lair == true) {
            this.has_keeper_lair = true;
        } if(site.keeper_lair == false) {
            this.has_keeper_lair = false;  
        } else {
            var keeper_lairs = this.source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {filter: (structure) => structure.structureType == STRUCTURE_KEEPER_LAIR});
            if(keeper_lairs && keeper_lairs.length > 0) {
                this.has_keeper_lair = true;
            }
        }
    }

    /** @param {CreepBase} worker */
    assignWorker(worker) {
        console.log("assigning worker: " + worker.creep.name);
        if(this.numWorkers() < this.maxWorkers) {
            worker.creep.memory.source = this.source.id;
            this.workers.push(worker);
        }
    }

    numWorkers() {
        return this.workers.length;
    }

    hasSpace() {
        return this.workers.length < this.maxWorkers;
    }

    runWorkers() {
        this.workers.forEach((worker) => {
           worker.run();
        });
    }

    toJson() {
        let workerIds = []
        this.workers.forEach((worker) => {
            workerIds.push(worker.creep.name);
        });
        let json = {
            source: this.source.id,
            workers: workerIds,
            maxWorkers: this.maxWorkers,
            keeper_lair: this.has_keeper_lair
        };
        return json;
    }

}
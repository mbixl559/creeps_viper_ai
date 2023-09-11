import {MINING_MODE_TRANSPORT, ROLE_SIMPLE_MINER, ROLE_SIMPLE_UPGRADER, ROLE_SIMPLE_BUILDER} from "../constants";
import { CreepBase } from "../creeps/creep";
import {MiningSite} from "./mining_site";

export class MiningManager {

    mode;

    sources;

    /** @property {MiningSite[]} sites */
    sites;

    order_callback;

    constructor(sources, order_callback) {
        this.sources = sources;
        this.mode = MINING_MODE_TRANSPORT;
        this.order_callback = order_callback;
        this.sites = [];
        sources.forEach((site) => this.sites.push(new MiningSite(site)));
    }

    available_mining_space() {
        let _this = this;
        let space = 0;
        this.sites.forEach((site) => {
            if(site.has_keeper_lair == true && _this.mode == MINING_MODE_TRANSPORT) {
                console.log("Space: 0 (Has Keeper)");
                space += 0;
                return;
            }
            let site_space = (site.maxWorkers - site.numWorkers());
            console.log("Space: " + site_space + "(" + site.maxWorkers + " - " + site.numWorkers() + ")");
            space += site_space;
        });
        return space;
    }

    max_mining_space() {
        let _this = this;
        let space = 0;
        _this.sites.forEach((site) => {
            if(site.has_keeper_lair == true && _this.mode == MINING_MODE_TRANSPORT) {
                console.log("Space: 0 (Has Keeper)");
                return;
            }
            space += site.maxWorkers;
        });
        return space;
    }

    /** @param {CreepBase} */
    assign_worker(worker) {
        if(worker.creep.memory.source) {
            for(var i in this.sites) {
                if(this.sites[i].source.id == worker.creep.memory.source) {
                    this.sites[i].assignWorker(worker);
                    break;
                }
            }
        } else {
            for(var i in this.sites) {
                if(this.sites[i].hasSpace()) {
                    if(this.mode == MINING_MODE_TRANSPORT && this.sites[i].has_keeper_lair == true) {
                        continue;
                    }
                    this.sites[i].assignWorker(worker);
                    break;
                }
            }
        }

    }


    run() {
        this.sites.forEach((site) => site.runWorkers());
    }

    getSourceJson() {
        let sources = [];
        this.sites.forEach((site) => sources.push(site.toJson()));
        return sources;
    }
}
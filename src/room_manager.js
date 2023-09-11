import { BODY_COSTS, ROLE_SIMPLE_MINER, ROLE_SIMPLE_UPGRADER, ROLE_SIMPLE_BUILDER, ROLE_TRANSPORT_MINER } from "./constants";
import { SimpleWorker } from "./creeps/simple_worker";
import { TransportMiner } from "./creeps/mining/transport_miner";
import { MiningManager } from "./mining/mining_manager";
import {IDGenerator} from "./utils/id_generator";
import {Order} from "./order";

export class RoomManager {
    
    /** @property {Room} room */
    room;

    /** @property {string} id */
    id;

    /** @property {StructureController} room_controller */
    room_controller;

    /** @property {MiningManager} mining_manager */
    mining_manager;

    /** @property {bool} bootstrapping */
    bootstrapping;

    /** @property {Order[]} orders */
    orders;

    /** @property {StructureSpawn[]} spawns */
    spawns;

    /** @param {Room} room */
    constructor(room) {
        if(room.memory.manager_id) {
            this.id = room.memory.manager_id;
        } else {
            this.id = IDGenerator.next_id();
            console.log("Setting room for RoomManager " + this.id);
            room.memory.manager_id = this.id;
        }
        this.room = room;
        this.orders = [];

        this.init();
    }

    init() {
        let _this = this;
        let scanned_sources = this.scan_sources();
        console.log(scanned_sources);
        this.mining_manager = new MiningManager(scanned_sources, this.order_callback);
        this.spawns = this.room.find(FIND_MY_SPAWNS);
        if(this.room.memory.orders) {
            this.room.memory.orders.forEach((order) => {
                if(!order.role) {
                    return;
                }
                _this.orders.push(new Order(order.body, order.role))
            });
        }
    }

    /** @param {Creep} creep */
    getWorker(creep) {
        if(creep.memory.role) {
            if(creep.memory.role == ROLE_SIMPLE_MINER || ROLE_SIMPLE_UPGRADER || ROLE_SIMPLE_BUILDER) {
                return new SimpleWorker(creep);
            }
            if(creep.memory.role == ROLE_TRANSPORT_MINER) {
                return new TransportMiner(creep);
            }
        }
    }

    placeInfrustructure() {
        if(!this.room.memory.source_roads){
            this.layPathsToSources();
        }
        if(!this.room.memory.spawn_roads) {
            var spawn = this.spawns[0];
            var area = this.room.lookAtArea(spawn.pos.y-1, spawn.pos.x - 1, spawn.pos.y+1, spawn.pos.x + 1, true);
            for(var i = 0; i < area.length; i++) {
                var lookObj = area[i];
                var pos = new RoomPosition(lookObj.x, lookObj.y, this.room.name);
                console.log(pos);
                if(lookObj.type == LOOK_CONSTRUCTION_SITES || lookObj.type == LOOK_STRUCTURES) {
                    console.log("structure at " + pos);
                    continue;
                }
                if(lookObj.type == LOOK_TERRAIN && lookObj.terrain == "wall") {
                    console.log("wall at " + pos);
                    continue;
                }
                pos.createConstructionSite(STRUCTURE_ROAD);
            }
            this.room.memory.spawn_roads = true;
        }
    }

    run() {
        let _this = this;
        this.placeInfrustructure();
        var creeps = _.filter(Game.creeps, (creep) => creep.room.id == _this.room.id);
        console.log(creeps.length);
        var miners = [];
        var upgraders = [];
        var builders = [];
        creeps.forEach(function(creep) {
            var worker = _this.getWorker(creep);
            
            if(worker.creep.memory.role == ROLE_SIMPLE_MINER || worker.creep.memory.role == ROLE_TRANSPORT_MINER) {
                miners.push(worker);
            } else if(worker.creep.memory.role == ROLE_SIMPLE_BUILDER) {
                builders.push(worker);
            } else if(worker.creep.memory.role == ROLE_SIMPLE_UPGRADER) {
                upgraders.push(worker);
            }
            _this.mining_manager.assign_worker(worker);
        });
        let activeMiners = miners.length;
        let minerOrders = _.filter(this.orders, (order) => {
            return order.role == ROLE_SIMPLE_MINER || order.role == ROLE_TRANSPORT_MINER
        }).length;
        let numMiners = activeMiners + minerOrders;

        console.log("Miners: " + numMiners + "(Active: " + activeMiners + ", Ordered: " + minerOrders + ")");
        let numUpgraders = upgraders.length + _.filter(this.orders, (order) => order.role == ROLE_SIMPLE_UPGRADER).length;
        console.log("Upgraders: " + numUpgraders);
        let numBuilders = builders.length + _.filter(this.orders, (order) => order.role == ROLE_SIMPLE_BUILDER).length;
        console.log("Builders: " + numBuilders);

        let rcl = this.getRcl();

        let miningRatio = 0.2;
        let upgradeRatio = 0.6;
        let buildRatio = 0.2;

        if(rcl == 2) {
            miningRatio = 0.4;
            upgradeRatio = 0.2;
            buildRatio = 0.4;
        } else if(rcl == 3) {
            
        }

        if(this.getRcl() < 3) {
            this.bootstrapping = true;

            let numWorkers = numMiners + numUpgraders + numBuilders;
            console.log(numWorkers + "/" + this.mining_manager.max_mining_space());
            let max_space = this.mining_manager.max_mining_space();
            let construction_sites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
            if(numWorkers < this.mining_manager.max_mining_space()) {
                if(numMiners == 0 || (numUpgraders > 0 && numMiners < Math.floor(max_space * miningRatio))) {
                    if(_this.getRcl() > 1 && _this.room.energyCapacityAvailable >= TransportMiner.bodyCost()) {
                        console.log("Generating order for " + ROLE_TRANSPORT_MINER);
                        this.orders.push(new Order(TransportMiner.body, ROLE_TRANSPORT_MINER));
                    } else {
                        console.log("Generating order for " + ROLE_SIMPLE_MINER);
                        this.orders.push(new Order(SimpleWorker.body, ROLE_SIMPLE_MINER));
                    }
                    
                } else if(numUpgraders < Math.floor(upgradeRatio * max_space)) {
                    console.log("Generating order for " + ROLE_SIMPLE_UPGRADER);
                    this.orders.push(new Order(SimpleWorker.body, ROLE_SIMPLE_UPGRADER));
                } else if(numBuilders < Math.floor(buildRatio * max_space)){
                    console.log("Generating order for " + ROLE_SIMPLE_BUILDER);
                    this.orders.push(new Order(SimpleWorker.body, ROLE_SIMPLE_BUILDER));
                }
            }
        }
        
        _this.mining_manager.run();

        _this.processOrders();

        this.room.memory.sources = _this.mining_manager.getSourceJson();
    }

    /** @param {string[]} body */
    calculateScreepBodyCost(body) {
        let cost = 0;
        body.forEach((part) => cost += BODY_COSTS[part]);
        return cost
    }

    layPathsToSources() {
        let _this = this;
        var mining_sites = this.mining_manager.sites;
        
        mining_sites.forEach((site) => {
            if(site.has_keeper_lair) {
                return;
            }
            var path = PathFinder.search(_this.spawns[0].pos, {pos: site.source.pos, range: 2});
            path.path.forEach((pos) => {
                var results = _this.room.lookAt(pos.x, pos.y);
                var canBuild = true;
                for(var i = 0; i< results.length; i++ ) {
                    var lookObject = results[i];
                    if(lookObject.type == LOOK_STRUCTURES || lookObject.type == LOOK_CONSTRUCTION_SITES) {
                        canBuild = false;
                        break;
                    }
                    if(lookObject.type == LOOK_TERRAIN && lookObject.terrain == "wall") {
                        canBuild = false;
                        break;
                    }
                }
                if(canBuild) {
                    pos.createConstructionSite(STRUCTURE_ROAD);
                }
            });
        });
        this.room.memory.source_roads = true;
    }

    processOrders() {
        if(this.orders.length > 0) {
            for(var i in this.spawns) {
                var spawn = this.spawns[i];
                if(!spawn.spawning) {
                    var order = this.orders[0];
                    var orderCost = this.calculateScreepBodyCost(order.body);
                    console.log("orderCost: " + orderCost);
                    if(this.room.energyAvailable >= orderCost) {
                        spawn.spawnCreep(order.body, order.role + IDGenerator.next_id(), {memory: {role: order.role}});
                        this.orders.shift();
                        if(this.orders.length == 0) {
                            break;
                        }
                    }
                }
            }
        }

        let orders = [];
        this.orders.forEach((order) => orders.push(order.toJson()));
        this.room.memory.orders = orders;
    }

    getRcl() {
        return this.room.controller.level;
    }

    /** @param {Order} order */
    mining_callback(order) {
        this.orders.push(order);
    }

    scan_sources() {
        if(!this.room.memory.sources || this.room.memory.sources == [] || this.room.memory.sources == "") {
            var scanned_sources = [];
            var sources = this.room.find(FIND_SOURCES_ACTIVE);
            for(var i = 0; i < sources.length; i++) {
                var s = sources[i];
                scanned_sources.push({source: s.id, workers: [], maxWorkers: this.getNumSupportedWorkers(s)});
                //console.log("Found source at (" + s.pos.x + ", " + s.pos.y + ") with " + s.energy + "/" + s.energyCapacity + " energy");
            }
            this.room.memory.sources = scanned_sources;
            return scanned_sources;
        } else {
            return this.room.memory.sources;
        }
    }

    /** @param {StructureSource} source */
    getNumSupportedWorkers(source) {
        var numWorkers = 0;
        var pos = source.pos;
        var locs = [
            {x: pos.x + 1, y: pos.y},
            {x: pos.x + 1, y: pos.y+1},
            {x: pos.x + 1, y: pos.y-1},
            {x: pos.x, y: pos.y+1},
            {x: pos.x, y: pos.y-1},
            {x: pos.x -1, y: pos.y + 1},
            {x: pos.x -1, y: pos.y - 1},
            {x: pos.x -1, y: pos.y},
            
        ];
        var roomTerrain = this.room.getTerrain();
        for(var j = 0; j < locs.length; j++) {
            var loc = locs[j];
            if(roomTerrain.get(loc.x, loc.y) != TERRAIN_MASK_WALL) {
                numWorkers++;
            }
            
        }
        console.log("Source at " + pos + " supports " + numWorkers + " harvesters");
        return numWorkers;
    }
}; 
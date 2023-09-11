import { RoomManager } from "./room_manager";
import {Mem} from './memory/memory'

export class ViperAi {
    
    home_room

    room_managers

    constructor() {
        this.room_managers = [];
        this.initialize();
        
    }

    initialize() {
        Mem.init();
        this.home_room = Game.rooms[this.findHomeRoom()];
        this.room_managers.push(new RoomManager(this.home_room));
    }

    findHomeRoom() {
        if (!Memory.home_room) { // this is the first run
            for (var roomName in Game.rooms) {
                Memory.home_room = roomName;
                console.log("Found home room: " + roomName);
                break;
            }
        }
        return Memory.home_room;
    }

    run() {
        if(this.home_room) {
            this.room_managers.forEach((manager) => manager.run());
        }
    }
};
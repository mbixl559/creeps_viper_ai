export class Mem {
    static init() {
        if(!Memory.last_id) {
            Memory.last_id = 1;
        }
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }
}
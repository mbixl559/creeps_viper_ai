
var directive = {
    /** @param {Room} room 
*  @param {number} rcl **/
    StartColony: function(room, rcl) {
        let spawns = this.loadSpawns(room);

        if (spawns.length > 0) {
            var spawn = spawns[0];
        }
    },

    /** @param {Room} room */
    loadSpawns: function(room) {
        let spawns = [];
        if (!room.memory.spawns) {
            let spawn_names = [];
            for (var spawn_name in Game.spawns) {
                spawn_names.push(spawn_name);
                spawns.push(Game.spawns[spawn_name]);
            }
            room.memory.spawns = JSON.stringify(spawn_names);
        } else {
            let spawn_names = JSON.parse(room.memory.spawns);
            spawn_names.forEach((name) => spawns.push(Game.spawns[name]));
        }
    }
}

module.exports = directive.StartColony;
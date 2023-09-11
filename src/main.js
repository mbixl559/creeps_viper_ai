import "./constants";
import { ViperAi } from './ai';



module.exports.loop = function() {

    let ai = new ViperAi();

    ai.run();
    // Lets get some basic objectives in first and we will refactor later
    // First thing we have to do is find our spawn and figure out our RCL(Room Control Level)

    // let homeRoom = Game.rooms[findHomeRoom()];

    // let homeRCL = homeRoom.controller.level;

    // if (homeRCL < 2) {
    //     directives.StartColony(homeRoom, homeRCL);
    // }

}

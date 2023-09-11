export class CreepBase {

    /** @property {Creep} creep */
    creep;

    /** @property {Task} task */
    task;

    /** @property {string} role */
    role;

    /** @param {Creep} creep */
    constructor(creep) {
        this.creep = creep;
    }
}
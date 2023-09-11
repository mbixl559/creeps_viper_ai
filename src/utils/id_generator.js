
export class IDGenerator {

    static next_id() {
        return Memory.last_id++;
    }
}
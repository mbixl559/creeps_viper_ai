export class Order {

    /** @property {string[]} body */
    body;

    /** @property {string} creep_role */
    role;

    /** @param {string[]} creep_body
     *  @param {string} role
     */
    constructor(creep_body, role) {
        this.body = creep_body;
        this.role = role;
    }

    toJson() {
        let _this = this;
        return {
            role: _this.role,
            body: _this.body,
        }
    }
}
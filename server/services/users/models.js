const {EntitySchema} = require("typeorm");


class User {
    constructor({id, handle}) {
        this.id = id;
        this.handle = handle;
    }
}

const UserEntity = new EntitySchema({
    name: "User",
    target: User,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        handle: {
            type: "text"
        }
    }
});


module.exports = {
    User,
    UserEntity,
};

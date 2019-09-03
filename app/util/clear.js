const { db } =require('../../database/db');

async function clear(req, reply) {
    if (req.body.clear == true) {
        db.none('TRUNCATE users, chats, messages, user_chat RESTART IDENTITY CASCADE')
        .then(() => {
            reply.code(200).send();
        })
        .catch((err) => {
            reply.code(500).send(err);
        })
    }
}

module.exports = { clear };
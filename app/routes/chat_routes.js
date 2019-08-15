const dbConfig = require('../../database/db');

const { db } = dbConfig;

async function addChat(req, reply) {
    const name = req.body.name ? req.body.name : null;
    const users = req.body.users ? req.body.users : null;
    if (!name || !users || !Array.isArray(users)) {
        reply.code(400).send({
            message: 'Invalid request'
        });
    }

    db.one(`INSERT INTO chats (name) VALUES ($1) RETURNING id`, name)
        .then((data) => {
            const args = [];
            const chat_id = parseInt(data.id)
            let batch = "";
            const len = users.length
            for (let i = 0; i < len; i++) {
                args.push(parseInt(users[i]));
                batch += `(${chat_id}, $${i+1}),`
            }
            batch = batch.slice(0, -1);

            const sql = `INSERT INTO user_chat (chat_id, user_id) VALUES ${batch}`;
            console.log(sql, args);
            
            db.none({
                text: sql,
                values: args,
                })
                .then(() => {
                    reply.code(200).send(data);
                })
                .catch((err) => {
                    if (err.code === dbConfig.dataConflict) {
                        reply.code(409).send({
                            message: 'User is already in this chat'
                        });
                    } else if (err.code === dbConfig.dataDoesNotExist) {
                        reply.code(404).send({
                            message: 'Invalid user id'
                        });
                    } else {
                        reply.code(500).send(err);
                    }
                })
        })
        .catch((err) => {
            if (err.code === dbConfig.dataConflict) {
                reply.code(409).send({
                    messsage: 'Chat with this name already exists'
                });
            } else {
                reply.code(500).send(err);
            }
        }
    );
}

async function getUserChat(req, reply) {
    const username = req.body.user ? req.body.user : null;
    if (!username) {
        reply.code(400).send({
            message: 'Invalid request'
        });
    }

    db.any({
        text: `SELECT chat_id FROM user_chat WHERE user_id=(
            SELECT id FROM users WHERE username=$1
        )`,
        values: username
    })
    .then((data) => {
        if (data.length == 0) {
            reply.code(404).send({
                message: 'User has no chats yet'
            })
        }

        let chatIDsql = '';
        const args = [];
        for (let i = 0; i < data.length; i++) {
            chatIDsql += ` id=$${i+1} OR`;
            args.push(Object.values(data[i])[0]);
        }

        // hack: we can use OR as a part of [OR]DER BY
        const sql = `SELECT * FROM chats WHERE${chatIDsql}DER BY created DESC`
        console.log(sql, args);

        db.any({
            text: sql,
            values: args
        })
        .then((data) => {
            reply.code(200).send(data);
        })
        .catch((err) => {
            reply.code(500).send(err);
        })
    })
    .catch((err) => {
        if (err.code === dbConfig.dataDoesNotExist) {
            reply.code(404).send({
                message: 'Invalid user ID'
            });
        } else {
            reply.code(500).send(err);
        }
    })

}

module.exports = {
    addChat,
    getUserChat
}
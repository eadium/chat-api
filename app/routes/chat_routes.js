const dbConfig = require('../../database/db');
const { isInteger } = require('../util/intValidator');

const { db } = dbConfig;

async function addChat(req, reply) {
    const name = req.body.name ? req.body.name : null;
    let users = req.body.users ? req.body.users : null;

    if (!name || !Array.isArray(users) || users.length < 2 ||
    typeof(name) !== "string" ) {
        reply.code(400).send({
            message: 'Invalid request'
        });
        return;
    }

    // leave only string values
    users = users.filter(e => isInteger(e) && typeof e === 'string' && e !== '');
    if (users.length < 2) {
        reply.code(400).send({
            message: 'Users array is invalid'
        });
        return;
    }

    let userIDsql = '';
    const usersArray = [];
    for (let i = 0; i < users.length; i++) {
        usersArray.push(parseInt(users[i], 10));
        userIDsql += ` id=$${i+1} OR`;
    }
    userIDsql = userIDsql.slice(0, -3);

    const preSql = `SELECT username FROM users WHERE ${userIDsql}`
    console.log(preSql, usersArray, users);

    db.any({
        text: preSql,
        values: usersArray
    })
    .then((data) => {
        if (data.length !== users.length) {
            reply.code(404).send({
                message: "User not found"
            })
            return;
        }
        db.one(`INSERT INTO chats (name) VALUES ($1) RETURNING id`, name)
        .then((data) => {
            const args = [];
            const chat_id = parseInt(data.id, 10)
            let batch = "";
            const len = users.length
            for (let i = 0; i < len; i++) {
                args.push(parseInt(users[i], 10));
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
        });
    })
    .catch((err) => {
        reply.code(500).send(err);
    });
}

async function getUserChat(req, reply) {
    let userID = req.body.user ? req.body.user : null;

    //request should contain "user" field
    if (!isInteger(userID)) {
        reply.code(400).send({
            message: 'Invalid request'
        });
        return;
    }

    // check if user exists
    db.any({
        text: `SELECT chat_id FROM user_chat WHERE user_id=$1`,
        values: userID
    })
    .then((data) => {
        // in case of empty row we need to understand
        // if user has no chats or user does not exist
        if (data.length == 0) {
            db.one('SELECT id FROM users WHERE username=$1', userID)
            .then(() => {
                reply.code(200).send({
                    message: 'User has no chats yet'
                })
            })
            .catch((err) => {
                if (err.code === dbConfig.pgp.errors.queryResultErrorCode.noData) {
                    reply.code(404).send({
                        message: 'Invalid user name'
                    });
                } else {
                    reply.code(500).send(err);
                }
            })
            return;
        }

        // empty chats are sorted by their creation date
        // other chats -- by the time of the last posted message
        const sql = `
        SELECT id, name, created FROM user_chat
            JOIN chats ON chats.id = user_chat.chat_id
            LEFT JOIN (
                SELECT chat_id, max(created) AS last_msg_cr 
                    FROM messages GROUP BY chat_id
                )
            last_msg ON last_msg.chat_id = chats.id
            WHERE user_id=$1
            ORDER BY last_msg_cr DESC NULLS LAST, created DESC
        `
        db.any({
            text: sql,
            values: userID
        })
        .then((data) => {
            // convert UTC time to local time
            for (let i = 0; i < data.length; i++) {
                data[i].created = new Date(data[i].created).toString();
            }

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
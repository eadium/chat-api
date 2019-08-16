const dbConfig = require('../../database/db');

const { db } = dbConfig;

async function addMessage(req, reply) {
    const chatID = req.body.chat ? req.body.chat : null;
    const userID = req.body.author ? req.body.author : null;
    const text = req.body.text ? req.body.text : null;
    
    // request should contain "chat", "author" and "text" 
    if (!chatID || !userID || !text) {
        reply.code(400).send({
            message: 'Invalid request'
        });
        return;
    }

    const args = [parseInt(chatID), parseInt(userID), text];
    const sql = `
        INSERT INTO messages (chat_id, author_id, text) 
        VALUES (
        (SELECT chat_id FROM user_chat WHERE chat_id=$1 AND user_id=$2),
        $2, $3) RETURNING id
    `;
    db.one({
        text: sql,
        values: args 
    })
    .then((data) => {
        reply.code(200).send(data);
    })
    .catch((err) => {
        // returned empty row
        if (err.code === dbConfig.dataDoesNotExist) {
            reply.code(404).send({
                message: 'Invalid user or chat id'
            });
        // user was not added to the participants list
        } else if (err.code === dbConfig.notNullErorr) {
            db.one('SELECT chat_id FROM chats WHERE chat_id=$1', chatID)
            .then(() => {
                reply.code(403).send({
                    message: 'User has no access to this chat'
                });
            })
            .catch(() => {
                // user does not exist 
                reply.code(404).send({
                    message: 'Invalid chat id'
                });
            });
        } else {
            reply.code(500).send(err);
        }
    });
}

async function getChatMessages(req, reply) {
    const chatID = req.body.chat ? req.body.chat : null;
    if (!chatID || typeof(chatID) != "string") {
        // request should contain chat name
        reply.code(400).send({
            message: 'Invalid request'
        });
        return;
    }

    const sql = `
        SELECT * FROM messages WHERE chat_id=$1 ORDER BY created
    `

    db.any({
        text: sql,
        values: chatID
    })
    .then((data) => {
        if (data.length == 0) {
            db.one('SELECT id FROM chats WHERE name=$1', chatID)
            .then(() => {
                reply.code(200).send({
                    message: 'Chat is empty'
                })
            })
            .catch((err) => {
                // no rows returned
                if (err.code === dbConfig.pgp.errors.queryResultErrorCode.noData) {
                    reply.code(404).send({
                        message: 'Invalid chat id'
                    });
                } else {
                    reply.code(500).send(err);
                }
            })
            return;
        }
        reply.code(200).send(data);
    })
    .catch((err) => {
        if (err.code === dbConfig.dataDoesNotExist) {
            reply.code(404).send({
                message: 'Invalid chat name'
            });
        } else {
            reply.code(500).send(err);
        }
    })
}

module.exports = {
    addMessage,
    getChatMessages
}
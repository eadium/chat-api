const dbConfig = require('../../database/db');

const { db } = dbConfig;

async function addUser(req, reply) {
    const username = req.body.username ? req.body.username : null;
    
    //request should contain "username" field
    if (!username || typeof(username) != "string" ) {
        reply.code(400).send({
            message: 'Invalid request'
        });
        return;
    }

    db.one(`INSERT INTO users (username) VALUES ($1) RETURNING id`, username)
        .then((data) => {
            reply.code(200).send(data);
        })
        .catch((err) => {
            // user exists
            if (err.code === dbConfig.dataConflict) {
                reply.code(409).send({
                    message: 'Username is occupied'
                });
            } else {
                reply.code(500).send(err);
            }
        }
    );
}

module.exports = {
    addUser
}
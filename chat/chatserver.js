var kbpgp = require('kbpgp');


/**
 * Contains all created rooms.
 * @type {Object}
 */
var ROOMS = new Object();

/**
 * Contains all clients
 * @type {Object}
 */
var CLIENTS = new Object();


Chatserver = {
    io: null,

    /**
     * When a client connects to room.
     * @param socket
     * @param data
     * @param resp
     */
    sendEventLogged: function (socket, data, resp) {

        // SEND PUBLIC KEY TO CLIENT
        resp({key: ROOMS[data.room].publicKey});

        sendLogged(data.room);
        sendMessage(socket, {
            username: 'SERVER',
            content: 'You are now connected!',
            date: 'now'
        });

    },

    /**
     * The server is launched.
     * @param io
     */
    init: function (io) {
        Chatserver.io = io;

        /**
         * On client connection
         */
        io.on('connection', function (socket) {

            /**
             * Client is disonnected.
             */
            socket.on('disconnect', function () {
                var client = CLIENTS[socket.id];

                if (client == undefined) {
                    console.log("skipped");
                    return;
                }

                ROOMS[client.room].nbUsersLogged--;

                if (ROOMS[client.room].nbUsersLogged <= 0) {
                    delete ROOMS[client.room];
                    console.log(client.room + " deleted!");
                } else {
                    sendLogged(client.room);
                }

                delete CLIENTS[socket.id];
            });


            /**
             * Client connects to a room.
             */
            socket.on('logRoom', function (data, resp) {
                // on store les datas de la socket
                CLIENTS[socket.id] = {
                    socket: socket,
                    room: data.room,
                    publicKey: data.publicKey,
                    encrypter: null,
                    username: "U-" + Chatserver.makeClient(5)
                };

                console.log("User ", socket.id, " created!");

                // join room
                socket.join('/' + data.room);


                loadClientKey(socket.id, data.publicKey);


                /**
                 * CREATE THE ROOM
                 */
                if (typeof ROOMS[data.room] === 'undefined') {


                    var options = {
                        userIds: [{roomId: data.room}], // multiple user IDs
                        numBits: 512,                                            // RSA key size
                        passphrase: 'APRIVATEHIDENPASSWORD'         // protects the private key
                    };

                    /**
                     * Generate a key
                     */
                    var F = kbpgp["const"].openpgp;
                    var SIZE = 1024;
                    var opts = {
                        userid: "ServerRoomId:" + data.room,
                        primary: {
                            nbits: SIZE,
                            flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage,
                            expire_in: 0  // never expire
                        },
                        subkeys: [
                            {
                                nbits: SIZE / 2,
                                flags: F.sign_data,
                                expire_in: 86400 * 365 * 8 // 8 years
                            }, {
                                nbits: SIZE / 2,
                                flags: F.encrypt_comm | F.encrypt_storage,
                                expire_in: 86400 * 365 * 8
                            }
                        ]
                    };


                    var nbGenerated = 0;
                    var privateKey, publicKey, keyEn;

                    function callCallback() {
                        nbGenerated++;
                        if (nbGenerated >= 2) {

                            // save data
                            ROOMS[data.room] = {
                                nbUsersLogged: 1,
                                key: keyEn,
                                privateKey: privateKey,
                                publicKey: publicKey
                            };

                            Chatserver.sendEventLogged(socket, data, resp);
                        }
                    }


                    /**
                     * Asynchronisous task
                     * Callback needed.
                     * Generate a key.
                     */
                    kbpgp.KeyManager.generate(opts, function (err, key) {
                        if (!err) {
                            keyEn = key;
                            key.sign({}, function (err) {
                                key.export_pgp_private({
                                    passphrase: "SALTER" + data.room,
                                }, function (err, pgp_private) {
                                    privateKey = pgp_private;
                                    callCallback();
                                });
                                key.export_pgp_public({}, function (err, pgp_public) {
                                    publicKey = pgp_public;
                                    callCallback();
                                });
                            });
                        }
                    });


                } else {

                    // up users logged
                    ROOMS[data.room].nbUsersLogged++;
                    Chatserver.sendEventLogged(socket, data, resp);
                }


            });

            /**
             * Receives a message from client.
             */
            socket.on('sendMessage', function (data) {
                var room = CLIENTS[socket.id].room;

                // decrypt
                var message = data.message;

                try {

                    var ring = new kbpgp.keyring.KeyRing;
                    var pgp_msg = message;
                    ring.add_key_manager(ROOMS[room].key);

                    //console.log(ROOMS[room].key);

                    kbpgp.unbox({keyfetch: ring, armored: pgp_msg}, function (err, literals) {
                        if (err != null) {
                            return console.log("Problem: " + err);
                        } else {
                            message = literals[0].toString();

                            /**
                             * SEND MESSAGE to himself
                             */
                            sendEncryptedMessage(room, CLIENTS[socket.id], message);

                        }
                    });


                } catch (e) {
                    message = "Exception: " + message + " =======> " + e;
                    console.log(e);
                }


            });

        });

    },


    /**
     * Generate an username ID.
     * @param nbCar
     * @returns {string}
     */
    makeClient: function (nbCar) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < nbCar; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

};


/**
 * Crypt the message with right public key.
 * @param room
 * @param client
 * @param message
 */
var sendEncryptedMessage = function (room, client, message) {

    console.log("SEND FROM " + client.socket.id);

    var dateD = new Date();
    var date = dateD.getHours() + ":" + dateD.getMinutes();

    for (var k in CLIENTS) {
        if (typeof CLIENTS[k] !== 'function') {
            var cli = CLIENTS[k];
            if (cli.room != room) {
                continue;
            }

            sendTo(cli.socket, message, cli, client, date);
        }
    }

}

/**
 * Send to a client in room.
 * @param socket
 * @param message
 * @param cli
 * @param client
 * @param date
 */
var sendTo = function (socket, message, cli, client, date) {

    var params = {
        msg: message,
        encrypt_for: cli.encrypter
    };
    kbpgp.box(params, function (err, encrypted, buffer) {

        sendMessage(cli.socket, {
            username: client.username,
            content: encrypted,
            date: date
        });
    });

};


var sendMessage = function (socket, message) {
    socket.emit('receiveMessage', message);
};


var sendLogged = function (room) {
    Chatserver.io.in('/' + room).emit('logged', ROOMS[room].nbUsersLogged);
    console.log("Send to /" + room + " -> " + ROOMS[room].nbUsersLogged);
};


/**
 * Loads a client public key.
 * @param socketId
 * @param publicKey
 */
var loadClientKey = function (socketId, publicKey) {

    kbpgp.KeyManager.import_from_armored_pgp({
        armored: publicKey
    }, function (err, keyEngine) {
        if (!err) {
            CLIENTS[socketId].encrypter = keyEngine;
            console.log("USER key is loaded");
        } else {
            console.error("Can't load user key...");
            console.error(err);
        }
    });

};


module.exports = Chatserver;
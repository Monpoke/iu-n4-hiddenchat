var NodeRSA = require('node-rsa');

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
    io:null,

    init: function (io) {
        Chatserver.io = io;
        io.on('connection', function (socket) {
            socket.on('logRoom', function (data, resp) {
                console.log(data);

                // on store les datas de la socket
                CLIENTS[socket.id] = {
                    socket: socket,
                    room: data.room,
                    publicKey: data.publicKey,
                    username: "U-" + Chatserver.makeClient(5)
                };

                // join room
                socket.join('/' + data.room);

                if (typeof ROOMS[data.room] === 'undefined') {
                    // generate a key for room
                    var key = new NodeRSA({b: 512});
                    var publicKey = key.exportKey('public');

                    // save data
                    ROOMS[data.room] = {
                        nbUsersLogged: 1,
                        keys: key,
                        publicKey: publicKey
                    };

                    console.log(publicKey);

                } else {
                    // up users logged
                    ROOMS[data.room].nbUsersLogged++;
                }


                // SEND PUBLIC KEY TO CLIENT
                resp({key: ROOMS[data.room].publicKey});

                sendLogged(data.room);
                sendMessage(socket, {
                    username: 'SERVER',
                    content: 'You are now connected!',
                    date: 'now'
                });
            });

            socket.on('sendMessage', function (data) {

                // get each client one by one
                for (var clientKe in CLIENTS) {
                    if (CLIENTS.hasOwnProperty(clientKe)) {
                        var client = CLIENTS[clientKe];

                        // next client
                        if (client.room != CLIENTS[socket.id].room) {
                            continue;
                        }

                        /**
                         * @TODO: Cryptage à faire, individuel, donc on ne peut pas utiliser le broadcast...
                         */
                            // send to this client
                        sendMessage(client.socket, {
                            content: data.message,
                            username: CLIENTS[socket.id].username,
                            date: '0000'
                        });
                    }
                }


            });

        });

    },


    makeClient: function (nbCar) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < nbCar; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

};


var sendMessage = function (socket, message) {
    socket.emit('receiveMessage', message);
};


var sendLogged = function (room) {
    Chatserver.io.in('/' + room).emit('logged', ROOMS[room].nbUsersLogged);
    console.log("Send to /"+room + " -> " +ROOMS[room].nbUsersLogged);
};


module.exports = Chatserver;
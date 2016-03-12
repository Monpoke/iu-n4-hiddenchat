var hiddenChat = angular.module('hiddenChat', [
    'ngRoute',
    'hiddenChatControllers'
]);

hiddenChat.filter('reverse', function () {
    return function (items) {
        if (typeof items === 'undefined') {
            return items;
        }
        return items.slice().reverse();
    };
});

hiddenChat.config(['$routeProvider', '$locationProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/home',
            controller: 'HomePage'
        })

        .when('/room/create', {
            templateUrl: 'pages/create',
            controller: 'CreateRoom'
        })
        .when('/room/:hash', {
            templateUrl: 'pages/room',
            controller: 'JoinRoom'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);


TCHAT = {
    socket: null,

    publicKey: "",
    privateKey: "",
    roomPublicKey: "",
    passphrase: "",
    encrypter: null,
    ring:null,

    // contains all messages from start of session
    messages: [],

    init: function (callback) {
        if (TCHAT.socket != null) {
            return callback(true);
        }

        try {
            TCHAT.socket = io.connect('http://localhost:3000');
            return TCHAT.generateRSA(callback);
        } catch (e) {
            console.log("An error has occured... " + e);
            return callback(false);
        }
    },

    generateRSA: function (callback) {
        TCHAT.passphrase = TCHAT.makeid();

        var SIZE = 1024;
        var F = kbpgp["const"].openpgp;

        var opts = {
            userid: "UnknwownUser",
            primary: {
                nbits: SIZE,
                flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage,
                expire_in: 86400 * 365 * 8  // never expire
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

        function callCallback() {
            nbGenerated++;
            if (nbGenerated >= 2) {
                callback(true);
            }
        }


        kbpgp.KeyManager.generate(opts, function (err, user) {
            if (!err) {
                // sign alice's subkeys
                user.sign({}, function (err) {
                    user.export_pgp_private({
                        passphrase: TCHAT.passphrase,
                    }, function (err, pgp_private) {
                        TCHAT.privateKey = pgp_private;
                        callCallback();
                    });
                    user.export_pgp_public({}, function (err, pgp_public) {
                        TCHAT.publicKey = pgp_public;
                        callCallback();
                    });
                });

                // save user in ring
                TCHAT.ring = new kbpgp.keyring.KeyRing;
                TCHAT.ring.add_key_manager(user);

            }
        });


    },


    loginTO: function ($room, callback) {
        if (TCHAT.roomPublicKey != "") {
            callback(false);
            return true;
        }
        TCHAT.socket.emit('logRoom', {
            room: $room,
            publicKey: TCHAT.publicKey
        }, function (data) {
            // contains public room key
            TCHAT.roomPublicKey = data.key;


            kbpgp.KeyManager.import_from_armored_pgp({
                armored: data.key
            }, function (err, encrypter) {
                if (!err) {
                    TCHAT.encrypter = encrypter;
                    console.log("SERVER KEY IS LOADED");
                } else {
                    console.error("SERVER KEY ERROR:");
                    console.error(err);
                }
            });


            callback(true);
        })
    },

    registerOnMessage: function (callback) {
        TCHAT.socket.on('receiveMessage', function (msg) {

            // decrypt message .content
            kbpgp.unbox({keyfetch: TCHAT.ring, armored: msg.content }, function(err, literals) {
                if (err != null) {
                    TCHAT.messages.push(msg);
                    callback(TCHAT.messages);
                    return console.log("Problem: " + err);
                } else {
                    console.log("decrypted message");
                    msg.content = literals[0].toString();

                    TCHAT.messages.push(msg);
                    callback(TCHAT.messages);
                }
            });




        });
    },

    sendMessage: function (plain) {

        // encrypted message
        //  var message =


        var params = {
            msg: plain,
            encrypt_for: TCHAT.encrypter
        };

        kbpgp.box(params, function (err, result_string, result_buffer) {
            //console.log(err, result_string, result_buffer);
            TCHAT.socket.emit('sendMessage', {message: result_string});

        });

    },

    registerLogged: function (callback) {
        TCHAT.socket.on('logged', function (nb) {
            callback(nb);
        });
    },

    makeid: function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-+_";

        for (var i = 0; i < 20; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
};


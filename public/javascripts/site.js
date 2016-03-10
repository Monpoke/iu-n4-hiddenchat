var hiddenChat = angular.module('hiddenChat', [
    'ngRoute',
    'hiddenChatControllers'
]);

hiddenChat.filter('reverse', function() {
    return function(items) {
        if(typeof items ==='undefined'){
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
            //templateUrl: 'pages/createRoom',
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

    // contains all messages from start of session
    messages: [],

    init: function () {
        if (TCHAT.socket != null) {
            return true;
        }

        try {
            TCHAT.socket = io.connect('http://localhost:3000');
            TCHAT.generateRSA();
            return true;
        } catch (e) {
            console.log("An error has occured... " + e);
            return false;
        }
    },

    generateRSA: function () {
        TCHAT.passphrase = TCHAT.makeid();
        // on génère des clés de 512 octets
        TCHAT.privateKey = cryptico.generateRSAKey(TCHAT.passphrase, 512);
        TCHAT.publicKey = cryptico.publicKeyString(TCHAT.privateKey);


    },

    loginTO: function ($room, callback) {
        if(TCHAT.roomPublicKey!=""){
            callback(false);
            return true;
        }
        TCHAT.socket.emit('logRoom', {
            room: $room,
            publicKey: TCHAT.publicKey
        }, function (data) {
            // contains public room key
            TCHAT.roomPublicKey = data.key;
            console.log(data);
            callback(true);
        })
    },

    registerOnMessage: function(callback){
        TCHAT.socket.on('receiveMessage', function(msg){
            TCHAT.messages.push(msg);
            callback(TCHAT.messages);
        });
    },

    sendMessage: function(message){
       TCHAT.socket.emit('sendMessage', {message: message});
    },

    registerLogged: function(callback){
        TCHAT.socket.on('logged', function(nb){
            console.log("received");
            callback(nb);
        });
    },

    makeid: function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%/*-)à@€&:;!ù";

        for (var i = 0; i < 20; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
};


console.log(hiddenChat);
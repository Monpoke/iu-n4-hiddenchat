var hiddenChatControllers = angular.module('hiddenChatControllers', []);

hiddenChatControllers.controller('HomePage', ['$scope', '$http',
    function ($scope, $http) {
    }]
);

hiddenChatControllers.controller('CreateRoom', ['$scope', '$window',
    function ($scope, $window) {
        $window.location.href ="/#/room/"+TCHAT.makeid();
    }]
);

hiddenChatControllers.controller('JoinRoom', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        var hash = $routeParams.hash;
        $scope.room = hash;

        // create a connection to tchat room
        TCHAT.init(function(s){
            // once RSA is generated
            TCHAT.loginTO(hash, function (state) {
                if (state === false) {
                    return;
                }

                $scope.$apply(function () {
                    $scope.passphrase = TCHAT.passphrase;
                    $scope.publickey = TCHAT.publicKey;
                    $scope.roomkey = TCHAT.roomPublicKey;
                });

                /**
                 * If user receive a message
                 */
                TCHAT.registerOnMessage(function (messages) {
                    $scope.$apply(function () {
                        $scope.messages = messages;
                    })
                });

                TCHAT.registerLogged(function (nb) {
                    $scope.$apply(function () {
                        $scope.logged = (nb === 1 ? "1 user" : nb + " users") + " logged.";
                    });
                });


            });


            /* $scope.$watch('message.content', function(newVal, oldVal){
             console.log(newVal);
             TCHAT.sendMessage(newVal);
             });*/

            function send() {
                var content = $.trim($("[data-id='messageContent']").val());
                if (content.length <= 0) {
                    return;
                }

                TCHAT.sendMessage(content);
                $("[data-id='messageContent']").val("").focus();
            }

            $(document).on('keypress', "[data-id='messageContent']", function (e) {
                if (e.keyCode === 13) {
                    send();
                }
            });
            $(document).on('click', "[data-id='messageSend']", send);

        });


    }]
);


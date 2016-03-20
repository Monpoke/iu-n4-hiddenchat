var hiddenChat = angular.module('hiddenChat', [
    'ngRoute',
    'hiddenChatControllers'
]);


/**
 * Adds a filter to enable reverse sorting.
 */
hiddenChat.filter('reverse', function () {
    return function (items) {
        if (typeof items === 'undefined') {
            return items;
        }
        return items.slice().reverse();
    };
});

/**
 * Router
 */
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


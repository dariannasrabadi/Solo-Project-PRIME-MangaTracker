var myApp = angular.module('myApp', ['ngRoute', 'ngMaterial']);

/// Routes ///
myApp.config(['$routeProvider', '$locationProvider', '$mdThemingProvider', function ($routeProvider, $locationProvider, $mdThemingProvider) {
    // console.log('myApp -- config')

    // Added mdtheming, will put edits here to see if I will use it in the end or not

    // $mdThemingProvider.theme('default')
    // .primaryPalette('grey')
    // .accentPalette('red');
  

    $routeProvider
        .when('/', {
            redirectTo: 'login'
        })
        .when('/login', {
            templateUrl: '/views/templates/login.html',
            controller: 'LoginController as vm',
        })
        .when('/register', {
            templateUrl: '/views/templates/register.html',
            controller: 'LoginController as vm'
        })
        .when('/home', {
            templateUrl: '/views/templates/home.html',
            controller: 'HomeController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/info', {
            templateUrl: '/views/templates/info.html',
            controller: 'InfoController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/genre', {
            templateUrl: '/views/templates/genre.results.html',
            controller: 'HomeController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/results', {
            templateUrl: '/views/templates/results.html',
            controller: 'HomeController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/mangainfo', {
            templateUrl: '/views/templates/manga.details.html',
            controller: 'HomeController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/favorites', {
            templateUrl: '/views/templates/favorites.html',
            controller: 'FavoriteController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .otherwise({
            template: '<h1>404</h1>'
        });
}]);

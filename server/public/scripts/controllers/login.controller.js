myApp.controller('LoginController', ['$http', '$location', 'UserService', '$mdDialog', function ($http, $location, UserService, $mdDialog) {
    console.log('LoginController created');
    var self = this;
    self.user = {
        username: '',
        password: ''
    };
    self.message = '';

    self.login = function () {
        if (self.user.username === '' || self.user.password === '') {
            self.message = "Enter your username and password!";
        } else {
            console.log('sending to server...', self.user);
            $http.post('/api/user/login', self.user).then(
                function (response) {
                    if (response.status == 200) {
                        console.log('success: ', response.data);
                        // location works with SPA (ng-route)
                        $location.path('/home');
                    } else {
                        console.log('failure error: ', response);
                        self.message = "Incorrect credentials. Please try again.";
                    }
                },
                function (response) {
                    console.log('failure error: ', response);
                    self.message = "Incorrect credentials. Please try again.";
                }
            );
        }
    };

    self.registerUser = function () {
        if (self.user.username === '' || self.user.password === '') {
            self.message = "Choose a username and password!";
        } else {
            console.log('sending to server...', self.user);
            $http.post('/api/user/register', self.user).then(function (response) {
                console.log('success');
                // REMINDER - Try to make a toast appear on successful account registration or something. 
                $location.path('/login');
            },
                function (response) {
                    console.log('error');
                    self.message = `Username "${self.user.username}" is already taken!`
                }
            );
        }
    }


    self.searchDialog = function (ev) {
        $mdDialog.show({
            controller: SearchController,
            controllerAs: 'vm',
            templateUrl: '../../views/partials/search.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        })
            .then(function (answer) {
                if (answer) {
                    $$location.path('/register');
                }
            }, function () {
                console.log('User closed the box');
            });
    };

    function SearchController($mdDialog) {
        const self = this;

        self.hide = function () {
            $mdDialog.hide();
        };

        self.cancel = function () {
            $mdDialog.cancel();
        };

        self.answer = function (answer) {
            // when they click the button that is the answer. 
            $mdDialog.hide(answer);
        };
    }


}]);

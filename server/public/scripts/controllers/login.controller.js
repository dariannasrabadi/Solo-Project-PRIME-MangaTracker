myApp.controller('LoginController', ['$http', '$location', 'UserService', 'AutoProcessService', 'MangaService','$mdDialog', function ($http, $location, UserService, AutoProcessService, MangaService, $mdDialog) {
    // console.log('LoginController created');
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
            // console.log('sending to server...', self.user);
            $http.post('/api/user/login', self.user).then(
                function (response) {
                    if (response.status == 200) {
                        // console.log('success: ', response.data);
                        // location works with SPA (ng-route)
                        MangaService.getFavorites()
                        AutoProcessService.updateFavorites() //auto updates users favorites if he has some.
                        AutoProcessService.checkGenres() //runs check to see if genres should be updated
                        $location.path('/home');

                    } else {
                        // console.log('failure error: ', response);
                        self.message = "Incorrect credentials. Please try again.";
                    }
                },
                function (response) {
                    // console.log('failure error: ', response);
                    self.message = "Incorrect credentials. Please try again.";
                }
            );
        }
    };

    self.registerUser = function () {
        if (self.user.username === '' || self.user.password === '') {
            self.message = "Choose a username and password!";
        } else {
            // console.log('sending to server...', self.user);
            $http.post('/api/user/register', self.user).then(function (response) {
                // console.log('success');
                // REMINDER - Try to make a toast appear on successful account registration or something. 
                $location.path('/login');
            },
                function (response) {
                    // console.log('error');
                    self.message = `Username "${self.user.username}" is already taken!`
                }
            );
        }
    }

    // To make a modal show
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
                if (answer === 'True') {
                    $location.path('/register');
                }
            }, function () {
                // console.log('User closed the box');
            });
    };

    // The modals controller, named/determined in the self.searchDialog. 
    function SearchController($mdDialog, $sce) {
        const self = this;
        self.mangaResults = { list: [] }
        self.detailsPage = { list: {} }

        self.hide = function () {
            $mdDialog.hide();
        };

        self.cancel = function () {
            $mdDialog.cancel();
        };

        self.answer = function (answer) {
            // when they click the button. This sends back the result which is caught by the .then of self.searchDialog
            $mdDialog.hide(answer);
        };

        self.searchManga = function (searchInput) {
            self.results = false;
            self.details = false;
            $http.get(`/api/manga/preLogin/${searchInput}`)
                .then(response => {
                    // console.log(response);
                    if (Array.isArray(response.data)) { // If the resulting search is an array. Then continue to display the results.
                        self.mangaResults.list = response
                        self.results = true;
                        // $location.path("/results");
                    }
                    else { //This is if the search results into only a single resulting manga. It will go to the manga details tab directly. 
                        self.details = true;
                        self.detailsPage.list = response.data
                        // $location.path("/mangainfo");
                    }
                })
                .catch(error => {
                    swal({
                        title: `There was an error with the search`,
                        text: `Please try a different one`,
                        icon: "error",
                    })
                })
        };

        self.mangaDetail = function (manga) {
            self.details = true;
            self.detailsPage.list = manga;
            // $location.path("/mangainfo");
        }

        self.renderHTML = function (data) {
            // console.log('inside');
            return $sce.trustAsHtml(data);
        }
    }


}]);

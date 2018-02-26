myApp.controller('InfoController', ['UserService', 'MangaService', function (UserService, MangaService) {
    console.log('InfoController created');
    var self = this;
    //User Auth Functions (Verify user is logged in, User can log out)
    self.userService = UserService;
    self.userObject = UserService.userObject;

    //Sending search inquiry to the service to perform get request.
    self.searchManga = function (searchInput) {
        MangaService.searchManga(searchInput);
    }

    //Request for a random manga
    self.randomManga = function () {
        MangaService.randomManga();
    }


}]);

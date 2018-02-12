myApp.controller('HomeController', ['UserService', 'MangaService', function(UserService, MangaService) {
    console.log('HomeController created');
    var self = this;
    //User Auth Functions (Verify user is logged in, User can log out)
    self.userService = UserService;
    self.userObject = UserService.userObject;
    self.mangaResults = MangaService.mangaResults;

    //Sending search inquiry to the service to perform get request.
    self.searchManga = function(searchInput) {
        MangaService.searchManga(searchInput);
    }

    self.imageTest = 'https://umbra.nascom.nasa.gov/images/latest_aia_211_tn.gif'

}]);
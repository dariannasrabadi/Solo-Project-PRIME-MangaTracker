myApp.controller('FavoriteController', ['UserService', 'MangaService', function(UserService, MangaService) {
    console.log('FavoriteController created');
    var self = this;
    //User Auth Functions (Verify user is logged in, User can log out)
    self.userService = UserService;
    self.userObject = UserService.userObject;

    // this is used for the favorites results from database.
    self.userFavorites = MangaService.userFavorites
    
    //Sending search inquiry to the service to perform get request.
    self.searchManga = function(searchInput) {
        MangaService.searchManga(searchInput);
    }

    self.editChapterRead = function(chapterRead) {
        MangaService.editChapterRead(chapterRead);    }
}]);
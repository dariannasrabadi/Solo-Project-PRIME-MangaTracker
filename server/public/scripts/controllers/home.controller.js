myApp.controller('HomeController', ['UserService', 'MangaService', function(UserService, MangaService) {
    console.log('HomeController created');
    var self = this;
    //User Auth Functions (Verify user is logged in, User can log out)
    self.userService = UserService;
    self.userObject = UserService.userObject;
    self.detailsPage = MangaService.detailsPage;

    //this is used for the search results from M.A.L. API.
    self.mangaResults = MangaService.mangaResults;

    //Sending search inquiry to the service to perform get request.
    self.searchManga = function(searchInput) {
        MangaService.searchManga(searchInput);
    }

    self.addFavorite = function(mangaInfo) {
        MangaService.addFavorite(mangaInfo);
    }

    self.mangaDetail = function(manga) {
        console.log(manga);
        
        MangaService.mangaDetail(manga);
    }

}]);
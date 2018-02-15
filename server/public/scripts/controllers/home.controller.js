myApp.controller('HomeController', ['UserService', 'MangaService', function(UserService, MangaService) {
    console.log('HomeController created');
    var self = this;
    //User Auth Functions (Verify user is logged in, User can log out)
    self.userService = UserService;
    self.userObject = UserService.userObject;

    //this is used for the search results from M.A.L. API.
    self.mangaResults = MangaService.mangaResults;

    // For information displayed directly to the manga details page.
    self.detailsPage = MangaService.detailsPage;
    // self.favoriteDetailsPage = MangaService.favoriteDetailsPage;

    

    //Sending search inquiry to the service to perform get request.
    self.searchManga = function(searchInput) {
        MangaService.searchManga(searchInput);
    }
    //Sending genre search inquiry to the service to perform get request.
    self.searchGenre = function(genre) {
        MangaService.searchGenre(genre);
    }

    self.addFavorite = function(mangaInfo) {
        MangaService.addFavorite(mangaInfo);
    }

    self.mangaDetail = function(manga) {
        // console.log(manga);
        MangaService.mangaDetail(manga);
    }

}]);
myApp.controller('HomeController', ['UserService', 'MangaService', function(UserService, MangaService) {
    console.log('HomeController created');
    var self = this;
    //User Auth Functions (Verify user is logged in, User can log out)
    self.userService = UserService;
    self.userObject = UserService.userObject;

    //this is used for the search results from M.A.L. API.
    self.mangaResults = MangaService.mangaResults;

    //this is used for the search results from Manga Eden API.
    self.genreResults = MangaService.genreResults;
    
    // For information displayed directly to the manga details page.
    self.detailsPage = MangaService.detailsPage;

    

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

    self.genreDetail = function(genreManga) {
        // console.log(genreManga.substring(0,10));
        //Have to cut the manga into 10 chars and remove all special characters due to how the M.A.L. API works and considering the way they write manga names are different.
        let mangaToSearch = genreManga.substring(0,10)
        mangaToSearch = mangaToSearch.replace(/["-/;-@[-`þ]/g, '');
        // There will still be errors since the API's do not have the same manga naming system. Will need to find a workaround for any error.
        MangaService.searchManga(mangaToSearch);        
    }
    
}]);
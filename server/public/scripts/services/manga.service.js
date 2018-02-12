myApp.service('MangaService', ['$http', '$location', function($http, $location){
    console.log('MangaService Loaded');
    var self = this;

    self.mangaResults = { list: [] }
    self.userFavorites = { list: [] }

    //Sending search inquiry to the service to perform get request.
    self.searchManga = function(searchInput) { //Search manga function (Used in all views except register & login)
        $http.get(`/api/manga/${searchInput}`)
            .then(response => {
                // console.log(response);
                self.mangaResults.list = response
                console.log(self.mangaResults);
                
                $location.path("/results");
            })
            .catch(error => {
                console.log(error);
            })
    }; //Search manga function (Used in all views except register & login)

    self.addFavorite = function(mangaInfo) {
        console.log('data to add to the favorites', mangaInfo);
        $http.post(`/api/manga`, mangaInfo)
            .then(response => {
                console.log('added', response);   
                alert(`${mangaInfo.title} has been added to favorites!`)             
            })
            .catch(error => {
                console.log('Error on adding to favorites.', error);
            })
    }

    self.getFavorites = function() { //get Favorites function (Used in favorites view, but loaded once user logs in. / refreshes page.)
        $http.get(`/api/manga`)
            .then(response => {
                console.log('User Favorites', response);
                self.userFavorites.list = response
            })
            .catch(error => {
                console.log('Error retrieving favorites', error);
            })
    }; //get Favorites function (Used in favorites view, but loaded once user logs in. / refreshes page.)

    // NOTE TO SELF; THIS CURRENTLY ONLY RELOADS ONCE. IF THE USER LOGS OUT AND SOMEONE ELSE LOGS IN WITHOUT REFRESHING THE PAGE THEIR FAVORITES WONT LOAD.
    // QUICK FIX WOULD BE TO RELOAD ON CONTROLLER BUT THAT IS TOO MANY REFRESHES. FIX IN TIME. 
    self.getFavorites()

}]);
  
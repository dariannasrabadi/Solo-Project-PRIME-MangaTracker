myApp.service('MangaService', ['$http', '$location', function($http, $location){
    console.log('MangaService Loaded');
    var self = this;

    self.mangaResults = { list: [] }

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

}]);
  
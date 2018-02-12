myApp.service('MangaService', ['$http', '$location', function($http, $location){
    console.log('MangaService Loaded');
    var self = this;

    self.mangaResults = { list: [] }

    //Sending search inquiry to the service to perform get request.
    self.searchManga = function(searchInput) {
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
    };

}]);
  
myApp.service('AutoProcessService', ['$http', '$location', function ($http, $location) {
    // console.log('AutoProcessService Loaded');
    var self = this;

    //THESE WILL ONLY BE DONE WHEN THE USER LOGS IN,

    // Check manga Genres function 
    
    self.checkGenres = function () {
        $http.get(`/api/manga/genres/pull/all/genres`)
                            .then(response => {
                                // console.log('Checked all manga genres', response);
                            })
                            .catch(error => {
                                // console.log(error);
                            })
    }
    
    self.updateFavorites = function () { //Function for auto updating last manga chapters. 
        $http.put(`/api/manga/chapters`)
            .then(response => {
                // console.log('updated users favorites', response);
            })
            .catch(error => {
                if (error.status === 403) {
                    swal({
                        text: `You are not logged in.`,
                        title: 'Not Allowed!',
                        icon: "error",
                    })
                    $location.path("/login");
                }
                else {
                    // console.log('Error retrieving favorites', error);
                }
            })
    }; //Function for auto updating last manga chapters. 
    
}]);
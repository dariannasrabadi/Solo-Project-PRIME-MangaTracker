myApp.service('UserService', ['$http', '$location', function($http, $location){
    console.log('UserService Loaded');
    var self = this;
    self.userObject = {};

    self.getuser = function(){
        console.log('UserService -- getuser');
        $http.get('/api/user').then(function(response) {
            if(response.data.username) {
                // console.log(response);
                
                // user has a curret session on the server
                self.userObject.userName = response.data.username;
                // console.log('UserService -- getuser -- User Data: ', self.userObject.userName);
            } 
            else {
                console.log('UserService -- getuser -- failure');
                // user has no session, bounce them back to the login page
                $location.path("/login");
            }
        },
        function(response){
            console.log('UserService -- getuser -- failure: ', response);
            $location.path("/login");
        });
    },

    self.logout = function() {
        if (confirm('Are you sure you want to Log out?')) {
            console.log('UserService -- logout');
            $http.get('/api/user/logout').then(function(response) {
                console.log('UserService -- logout -- logged out');
                $location.path("/login");
            }); 
        }
    }
}]);

myApp.controller('InfoController', ['UserService', function(UserService) {
    console.log('InfoController created');
    var self = this;
    //User Auth Functions (Verify user is logged in, User can log out)
    self.userService = UserService;
    self.userObject = UserService.userObject;

}]);

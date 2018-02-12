myApp.controller('HomeController', ['UserService', 'MangaService', function(UserService, MangaService) {
    console.log('HomeController created');
    var self = this;
    self.userService = UserService;
    self.userObject = UserService.userObject;

  }]);
  
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.factory('fbService', ['$q', function ($q) {
  return {
    getLoginStatus: function() {
      var deferred = $q.defer();
      FB.getLoginStatus(function(response) {
        console.log('FB.getLoginStatus', response);
        if (response.status === 'connected') {
          deferred.resolve();
        } else if (response.status === 'not_authorized') {
          deferred.reject('not_authorized');
        } else {
          deferred.reject(response.status);
        }
      })

      return deferred.promise;
    },
    login: function() {
      var deferred = $q.defer();

      FB.login(function(response) {
        console.log('FB.login', response);
        if (response.authResponse) {
          console.log('Welcome!  Fetching your information.... ');
          FB.api('/me', function(response) {
            console.log('Good to see you, ' + response.name + '.');
            deferred.resolve();
           });
        } else {
         console.log('User cancelled login or did not fully authorize.');
         deferred.reject();
        }
      });

      return deferred.promise;
    },
    logout: function() {
      var deferred= $q.defer();
      FB.logout(function(response) {
        console.log('FB.logout', response);
        deferred.resolve();
      });
      return deferred.promise;
    }
  };
}])
.controller('main', ['$scope', 'fbService', function($scope, fbService) {
  console.log('controller');
  $scope.isLoggedIn = false;

  checkLoginState = function() {
    fbService.getLoginStatus()
    .then(function() {
      $scope.isLoggedIn = true;
    }, function(err) {
      $scope.isLoggedIn = false;
    })
  };

  setTimeout(function() {
    checkLoginState();
  }, 1000);

  $scope.login = function() {
    fbService.login()
    .then(function() {
      $scope.isLoggedIn = true;
    }, function() {
      $scope.isLoggedIn = false;
    });
  };

  $scope.logout = function() {
    fbService.logout()
    .then(function() {
      $scope.isLoggedIn = false;
    });
  };
}]);

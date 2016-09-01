// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordovaOauth'])

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
          deferred.resolve(response.authResponse.accessToken);
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
            console.log('login response', response);
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
.factory('oauthKakao', ['$q', '$http', '$cordovaOauthUtility', function($q, $http, $cordovaOauthUtility) {
  return {
    signin : function(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = 'http://localhost/callback';
          if(options !== undefined) {
            if(options.hasOwnProperty('redirect_uri')) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://kauth.kakao.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              console.log('oauthKakao loadstart', event);
              browserRef.removeEventListener('exit',function(event){});
              //browserRef.close();
              var responseParameters = (event.url).split('?')[1].split('&');
              var parameterMap = [];
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
              }
              if(parameterMap.code !== undefined && parameterMap.code !== null) {
                $http({
                  method: 'POST',
                  url: 'https://kauth.kakao.com/oauth/token',
                  params: {
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    redirect_uri: redirect_uri,
                    code: parameterMap.code
                  }
                })
                .then(function(response) {
                  console.log('oauthKakao token response', response);
                  deferred.resolve({ access_token: response.data.access_token, token_type: response.data.token_type, expires_in: response.data.expires_in, refresh_token: response.data.refresh_token });
                }, function(err) {
                  console.error('oauthKakao token error', err);
                  deferred.reject('Problem in getting token.');
                })
                .finally(function() {
                  browserRef.close();
                });
              } else {
                deferred.reject('Problem authenticating');
              }
            }
          });
          browserRef.addEventListener('exit', function(event) {
            deferred.reject('The sign in flow was canceled');
          });
        } else {
          deferred.reject('Could not find InAppBrowser plugin');
        }
      } else {
        deferred.reject('Cannot authenticate via a web browser');
      }
      return deferred.promise;
    }
  }
}])
.controller('main', ['$scope', '$http', '$cordovaOauth', 'oauthKakao', function($scope, $http, $cordovaOauth, oauthKakao) {
  $scope.isFBLoggedIn = false;
  $scope.isFSquareLoggedIn = false;
  $scope.isGoogleLoggedIn = false;
  $scope.isKakaoLoggedIn = false;

  $scope.loginFB = function() {
    $cordovaOauth.facebook('1765072327115352', ['public_profile', 'email'])
    .then(function(result) {
      console.log('FB result', result);
      $http.get(
        'https://graph.facebook.com/v2.7/me',
        {
          params: {
            access_token: result.access_token,
            fields: 'id, name, first_name, last_name, age_range, link, gender, locale, picture, timezone, updated_time, verified, email',
            format: 'json'
          }
        }
      )
      .then(function (result) {
        console.log('FB me result', result);
        $scope.isFBLoggedIn = true;
      }, function(err) {
        console.error('FB me error', err);
        $scope.isFBLoggedIn = false;
      });
    }, function(err) {
      console.error('FB error', err);
      $scope.isFBLoggedIn = false;
    });
  };

  $scope.logoutFB = function() {

  };

  $scope.loginFSquare = function() {
    $cordovaOauth.foursquare('QEA4FRXVQNHKUQYFZ3IZEU0EI0FDR0MCZL0HEZKW11HUNCTW')
      .then(function(result) {
        console.log('FSquare result', result);
        $scope.isFSquareLoggedIn = true;
      }, function(err) {
        console.error('FSquare error', err);
        $scope.isFSquareLoggedIn = false;
      });
  }

  $scope.logoutFSquare = function() {

  }

  $scope.loginGoogle = function() {
    $cordovaOauth.google('874932627400-nq8qrguk2uof410o4sbv0hob82r9cr6s.apps.googleusercontent.com', ['https://www.googleapis.com/auth/userinfo.profile'])
    .then(function(result) {
      console.log('Google result', result);
      $http.get('https://www.googleapis.com/userinfo/v2/me',
      {
        headers: {
          Authorization: result.token_type + ' ' + result.access_token
        }
      })
      .then(function(result) {
        console.log('Google me result', result);
        $scope.isGoogleLoggedIn = true;
      }, function(err) {
        console.error('Google me error', err);
        $scope.isGoogleLoggedIn = false;
      });
    }, function(err) {
      console.error('Google error', err);
      $scope.isGoogleLoggedIn = false;
    });
  }

  $scope.logoutGoogle = function() {

  }

  $scope.loginKakao = function() {
    oauthKakao.signin('cb7479018234a9feda2d82f6bbdd1682')
    .then(function(result) {
      console.log('loginKakao result', result);
      $http.get('https://kapi.kakao.com/v1/user/me',
      {
        headers: {
          Authorization: result.token_type + ' ' + result.access_token
        }
      })
      .then(function(result) {
        console.log('Kakao me result', result);
        $scope.isKakaoLoggedIn = true;
      }, function(err) {
        console.error('Kakao me error', err);
        $scope.isKakaoLoggedIn = false;
      });
    }, function(err) {
      console.error('loginKakao error', err);
      $scope.isKakaoLoggedIn = false;
    });
  }
}]);

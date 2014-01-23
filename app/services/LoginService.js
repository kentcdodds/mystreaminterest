angular.module('msi').factory('LoginService', function(Firebase, $firebaseSimpleLogin, $rootScope, $http, StreamGenerator, $q) {
  var firebaseRef = new Firebase('https://mystreaminterest.firebaseio.com');
  var loginObj = $firebaseSimpleLogin(firebaseRef);

  var providers = {
    facebook: {
      config: {
        scope: 'read_stream'
      },
      streamUrl: 'https://graph.facebook.com/me/home'
    },
    twitter: {
      config: {},
      streamUrl: 'https://api.twitter.com/1.1/statuses/home_timeline.json'
    }
  };

  // This handles the case where the user is logged in when the app is opened initially.
  var firstWatchExecuted = false;
  var tempWatch = $rootScope.$watch(function() {
    return loginObj.user;
  }, function(user) {
    if (firstWatchExecuted) {
      broadcastStateChange(user);
      tempWatch();
    } else {
      firstWatchExecuted = true;
    }
  });

  function broadcastStateChange(user) {
    $rootScope.$broadcast('userStateChange', user);
  }

  return {
    logout: function() {
      loginObj.$logout();
      broadcastStateChange();
    },
    login: function(provider, rememberMe) {
      var conf = providers[provider].config;
      conf.rememberMe = rememberMe;
      loginObj.$login(provider, conf).then(function(user) {
        broadcastStateChange(user);
      }, function(error) {
        console.log('Error logging in: ', error);
        // TODO: Handle this...
      });
    },
    getUser: function() {
      return loginObj.$getCurrentUser();
    },
    getStream: function(provider) {
      var url = providers[provider].streamUrl;
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: url + '?access_token=' + loginObj.user.accessToken
      }).success(function(data) {
        var stream = StreamGenerator[provider](data);
        deferred.resolve(stream);
      }).error(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }
  }
});
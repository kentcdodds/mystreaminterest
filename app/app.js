(function() {
  var app = angular.module('msi', ['firebase']);

  app.constant('Firebase', Firebase);

  app.controller('MainCtrl', function($scope, Firebase, $firebaseSimpleLogin, $http) {
    $scope.loginObj = $firebaseSimpleLogin(new Firebase('https://mystreaminterest.firebaseio.com'));

    $scope.login = {
      facebook: function() {
        $scope.loginObj.$login('facebook', {
          scope: 'read_stream'
        });
      },
      twitter: function() {
        $scope.loginObj.$login('twitter');
      }
    };

    $scope.loadPosts = function() {
      getStream($scope.loginObj.provider);
    };
    function getStream(provider) {
      var url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
      if (provider === 'facebook') {
        url = 'https://graph.facebook.com/me/home';
      }
      $http({
        method: 'GET',
        url: url + '?access_token=' + $scope.loginObj.user.accessToken
      }).then(function(data) {
        $scope.posts = data;
        console.log(data);
      });
    }
  });
})();
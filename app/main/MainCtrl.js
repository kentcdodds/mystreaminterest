angular.module('msi').controller('MainCtrl', function($scope, LoginService, _) {
  $scope.login = LoginService.login;
  $scope.logout = LoginService.logout;
  $scope.getStream = function() {
    LoginService.getStream($scope.user.provider).then(function success(stream) {
      $scope.stream = stream;
      $scope.currentPostIndex = 0;
    }, function error(err) {
      console.log(err);
      // TODO deal with this.
    });
  };
  $scope.interestPercent = 0;

  $scope.keypress = function($event) {
    switch($event.keyCode) {
      case 39:
        if ($scope.currentPostIndex < $scope.stream.length - 1) {
          $scope.currentPostIndex++;
        }
        break;
      case 37:
        if ($scope.currentPostIndex > 0) {
          $scope.currentPostIndex--;
        }
        break;
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
        $scope.stream[$scope.currentPostIndex].rating = $event.keyCode - 48;
        $scope.stream[$scope.currentPostIndex].rated = true;
        break;
    }
  };

  $scope.$watch('stream', function(stream) {
    var totalRating = 0;
    var ratedItems = 0;
    _.each(stream, function(post) {
      if (post.rating || post.rated) {
        ratedItems++;
        totalRating += post.rating;
      }
    });
    $scope.interestPercent = Math.floor(totalRating / (ratedItems * 5) * 100) || 0;
  }, true);
  $scope.$on('userStateChange', function(event, user) {
    $scope.user = user;
  });
});
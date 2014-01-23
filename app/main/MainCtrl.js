angular.module('msi').controller('MainCtrl', function($scope, _, LoginService) {
  $scope.login = LoginService.login;
  $scope.logout = LoginService.logout;
  $scope.getStream = function() {
    LoginService.getStream($scope.user.provider).then(function success(stream) {
      $scope.stream = stream;
    }, function error(err) {
      console.log(err);
      // TODO deal with this.
    });
  };
  $scope.interestPercent = 0;

  $scope.$watch('stream', function(stream) {
    var totalRating = 0;
    var ratedItems = 0;
    _.each(stream, function(post) {
      if (post.rating) {
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
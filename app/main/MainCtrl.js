angular.module('msi').controller('MainCtrl', function($scope, LoginService, _, $window) {
  $scope.login = LoginService.login;
  $scope.logout = function() {
    $scope.stream = null;
    LoginService.logout();
  };
  $scope.getStream = function() {
    $scope.refreshingStream = true;
    LoginService.getStream($scope.user.provider).then(function success(stream) {
      $scope.stream = stream;
      $scope.currentPostIndex = 0;
      $scope.refreshingStream = false;
    }, function error(err) {
      $scope.refreshingStream = false;
      console.log(err);
      // TODO deal with this.
    });
  };
  $scope.interestPercent = 0;


  function getFacebookUrl(interestPercent) {
    var fUrl = encodeURIComponent('p[url]') + '=' + encodeURIComponent('http://www.bucketstreams.com');
    var fTitle = encodeURIComponent('p[title]') + '=' + encodeURIComponent('I scored ' + interestPercent + '%! What\'s your news feed interest score?');
    var fSummary = encodeURIComponent('p[summary]') + '=' + encodeURIComponent('We all know that not everything we see on social media is 100% interesting to us. See how interesting your news feed is to you! You\'ll be surprised by the results...');
    var fImages = encodeURIComponent('p[images][0]') + '=' + encodeURIComponent('');
    var uri = 'http://www.facebook.com/sharer.php?s=100';

    return [uri, fUrl, fTitle, fSummary, fImages].join('&');
  }

  $scope.share = function(interestPercent) {
    $window.open(getFacebookUrl(interestPercent));
  };

  function movePosition(amount) {
    if (amount > 0) {
      if ($scope.currentPostIndex < $scope.stream.length) {
        $scope.currentPostIndex++;
      }
    } else {
      if ($scope.currentPostIndex > 0) {
        $scope.currentPostIndex--;
      }
    }
  }

  $scope.keypress = function($event) {
    if (!$scope.stream) {
      return;
    }
    var currentPost = $scope.stream[$scope.currentPostIndex];
    var keyCode = $event.keyCode;
    var newRating = null;
    if (keyCode === 37 || keyCode === 39) {
      $scope.$safeApply(function() {
        movePosition(keyCode - 38);
      });
    } else if ((keyCode === 38 || keyCode === 40) && currentPost) {
      var currentRating = currentPost.rating || 0;
      var move = keyCode - 39;
      if (move > 0) {
        move = currentRating < 5 ? 1 : 0;
      } else {
        move = currentRating > 0 ? -1 : 0;
      }
      newRating = currentRating + move;
      currentPost.preventAutoAdvance = true;
    } else if (keyCode >= 48 && keyCode <= 53) {
      newRating = keyCode - 48;
    } else if (keyCode === 192) {
      newRating = 0;
    } else {
      return;
    }

    if (currentPost && newRating !== null) {
      currentPost.rated = true;
      currentPost.rating = newRating;
      $scope.$safeApply();
    }
    $event.preventDefault();
  };
  var initialLoad = true;

  $scope.$watch(function() {
    return _.pluck($scope.stream || [], 'rating');
  }, function() {
    if (!$scope.stream) {
      return;
    }
    var totalRating = 0;
    var ratedItems = 0;
    _.each($scope.stream, function(post) {
      if (post.rating || post.rated) {
        ratedItems++;
        totalRating += post.rating;
      }
    });
    $scope.interestPercent = Math.floor(totalRating / (ratedItems * 5) * 100) || 0;
    switch(Math.floor($scope.interestPercent / 25)) {
      case 0:
        $scope.interestExclamation = 'Ouch! A whopping';
        break;
      case 1:
        $scope.interestExclamation = 'Wow! A whole';
        break;
      case 2:
        $scope.interestExclamation = 'Interesting...';
        break;
      case 3:
        $scope.interestExclamation = 'Huh...';
        break;
      case 4:
        $scope.interestExclamation = 'Amazing!';
        break;
    }
    var currentPost = $scope.stream[$scope.currentPostIndex];
    if (initialLoad) {
      initialLoad = false;
    } else if (!currentPost.preventAutoAdvance) {
      movePosition(1);
    } else {
      currentPost.preventAutoAdvance = false;
    }
  }, true);
  $scope.$on('userStateChange', function(event, user) {
    $scope.user = user;
    if (user) {
      $scope.getStream();
    }
  });
});

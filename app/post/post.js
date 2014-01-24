angular.module('msi').directive('msiPost', function() {
  return {
    restrict: 'A',
    scope: {
      post: '=msiPost'
    },
    templateUrl: './app/post/post.html'
  }
});
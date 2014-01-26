(function() {
  var app = angular.module('msi', ['firebase', 'ui.bootstrap', 'pasvaz.bindonce', 'Scope.safeApply']);

  app.constant('Firebase', Firebase);
  app.constant('_', _);
})();
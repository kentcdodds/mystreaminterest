(function() {
  var app = angular.module('msi', ['firebase', 'ui.bootstrap', 'pasvaz.bindonce']);

  app.constant('Firebase', Firebase);
  app.constant('_', _);
})();
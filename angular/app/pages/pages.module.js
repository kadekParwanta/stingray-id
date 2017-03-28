/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages', [
    'ui.router',

    'BlurAdmin.pages.dashboard',
    'BlurAdmin.pages.perencanaan',
    'BlurAdmin.pages.penganggaran',
    'BlurAdmin.pages.pengaturan',
    'BlurAdmin.pages.profildesa'
  ])
    .config(routeConfig)
    .run(function ($http, $rootScope) {
      $http.get('/config')
        .then(function (res) {
          $rootScope.dropboxToken = res.data.dropbox;
        })
        .catch(function (err) {
          console.log(err);
        });
    });

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    $urlRouterProvider.otherwise('/dashboard');
  }

})();

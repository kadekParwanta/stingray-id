/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages', [
    'ui.router',
    'ui.bootstrap',
    'BlurAdmin.pages.dashboard',
    'BlurAdmin.pages.perencanaan',
    'BlurAdmin.pages.penganggaran',
    'BlurAdmin.pages.pengaturan'
  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    $urlRouterProvider.otherwise('/dashboard');
  }

})();

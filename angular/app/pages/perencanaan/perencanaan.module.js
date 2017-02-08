/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('perencanaan', {
          url: '/perencanaan',
          template : '<ui-view></ui-view>',
          abstract: true,
          title: 'Perencanaan',
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 500,
          },
        })
        .state('perencanaan.rpjmdes', {
          url: '/rpjmdes',
          templateUrl: 'app/pages/perencanaan/rpjmdes/rpjmdes.html',
          controller: 'RpjmdesPageCtrl',
          title: 'RPJMDesa',
          sidebarMeta: {
            order: 0,
          },
        })
        .state('perencanaan.rkp', {
          url: '/rkp',
          templateUrl: 'app/pages/perencanaan/rkp/rkp.html',
          controller: 'RkpPageCtrl',
          title: 'RKP',
          sidebarMeta: {
            order: 100,
          },
        });
  }

})();

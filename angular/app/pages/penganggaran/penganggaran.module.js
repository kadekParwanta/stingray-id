/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran', [])
      .config(routeConfig)
      .config(function(){
      $.jstree.defaults.core.themes.url = true;
      $.jstree.defaults.core.themes.dir = "assets/img/theme/vendor/jstree/dist/themes";
    });

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('penganggaran', {
          url: '/penganggaran',
          template : '<ui-view></ui-view>',
          abstract: true,
          title: 'Penganggaran',
          sidebarMeta: {
            icon: 'ion-ios-cart',
            order: 500,
          },
        })
        .state('penganggaran.pendapatan', {
          url: '/pendapatan',
          templateUrl: 'app/pages/penganggaran/pendapatan/pendapatan.html',
          controller: 'PendapatanPageCtrl',
          title: 'Pendapatan',
          sidebarMeta: {
            order: 0,
          },
        })
        .state('penganggaran.belanja', {
          url: '/belanja',
          templateUrl: 'app/pages/penganggaran/belanja/belanja.html',
          controller: 'BelanjaPageCtrl',
          title: 'Belanja',
          sidebarMeta: {
            order: 1,
          },
        })
        .state('penganggaran.pembiayaan', {
          url: '/biaya',
          templateUrl: 'app/pages/penganggaran/pembiayaan/pembiayaan.html',
          controller: 'PembiayaanPageCtrl',
          title: 'Pembiayaan',
          sidebarMeta: {
            order: 2,
          },
        });
  }

})();

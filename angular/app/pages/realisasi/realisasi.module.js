/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.realisasi', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('realisasi', {
          url: '/realisasi',
          template : '<ui-view></ui-view>',
          abstract: true,
          title: 'Realisasi',
          sidebarMeta: {
            icon: 'ion-android-checkbox-outline',
            order: 5,
          },
        })
        .state('realisasi.ringkasan', {
          url: '/ringkasan',
          title: 'Ringkasan',
          templateUrl: 'app/pages/realisasi/ringkasan/ringkasan.html',
          controller: 'RingkasanPageCtrl',
          sidebarMeta: {
            icon: 'ion-person-stalker',
            order: 0,
          },
        })
        .state('realisasi.timelinePendapatan', {
          url: '/timelinePendapatan',
          title: 'Pendapatan',
          templateUrl: 'app/pages/realisasi/pendapatan/timelinePendapatan.html',
          controller: 'TimelinePendapatanPageCtrl',
          sidebarMeta: {
            icon: 'ion-person-stalker',
            order: 1,
          },
        })
        .state('realisasi.timelineBelanja', {
          url: '/timelineBelanja',
          title: 'Belanja',
          templateUrl: 'app/pages/realisasi/belanja/timelineBelanja.html',
          controller: 'TimelineBelanjaPageCtrl',
          sidebarMeta: {
            icon: 'ion-person-stalker',
            order: 2,
          },
        })
        .state('realisasiitem', {
          url: '/realisasiitem/:id',
          title: 'Detail',
          templateUrl: 'app/pages/realisasi/item/item.html',
          controller: 'ItemTimelineCtrl',
          resolve: {
              rkpId: function($stateParams) {
                  return $stateParams.id;
              }
          }
        });
  }

})();

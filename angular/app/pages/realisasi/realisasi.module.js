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
        .state('realisasi.timeline', {
          url: '/timeline',
          title: 'Timeline',
          templateUrl: 'app/pages/realisasi/timeline/timeline.html',
          controller: 'TimelinePageCtrl',
          sidebarMeta: {
            icon: 'ion-person-stalker',
            order: 1,
          },
        })
        .state('realisasiitem', {
          url: '/realisasiitem/:id',
          title: 'Detail',
          templateUrl: 'app/pages/realisasi/item/item.html',
          controller: 'ItemTimelineCtrl',
          resolve: {
              timeLineId: function($stateParams) {
                  return $stateParams.id;
              }
          }
        });
  }

})();

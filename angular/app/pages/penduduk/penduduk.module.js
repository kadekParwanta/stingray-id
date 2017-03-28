/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penduduk', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('penduduk', {
          url: '/penduduk',
          title: 'Penduduk',
          templateUrl: 'app/pages/penduduk/penduduk.html',
          controller: 'PendudukPageCtrl',
          sidebarMeta: {
            icon: 'ion-person-stalker',
            order: 4,
          },
        }).state('penduduk-detail', {
          url: '/penduduk/:id',
          title: 'Keluarga',
          templateUrl: 'app/pages/penduduk/keluarga/keluarga.html',
          controller: 'KeluargaDetailPageCtrl',
          resolve: {
              keluargaId : function($stateParams) {
                  return $stateParams.id;
              }
          }
        });
  }

})();

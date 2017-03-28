/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.profildesa', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('profil-desa', {
          url: '/profil-desa',
          title: 'Profil Desa',
          templateUrl: 'app/pages/profil-desa/profil-desa.html',
          controller: 'ProfilDesaPageCtrl',
          sidebarMeta: {
            icon: 'ion-information-circled',
            order: 4,
          },
        });
  }

})();

/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.pengaturan', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('pengaturan', {
          url: '/pengaturan',
          templateUrl: 'app/pages/pengaturan/setting/setting.html',
          controller: 'SettingPageCtrl',
          title: 'Pengaturan',
          sidebarMeta: {
            icon: 'ion-gear-b',
            order: 600,
          },
        })
        .state('pengaturan-rpjm', {
          url: '/setting/:id',
          templateUrl: 'app/pages/pengaturan/setting/rpjmdetail.html',
          controller: 'RPJMDetailPageCtrl',
          resolve : {
            rpjmId : function($stateParams){
              return $stateParams.id;
            }
          },
          title: 'RPJM'
        });
  }

})();

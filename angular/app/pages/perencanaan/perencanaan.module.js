/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan', [])
      .config(routeConfig)
      .config(function(){
      $.jstree.defaults.core.themes.url = true;
      $.jstree.defaults.core.themes.dir = "assets/img/theme/vendor/jstree/dist/themes";
    });

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
        })
        .state('perencanaan.setting', {
          url: '/setting',
          templateUrl: 'app/pages/perencanaan/setting/setting.html',
          controller: 'SettingPageCtrl',
          title: 'Setting',
          sidebarMeta: {
            order: 100,
          },
        })
        .state('perencanaan.rpjm', {
          url: '/setting/:id',
          templateUrl: 'app/pages/perencanaan/setting/rpjmdetail.html',
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

/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages', [
    'ui.router',

    'BlurAdmin.pages.dashboard',
    // 'BlurAdmin.pages.components',
    'BlurAdmin.pages.perencanaan',
    'BlurAdmin.pages.penganggaran',
    'BlurAdmin.pages.pengaturan',
    'BlurAdmin.pages.profildesa',
    'BlurAdmin.pages.penduduk',
    'BlurAdmin.pages.survey',
    'BlurAdmin.pages.realisasi'
  ])
    .config(routeConfig)
    .run(function ($http, $rootScope, $builder) {
      $http.get('/config')
        .then(function (res) {
          $rootScope.dropboxToken = res.data.dropbox;
        })
        .catch(function (err) {
          console.log(err);
        });

        //form-builder
      return $builder.registerComponent('name', {
        group: 'Default',
        label: 'Name',
        required: false,
        arrayToText: true,
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-md-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-md-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[0]\"\n                class=\"form-control\" id=\"{{formName+index}}-0\"/>\n            <p class='help-block'>First name</p>\n        </div>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[1]\"\n                class=\"form-control\" id=\"{{formName+index}}-1\"/>\n            <p class='help-block'>Last name</p>\n        </div>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"popover.save($event)\" class='btn btn-primary' value='Save'/>\n        <input type='button' ng-click=\"popover.cancel($event)\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"popover.remove($event)\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
      });
    });

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    $urlRouterProvider.otherwise('/dashboard');
  }

})();

'use strict';

angular.module('BlurAdmin', [
  'ngAnimate',
  'ui.bootstrap',
  'ui.sortable',
  'ui.router',
  'ngTouch',
  'toastr',
  'smart-table',
  "xeditable",
  'ui.slimscroll',
  'ngJsTree',
  'angular-progress-button-styles',
  'lbServices',
  // 'Dropbox',
  'BlurAdmin.theme',
  'BlurAdmin.pages',
  'builder',
  'builder.components',
  'validator.rules',
  'gantt',
  'gantt.table',
  'gantt.movable',
  'gantt.tooltips',
  'gantt.progress',
  'gantt.groups',
  'gantt.bounds',
  'gantt.tree',
  'gantt.overlap',
  'datatables'
])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push(function ($q) {
      return {
          'request': function (config) {
              return config;
          },

          'requestError': function (rejection) {
              return $q.reject(rejection);
          },

          'response': function (response) {
              return response;
          },
          
          'responseError': function (rejection) {
              var error = rejection.data.error;
              if (error && error.statusCode === 401) {
                  window.localStorage.clear();
                  window.location = "/#/login";
              }
              return $q.reject(rejection);
          }
      };
  });
});
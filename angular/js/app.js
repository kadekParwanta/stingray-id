// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app', [
    'lbServices',
    'ui.router',
    'ui.bootstrap',
    'datatables',
    'angularFileUpload'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {
    $stateProvider
      .state('school', {
        url: '/school',
        templateUrl: 'views/school.html',
        controller: 'SchoolController'
      })
      .state('student', {
        url: '/student',
        templateUrl: 'views/student.html',
        controller: 'StudentController'
      })
      .state('edit', {
        url: '/student/:studentId',
        templateUrl: 'views/student.edit.html',
        controller: 'StudentEditController'
      })
      .state('yearbook', {
        url: '/yearbook',
        templateUrl: 'views/yearbook.html',
        controller: 'YearbookController'
      })
      .state('create-yearbook', {
        url: '/yearbook/:yearbookId',
        templateUrl: 'views/yearbook.create.html',
        controller: 'YearbookController'
      });

    $urlRouterProvider.otherwise('school');
  }]);
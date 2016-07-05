// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('SchoolController', ['$scope', '$state', 'School', function($scope,
      $state, School) {
    $scope.schools = [];
    function getSchools() {
      School
        .find()
        .$promise
        .then(function(results) {
          $scope.schools = results;
        });
    }
    getSchools();

    $scope.addSchool = function() {
      School
        .create($scope.newSchool)
        .$promise
        .then(function(school) {
          $scope.newSchool = '';
          $scope.schoolForm.name.$setPristine();
          $scope.schoolForm.address.$setPristine();
          $('.focus').focus();
          getSchools();
        });
    };

    $scope.removeSchool = function(item) {
      School
        .deleteById(item)
        .$promise
        .then(function() {
          getSchools();
        });
    };
  }]);
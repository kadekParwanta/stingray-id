// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('YearbookController', ['$scope', '$state', 'Yearbook', 'School','$stateParams', function($scope,
      $state, Yearbook, School,$stateParams) {
    $scope.yearbooks = [];
    $scope.newYearbook = '';
    $scope.yearbookprices = [0,1000,2000,3000,4000,5000];

    $scope.currentYearbook = '';
    $scope.currentYearbookId = $stateParams.yearbookId;
    
    function getYearbookById(id) {
      Yearbook
        .findById({id:id})
        .$promise
        .then(function(yearbook) {
          $scope.currentYearbook = yearbook;
          $scope.today();
          $scope.school = yearbook.school;
        });
    }
    
    if ($scope.currentYearbookId) {
        getYearbookById($scope.currentYearbookId);
    }

    $scope.saveYearbook = function() {
        $scope.currentYearbook.year = $scope.year.getFullYear();
        $scope.currentYearbook.school = $scope.school;
        $scope.currentYearbook.price = $scope.yearbookprice;
        $scope.currentYearbook.$save()
        .then(function(student) {
          $state.go('yearbook');
        });
    };

    function getYearbooks() {
      Yearbook
        .find()
        .$promise
        .then(function(results) {
          $scope.yearbooks = results;
        });
    }
    getYearbooks();

    $scope.addYearbook = function() {
      Yearbook
        .create($scope.newYearbook)
        .$promise
        .then(function(yearbook) {
          $scope.newYearbook = '';
          $('.focus').focus();
          $scope.currentYearbook = yearbook;
          $state.go('create-yearbook',({yearbookId:yearbook.id}));
        });
    };

    $scope.editYearbook = function() {
      $scope.newYearbook.year = $scope.year.getFullYear();
      Yearbook
        .create($scope.newYearbook)
        .$promise
        .then(function(yearbook) {
          $scope.newYearbook = '';
          $scope.yearbookForm.fullname.$setPristine();
          $scope.yearbookForm.school.$setPristine();
          $('.focus').focus();
          getYearbooks();
        });
    };

    $scope.removeYearbook = function(item) {
      Yearbook
        .deleteById(item)
        .$promise
        .then(function() {
          getYearbooks();
        });
    };
    
    $scope.schools = [];
    function getSchools() {
      School
        .find()
        .$promise
        .then(function(results) {
          $scope.schools = results;
        });
    };
    
    getSchools();

    $scope.today = function () {
      $scope.year = new Date();
    };
    
    $scope.today();

    $scope.clear = function () {
      $scope.year = null;
    };

    $scope.open = function ($event) {
      $scope.status.opened = true;
    };

    $scope.setDate = function (year, month, day) {
      $scope.year = new Date(year, month, day);
    };

    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1,
      minMode: 'year'
    };

    $scope.formats = ['yyyy'];
    $scope.format = $scope.formats[0];

    $scope.status = {
      opened: false
    };

  }]);
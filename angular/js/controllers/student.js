// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('StudentController', ['$scope', '$state', 'Student', 'School', function($scope,
      $state, Student, School) {
    $scope.students = [];
    $scope.newStudent = '';
    function getStudents() {
      Student
        .find()
        .$promise
        .then(function(results) {
          $scope.students = results;
        });
    }
    getStudents();

    $scope.addStudent = function() {
      $scope.newStudent.gradyear = $scope.gradyear.getFullYear();
      Student
        .create($scope.newStudent)
        .$promise
        .then(function(student) {
          $scope.newStudent = '';
          $scope.studentForm.fullname.$setPristine();
          $scope.studentForm.school.$setPristine();
          $('.focus').focus();
          getStudents();
        });
    };

    $scope.removeStudent = function(item) {
      Student
        .deleteById(item)
        .$promise
        .then(function() {
          getStudents();
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
      $scope.gradyear = new Date();
    };
    
    $scope.today();

    $scope.clear = function () {
      $scope.gradyear = null;
    };

    $scope.open = function ($event) {
      $scope.status.opened = true;
    };

    $scope.setDate = function (year, month, day) {
      $scope.gradyear = new Date(year, month, day);
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
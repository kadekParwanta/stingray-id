// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('StudentEditController', ['$scope', '$state', 'Student', 'School', '$stateParams', function($scope,
      $state, Student, School, $stateParams) {
    $scope.students = [];
    $scope.currentStudent = '';
    $scope.currentStudentId = $stateParams.studentId;
    
    function getStudentById(id) {
      Student
        .findById({id:id})
        .$promise
        .then(function(student) {
          $scope.currentStudent = student;
          $scope.setDate(student.gradyear, 1, 1);
          $scope.school = student.school;
        });
    }
    
    getStudentById($scope.currentStudentId);
    
    $scope.saveStudent = function() {
        $scope.currentStudent.gradyear = $scope.gradyear.getFullYear();
        $scope.currentStudent.$save()
        .then(function(student) {
          $state.go('student');
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
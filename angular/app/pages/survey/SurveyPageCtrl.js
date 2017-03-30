/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.survey')
    .controller('SurveyPageCtrl', SurveyPageCtrl);

  /** @ngInject */
  function SurveyPageCtrl($scope, Survey, $uibModal) {
    var vm =this;
    $scope.surveys;
    $scope.smartTablePageSize = 10;
    
    getSurveyForms();

    function getSurveyForms() {
      Survey.find(function (surveys) {
        $scope.surveys = surveys;
      })
    }

    $scope.deleteForm = function(id) {
      Survey.deleteById({ id: id }, function () {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        getSurveyForms();
      })
    }

    $scope.open = function (page, size) {
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size
      });
    };
    
  }

})();

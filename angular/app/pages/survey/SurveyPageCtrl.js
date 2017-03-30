/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.survey')
    .controller('SurveyPageCtrl', SurveyPageCtrl);

  /** @ngInject */
  function SurveyPageCtrl($scope, Survey) {
    var vm =this;
    $scope.surveys;
    getSurveyForms();

    function getSurveyForms() {
      Survey.find(function (surveys) {
        $scope.surveys = surveys;
      })
    }
  }

})();


/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.survey')
        .controller('SurveyDataPageCtrl', SurveyDataPageCtrl);

    /** @ngInject */
    function SurveyDataPageCtrl($scope, surveyId, Survey, $uibModal) {
        var vm = this;
        $scope.surveydata;
        $scope.surveyFormData = [];
        $scope.smartTablePageSize = 10;
        $scope.headerTable = [];
        $scope.surveyId = surveyId;

        getSurveyDataForms(surveyId);

        function getSurveyDataForms(id) {
            Survey.findById({ id: id, filter: { include: ['Form', { 'SurveyData': 'SurveyFormData' }] } }, function (survey) {
                $scope.surveydata = survey.SurveyData;
                if (survey.SurveyData) {
                    var surveyFormData = survey.SurveyData.SurveyFormData;
                    if (surveyFormData) {
                        $scope.surveyFormData = surveyFormData
                    }
                }

                var formDefinition = survey.Form;
                formDefinition.forEach(function (element) {
                    $scope.headerTable.push(element.label);
                });

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

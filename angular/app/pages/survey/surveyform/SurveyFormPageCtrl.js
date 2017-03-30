
/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.survey')
        .controller('SurveyFormPageCtrl', SurveyFormPageCtrl);

    /** @ngInject */
    function SurveyFormPageCtrl($scope, surveyId, Survey, $uibModal, $builder, $validator, SurveyData, SurveyFormData, $state, $q) {
        var vm = this;
        $scope.input = [];
        $scope.surveyId = surveyId;

        $builder.forms['default'] = []
        $scope.form = $builder.forms['default'];
        $scope.defaultValue = {};


        getSurveyById(surveyId);

        $scope.open = function (page, size) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size
            });
        };

        function getSurveyById(id) {
            Survey.findById({ id: id, filter: { include: 'Form' } }, function (survey) {
                populateForm(survey);
            })
        }

        function populateForm(survey) {
            var formItems = survey.Form;
            formItems.forEach(function (entry) {
                $builder.addFormObject('default', {
                    id: entry.id,
                    component: entry.component,
                    label: entry.label,
                    description: entry.description,
                    options: entry.options,
                    placeholder: entry.placeholder,
                    required: entry.required,
                    editable: entry.editable
                })
            })
        }

        return $scope.submit = function () {
            return $validator.validate($scope, 'default').success(function () {
                SurveyData.create({SurveyId:$scope.surveyId, createdDate: new Date()}, function(res){
                    saveSurveyFormData($scope.input, res.id).then(function(data){
                        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
                        $state.go('surveydata', {id:$scope.surveyId});
                    })
                })
            }).error(function () {
                return console.log('error');
            });
        };

        function saveSurveyFormData(input, surveyDataId) {
            var promises = input.map(function (item) {
                var deferred = $q.defer();
                SurveyFormData.create({
                    value: item.value,
                    label: item.label,
                    SurveyDataId: surveyDataId
                }, function (res) {
                    deferred.resolve(res);
                })

                return deferred.promise;
            })

            return $q.all(promises);
        }

    }

})();

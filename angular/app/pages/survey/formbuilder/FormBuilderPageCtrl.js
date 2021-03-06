/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.survey')
    .controller('FormBuilderPageCtrl', FormBuilderPageCtrl);

  /** @ngInject */
  function FormBuilderPageCtrl($scope, $builder, $validator, surveyId, Survey, Form, $q, $uibModal, $state) {
    var vm = this;
    $scope.survey;
    $builder.forms['default'] = []
    $scope.form = $builder.forms['default'];

    if (surveyId != 0) {
      getSurveyById(surveyId);
    }

    function getSurveyById(id) {
      Survey.findById({ id: id, filter: { include: 'Form' } }, function (survey) {
        $scope.survey = survey;
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
          editable: entry.editable,
          validation: entry.validation
        })
      })
    }

    $scope.saveForm = function (form) {
      var id = $scope.survey.id;
      if (id) {
        Survey.prototype$patchAttributes({
          Nama: $scope.survey.Nama,
          id: id
        }, function (surveyRes) {
          Survey.Form.destroyAll({ id: surveyRes.id }, function (destroyRes) {
            saveSurveyForm(form, id).then(function (res) {
              $state.go('survey');
            })
          })

        })
      } else {
        Survey.create({ Nama: $scope.survey.Nama }, function (surveyRes) {
          saveSurveyForm(form, surveyRes.id).then(function (res) {
            $state.go('survey');
          })
        })
      }
    }

    function saveSurveyForm(formItems, surveyId) {
      var promises = formItems.map(function (item) {
        var deferred = $q.defer();
        Form.create({
          component: item.component,
          label: item.label,
          description: item.description,
          options: item.options,
          required: item.required,
          editable: item.editable,
          validation: item.validation,
          SurveyId: surveyId
        }, function (res) {
          deferred.resolve(res);
        })

        return deferred.promise;
      })

      return $q.all(promises);
    }
  }

})();

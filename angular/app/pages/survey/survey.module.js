/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.survey', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('survey', {
          url: '/survey',
          title: 'Survey',
          templateUrl: 'app/pages/survey/survey.html',
          controller: 'SurveyPageCtrl',
          sidebarMeta: {
            icon: 'ion-grid',
            order: 6,
          },
        })
        .state('formbuilder', {
          url: '/formbuilder/:id',
          title: 'Form Builder',
          templateUrl: 'app/pages/survey/formbuilder/formbuilder.html',
          controller: 'FormBuilderPageCtrl',
          resolve: {
              surveyId: function($stateParams) {
                  return $stateParams.id;
              }
          }
        })
        .state('surveydata', {
          url: '/surveydata/:id',
          title: 'Survey Data',
          templateUrl: 'app/pages/survey/surveydata/surveydata.html',
          controller: 'SurveyDataPageCtrl',
          resolve: {
              surveyId: function($stateParams) {
                  return $stateParams.id;
              }
          }
        })
        .state('surveyform', {
          url: '/surveyform/:id',
          title: 'Survey',
          templateUrl: 'app/pages/survey/surveyform/surveyform.html',
          controller: 'SurveyFormPageCtrl',
          resolve: {
              surveyId: function($stateParams) {
                  return $stateParams.id;
              }
          }
        });
  }

})();

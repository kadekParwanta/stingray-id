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
            order: 5,
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
        });
  }

})();

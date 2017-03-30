/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.survey')
    .controller('FormBuilderPageCtrl', FormBuilderPageCtrl);

  /** @ngInject */
  function FormBuilderPageCtrl($scope, $builder, $validator) {
    var vm =this;
      $scope.form = $builder.forms['default'];
      return $scope.submit = function() {
        return $validator.validate($scope, 'default').success(function() {
          return console.log('success');
        }).error(function() {
          return console.log('error');
        });
      };
  }

})();

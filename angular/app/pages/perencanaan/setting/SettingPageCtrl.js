/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
      .controller('SettingPageCtrl', SettingPageCtrl);

  /** @ngInject */
  function SettingPageCtrl(RPJM, $scope) {
    var vm = this;
    $scope.RPJMList = [];

    function getRPJM() {
            RPJM.find(function (result) {
                $scope.RPJMList = result;
            })
        }

    getRPJM();



    $scope.deleteRPJM = function(rpjm) {
      RPJM.deleteById({id:rpjm.id}, function(){

      })
    }
  }

})();

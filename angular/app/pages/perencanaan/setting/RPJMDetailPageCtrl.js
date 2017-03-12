/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
      .controller('RPJMDetailPageCtrl', RPJMDetailPageCtrl);

  /** @ngInject */
  function RPJMDetailPageCtrl(RPJM, $scope, rpjmId, $state) {
    var vm = this;
    $scope.rpjm = {};
    console.log("rpjmId= " + rpjmId);

    if (rpjmId !== "0") {
      RPJM.findById({id : rpjmId}, function(rpjm){
        $scope.rpjm = rpjm;
      })
    }

    $scope.save = function() {
      if (rpjmId === "0") {
        RPJM.create($scope.rpjm, function(rpjm){
          $state.go('perencanaan.setting');
        }, function(err){
          alert(err.data.error.message);
        })
      } else {
        RPJM.prototype$updateAttributes($scope.rpjm, function(rpjm){
          $state.go('perencanaan.setting');
        }, function(err){
          alert(err.data.error.message);
        })
      }
    }

  }

})();

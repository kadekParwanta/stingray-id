/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('RPJMDetailPageCtrl', RPJMDetailPageCtrl);

  /** @ngInject */
  function RPJMDetailPageCtrl(RPJM, $scope, rpjmId, $state, $uibModal, Bidang) {
    var vm = this;
    $scope.rpjm = {};
    $scope.BidangList = [];
    $scope.isNewRPJM = false;

    function init() {
      if (rpjmId !== "0") {
        RPJM.findById({ id: rpjmId, filter : { include: "Bidang" }}, function (rpjm) {
          $scope.rpjm = rpjm;
          $scope.BidangList = rpjm.Bidang;
        })
      } else {
        $scope.isNewRPJM = true;
      }
    }

    init()

    $scope.save = function () {
      if ($scope.isNewRPJM) {
        RPJM.create($scope.rpjm, function (rpjm) {
          $state.go('perencanaan.setting');
        }, function (err) {
          alert(err.data.error.message);
        })
      } else {
        RPJM.prototype$updateAttributes($scope.rpjm, function (rpjm) {
          $state.go('perencanaan.setting');
        }, function (err) {
          alert(err.data.error.message);
        })
      }
    }


    $scope.open = function (page, size) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        controller: RpjmModalInstanceCtrl,
        controllerAs: 'vm'
      });

      modalInstance.result.then(function (data) {
        if (!$scope.isNewRPJM && !data.id) {
          Bidang.create({
            No:data.No,
            Nama:data.Nama,
            RPJMId:rpjmId
          }, function(bidang){
            $scope.BidangList.push(bidang);
          })
        }
        
      })
    };

  }

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('RpjmModalInstanceCtrl', RpjmModalInstanceCtrl);

  function RpjmModalInstanceCtrl($uibModalInstance) {
    var vm = this;
    vm.Bidang;

    vm.ok = function () {
      $uibModalInstance.close(vm.Bidang);
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

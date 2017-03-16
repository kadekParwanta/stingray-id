/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.pengaturan')
    .controller('RPJMDetailPageCtrl', RPJMDetailPageCtrl);

  /** @ngInject */
  function RPJMDetailPageCtrl(RPJM, $scope, rpjmId, $state, $uibModal, Bidang) {
    var vm = this;
    $scope.rpjm = {};
    $scope.BidangList = [];
    $scope.isNewRPJM = false;

    function init() {
      if (rpjmId !== "0") {
        RPJM.findById({ id: rpjmId, filter : { include: {relation : "Bidang", scope : {order:"No ASC"}}}}, function (rpjm) {
          $scope.rpjm = rpjm;
          $scope.BidangList = rpjm.Bidang;
        })
      } else {
        $scope.isNewRPJM = true;
      }
    }

    init();

    $scope.editBidang = function (bidang) {
      Bidang.prototype$updateAttributes({
        id: bidang.id,
        Nama: bidang.Nama,
        No: bidang.No
      }, function (result) {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
      })
    }

    $scope.deleteBidang = function (bidang) {
      Bidang.deleteById({ id: bidang.id }, function () {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        var ind = $scope.BidangList.indexOf(bidang);
        $scope.BidangList.splice(ind, 1);

      })
    }

    $scope.save = function () {
      if ($scope.isNewRPJM) {
        RPJM.create($scope.rpjm, function (rpjm) {
          $state.go('pengaturan');
        }, function (err) {
          alert(err.data.error.message);
        })
      } else {
        RPJM.prototype$updateAttributes($scope.rpjm, function (rpjm) {
          $state.go('pengaturan');
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

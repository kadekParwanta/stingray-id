/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('GagasanPageCtrl', GagasanPageCtrl);

  /** @ngInject */
  function GagasanPageCtrl($scope, fileReader, $filter, $uibModal, RPJM, Gagasan) {
    $scope.activeRPJM;
    $scope.gagasanList;

    getGagasan();

    function getGagasan() {
      RPJM.findOne({
        filter: {
          where: { IsActive: true },
          include: [{
            relation: "Gagasan",
            scope: {
              order: "No ASC"
            }
          }]
        }
      }, function (result) {
        $scope.activeRPJM = {
          TahunMulai: result.TahunMulai,
          TahunSelesai: result.TahunSelesai,
          Regulasi: result.Regulasi,
          Perihal: result.Perihal,
          Keterangan: result.Keterangan,
          id: result.id
        }

        $scope.gagasanList = result.Gagasan;
      })
    }

    $scope.open = function (page, size) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        controller: GagasanModalInstanceCtrl,
        controllerAs: 'vm',
      });

      modalInstance.result.then(function (data) {
        var newGagasan = data.gagasan;
        newGagasan.RPJMId = $scope.activeRPJM.id;
        Gagasan.create(newGagasan, function (gagasan) {
          getGagasan();
        })
      })
    };
  }

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('GagasanModalInstanceCtrl', GagasanModalInstanceCtrl);

  function GagasanModalInstanceCtrl($uibModalInstance) {
    var vm = this;
    vm.newGagasan = {};

    vm.ok = function () {
      $uibModalInstance.close({
        gagasan: vm.newGagasan
      });
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

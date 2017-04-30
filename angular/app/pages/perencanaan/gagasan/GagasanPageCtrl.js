/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('GagasanPageCtrl', GagasanPageCtrl);

  /** @ngInject */
  function GagasanPageCtrl($scope, fileReader, $filter, $uibModal, RPJM, Gagasan, RPJMDes) {
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
          }, {
            relation: "Bidang",
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
        $scope.bidangList = result.Bidang;
      })
    }

    $scope.goToDetail = function (gagasan) {
      $scope.open('app/pages/perencanaan/gagasan/gagasanDetailModal.html', 'lg', gagasan);
    }

    $scope.open = function (page, size, gagasan) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        controller: GagasanModalInstanceCtrl,
        controllerAs: 'vm',
        resolve: {
          gagasan: function () {
            return gagasan;
          },
          bidangList: function () {
            return $scope.bidangList;
          }
        }
      });

      modalInstance.result.then(function (data) {
        var newGagasan = data.newGagasan;
        var gagasan = data.gagasan;
        var bidangId = data.BidangId;

        if (newGagasan) {
          newGagasan.RPJMId = $scope.activeRPJM.id;
          Gagasan.create(newGagasan, function (gagasan) {
            getGagasan();
          })
        } else if (gagasan) {
          var updatedGagasan = angular.copy(gagasan);
          if (bidangId) {
            RPJMDes.create({
              SubBidang: updatedGagasan.Nama,
              Lokasi: updatedGagasan.Lokasi,
              PrakiraanVolume: updatedGagasan.Volume,
              BidangId: bidangId
            }, function (res) {
              updatedGagasan.RPJMDesId = res.id;
              updatedGagasan.Sah = true;
              Gagasan.prototype$updateAttributes(updatedGagasan, function (res) {
                getGagasan();
              })
            })
          } else {
            Gagasan.prototype$updateAttributes(updatedGagasan, function (res) {
              getGagasan();
            })
          }

        }

      })
    };
  }

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('GagasanModalInstanceCtrl', GagasanModalInstanceCtrl);

  function GagasanModalInstanceCtrl($uibModalInstance, gagasan, bidangList) {
    var vm = this;
    vm.newGagasan = {};
    if (gagasan) vm.gagasan = gagasan;
    vm.bidangList = bidangList;

    vm.ok = function () {
      var result = {}
      if (gagasan) {
        result = {
          gagasan: vm.gagasan,
          BidangId: vm.BidangId
        }
      } else {
        result = {
          newGagasan: vm.newGagasan
        }
      }
      $uibModalInstance.close(result);
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

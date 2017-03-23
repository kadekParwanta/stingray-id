/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('PembiayaanPageCtrl', PembiayaanPageCtrl);

  /** @ngInject */
  function PembiayaanPageCtrl(RPJM, $timeout, $scope) {
    var vm = this;
    vm.treeData = [];
    vm.treesData = [];

    $scope.waktuPelaksanaanList = [];
    $scope.biayaList = [];
    $scope.activeRPJM;
    $scope.basicTrees = [];
    $scope.biayaConfigs = [];
    $scope.treesData = [];
    $scope.ignoreChanges = false;

    $scope.biayaConfig = {
      core: {
        multiple: false,
        check_callback: true,
        worker: true
      },
      types: {
        biaya: {
          icon: 'fa fa-money'
        },
        subbiaya: {
          icon: 'fa fa-credit-card'
        },
        anggaranbiaya: {
          icon: 'ion-bag'
        }
      },
      plugins: ['types', 'ui'],
      version: 1
    }

    function getActiveRPJM() {
      RPJM.findOne({
        filter: {
          where: { IsActive: true },
          include: [
            {
              relation: "WaktuPelaksanaan",
              scope: {
                order: "No ASC"
              }
            },
            {
              relation: "Biaya",
              scope: {
                include: "SubBiaya"
              }
            }
          ]
        }
      }, function (result) {
        $scope.activeRPJM = {
          TahunMulai: result.TahunMulai,
          TahunSelesai: result.TahunSelesai,
          Regulasi: result.Regulasi,
          Perihal: result.Perihal,
          Keterangan: result.Keterangan
        }

        $scope.waktuPelaksanaanList = result.WaktuPelaksanaan;
        $scope.biayaList = result.Biaya;
        vm.treesData.length = $scope.waktuPelaksanaanList.length;
        populateBiaya($scope.biayaList);
      })
    }

    function populateBiaya(biayaList) {
      vm.treeData.length = 0;
      angular.forEach(biayaList, function (biaya) {
        vm.treeData.push({
          "id": biaya.id,
          "parent": "#",
          "type": "biaya",
          "text": biaya.No + " " + biaya.Nama,
          "state": {
            "opened": true
          }
        })

        var subbiayaList = biaya.SubBiaya;
        subbiayaList.forEach(function (subbiaya, index) {
          vm.treeData.push({
            "id": subbiaya.id,
            "parent": biaya.id,
            "type": "subbiaya",
            "text": subbiaya.No + " " + subbiaya.Nama,
            "state": {
              "opened": true
            }
          })
        })
      })

      angular.forEach($scope.waktuPelaksanaanList, function(item, index){
        vm.treesData[index] = vm.treeData;
        $scope.treesData[index] = angular.copy(vm.treeData);
        $scope.biayaConfigs[index] = $scope.biayaConfig;        
        $scope.biayaConfigs[index].version ++;
      })
    }

    function onSelected(e, data) {
      console.log("onSelected" + e);
    }

    $scope.applyModelChanges = function () {
      return !$scope.ignoreChanges;
    };

    $scope.readyCB = function () {
      $scope.waktuPelaksanaanList.forEach(function (item, ind) {
        var elementName = '#basicTree' + ind;
        var element = angular.element(elementName);
        element.on("select_node.jstree", onSelected);
        $scope.basicTrees[ind] = element.jstree(true);
        $scope.selectedNode = $scope.basicTrees[ind].get_selected()[0];
        $timeout(function () {
          $scope.ignoreChanges = false;
        });
      })
    };

    getActiveRPJM();
  }

})();

/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('PendapatanPageCtrl', PendapatanPageCtrl);

  /** @ngInject */
  function PendapatanPageCtrl(RPJM, $timeout, $scope) {
    var vm = this;
    vm.treeData = [];
    vm.treesData = [];

    $scope.waktuPelaksanaanList = [];
    $scope.pendapatanList = [];
    $scope.activeRPJM;
    $scope.basicTrees = [];
    $scope.pendapatanConfigs = [];
    $scope.treesData = [];
    $scope.ignoreChanges = false;

    $scope.pendapatanConfig = {
      core: {
        multiple: false,
        check_callback: true,
        worker: true
      },
      types: {
        pendapatan: {
          icon: 'fa fa-money'
        },
        subpendapatan: {
          icon: 'fa fa-credit-card'
        },
        anggaranpendapatan: {
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
              relation: "Pendapatan",
              scope: {
                include: "SubPendapatan"
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
        $scope.pendapatanList = result.Pendapatan;
        vm.treesData.length = $scope.waktuPelaksanaanList.length;
        populatePendapatan($scope.pendapatanList);
      })
    }

    function populatePendapatan(pendapatanList) {
      vm.treeData.length = 0;
      angular.forEach(pendapatanList, function (pendapatan) {
        vm.treeData.push({
          "id": pendapatan.id,
          "parent": "#",
          "type": "pendapatan",
          "text": pendapatan.No + " " + pendapatan.Nama,
          "state": {
            "opened": true
          }
        })

        var subpendapatanList = pendapatan.SubPendapatan;
        subpendapatanList.forEach(function (subpendapatan, index) {
          vm.treeData.push({
            "id": subpendapatan.id,
            "parent": pendapatan.id,
            "type": "subpendapatan",
            "text": subpendapatan.No + " " + subpendapatan.Nama,
            "state": {
              "opened": true
            }
          })
        })
      })

      angular.forEach($scope.waktuPelaksanaanList, function(item, index){
        vm.treesData[index] = vm.treeData;
        $scope.treesData[index] = angular.copy(vm.treeData);
        $scope.pendapatanConfigs[index] = $scope.pendapatanConfig;        
        $scope.pendapatanConfigs[index].version ++;
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

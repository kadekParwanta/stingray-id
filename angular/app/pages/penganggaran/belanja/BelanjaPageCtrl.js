/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('BelanjaPageCtrl', BelanjaPageCtrl);

  /** @ngInject */
  function BelanjaPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, $q, RPJMDes, WaktuPelaksanaan, RKP, SumberBiaya) {
    var vm = this;
    vm.treeData = [];
    vm.treesData = [];
    vm.belanjaTreeData = [];

    $scope.basicTree;
    $scope.basicTrees = [];
    $scope.selectedNode;
    $scope.bidangTitle = "Mohon pilih item di samping";

    $scope.ignoreChanges = false;
    var newId = 0;
    $scope.newNode = {};
    $scope.activeRPJM = {};
    $scope.waktuPelaksanaanList = [];
    $scope.polaPelaksanaanList = [];
    $scope.sumberBiayaItemList = [];
    $scope.bidangList = [];
    $scope.RKPList = [];
    $scope.RPJMDesList = [];
    $scope.treesData = [];
    $scope.basicConfigs = [];
    $scope.currentTabIndex = 0;
    $scope.selectedBidang = {};
    $scope.selectedRPJMDes = {};
    $scope.belanjaTree = {};
    $scope.belanjaTreeData = [];

    $scope.belanjaConfig = {
      core: {
        multiple: false,
        check_callback: true,
        worker: true
      },
      types: {
        pricetag: {
          icon: 'ion-pricetag'
        },
        folder: {
          icon: 'ion-ios-folder'
        },
        default: {
          icon: 'ion-document-text'
        }
      },
      plugins: ['types', 'ui'],
      version: 1
    }


    $scope.basicConfig = {
      core: {
        multiple: false,
        check_callback: true,
        worker: true
      },
      'types': {
        'pricetag': {
          'icon': 'ion-pricetag'
        },
        'folder': {
          'icon': 'ion-ios-folder'
        },
        'default': {
          'icon': 'ion-document-text'
        }
      },
      'plugins': ['types', 'ui'],
      'version': 1
    };

    function populateRPJMDes(bidangList) {
      vm.treeData.length = 0;
      angular.forEach(bidangList, function (bidang) {
        vm.treeData.push({
          "id": bidang.id,
          "parent": "#",
          "type": "folder",
          "text": bidang.No + " " + bidang.Nama,
          "state": {
            "opened": true
          }
        })
      })

      getRPJMDesByWaktu($scope.waktuPelaksanaanList);
    }

    function getRPJMDesByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan, i) {
        var deferred = $q.defer();

        WaktuPelaksanaan.RPJMDes({
          id: waktupelaksanaan.id,
          filter: {
            include: [
              { relation: "Bidang" }
            ]
          }
        }, function (result) {
          $scope.RPJMDesList[i] = result;
          var treeData = angular.copy(vm.treeData);

          angular.forEach(result, function (rpjmdes, index, arr) {
            var bidang = rpjmdes.Bidang;
            treeData.push({
              "id": rpjmdes.id,
              "parent": bidang.id,
              "type": "default",
              "text": bidang.No + "." + (index + 1) + " " + rpjmdes.SubBidang,
              "state": {
                "opened": true
              }
            })
          })
          deferred.resolve(treeData);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (treesData) {
        for (var i = 0; i < treesData.length; i++) {
          $scope.basicConfigs[i] = $scope.basicConfig;
          $scope.treesData[i] = treesData[i];
          $scope.basicConfigs[i].version++;
        }
        getRKPByWaktu(waktuPelaksanaanList);
      })
    }

    function getRKPByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan, i) {
        var deferred = $q.defer();

        WaktuPelaksanaan.RKP({
          id: waktupelaksanaan.id,
          filter: {
            include: [
              { relation: "Bidang" },
              {
                relation: "SumberBiaya", scope: {
                  include: { relation: "Sumber" }
                }
              },
              {
                relation: "Belanja", scope: {
                  include: { relation: "RAB" }
                }
              },
              {
                relation: "RPJMDes", scope: {
                  include: { relation: "Bidang" }
                }
              }
            ]
          }
        }, function (result) {
          $scope.RKPList[i] = result;
          var treeData = angular.copy($scope.treesData[i]);

          angular.forEach(result, function (item, index, arr) {
            var bidang = item.Bidang;
            var RPJMDes = item.RPJMDes;
            var parent = {};
            if (bidang) {
              parent = bidang;
            } else if (RPJMDes) {
              parent = RPJMDes;
              parent.id = RPJMDes.id;
              parent.No = RPJMDes.Bidang.No + "." + RPJMDes.No;
            }
            treeData.push({
              "id": item.id,
              "parent": parent.id,
              "type": "pricetag",
              "text": parent.No + "." + item.No + " " + item.Nama,
              "state": {
                "opened": true
              }
            })
          })
          deferred.resolve(treeData);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (treesData) {
        for (var i = 0; i < treesData.length; i++) {
          $scope.treesData[i] = treesData[i];
          $scope.basicConfigs[i].version++;
        }

        $scope.waktuPelaksanaanList[$scope.currentTabIndex].active = true;
      })
    }

    function getActiveRPJM() {
      RPJM.findOne({
        filter: {
          where: { IsActive: true },
          include: [{
            relation: "Bidang",
            scope: {
              order: "No ASC"
            }
          },
          {
            relation: "WaktuPelaksanaan",
            scope: {
              order: "No ASC"
            }
          },
          {relation: "PolaPelaksanaan"},
          {relation: "SumberBiayaItem"}
          ]}
      }, function (result) {
        $scope.activeRPJM = {
          TahunMulai: result.TahunMulai,
          TahunSelesai: result.TahunSelesai,
          Regulasi: result.Regulasi,
          Perihal: result.Perihal,
          Keterangan: result.Keterangan
        }

        $scope.bidangList = result.Bidang;
        $scope.waktuPelaksanaanList = result.WaktuPelaksanaan;
        $scope.polaPelaksanaanList = result.PolaPelaksanaan;
        $scope.sumberBiayaItemList = result.SumberBiayaItem;
        vm.treesData.length = $scope.waktuPelaksanaanList.length;
        populateRPJMDes($scope.bidangList);
      })
    }

    function getActiveTab() {
      return $scope.waktuPelaksanaanList.filter(function (waktu) {
        return waktu.active;
      })[0];
    };

    getActiveRPJM();

    
    $scope.refresh = function () {
      var ind = getActiveTab().No -1;
      $scope.currentTabIndex = ind;
      $scope.ignoreChanges = true;
      newId = 0;
      getActiveRPJM();
      $scope.basicConfigs[ind].version++;
    };

    $scope.expand = function () {
      var ind = getActiveTab().No -1;
      $scope.ignoreChanges = true;
      $scope.treesData[ind].forEach(function (n) {
        n.state.opened = true;
      });
      $scope.basicConfigs[ind].version++;
    };

    $scope.collapse = function () {
      var ind = getActiveTab().No -1;
      $scope.ignoreChanges = true;
      $scope.treesData[ind].forEach(function (n) {
        n.state.opened = false;
      });
      $scope.basicConfigs[ind].version++;
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

    function populateBelanjaTree(rkp) {
      vm.belanjaTreeData.length = 0;
      vm.belanjaTreeData.push({
        "id": rkp.id,
        "parent": "#",
        "type": "folder",
        "text": rkp.No + rkp.Nama,
        "state": {
          "opened": true
        }
      })

      var belanja = rkp.Belanja;
      belanja.forEach(function (entry) {
        vm.belanjaTreeData.push({
          "id": entry.id,
          "parent": rkp.id,
          "type": "default",
          "text": rkp.No + "." + entry.No + " " +  entry.Nama,
          "state": {
            "opened": true
          }
        })

        var rab = entry.RAB;
        rab.forEach(function (item) {
          vm.belanjaTreeData.push({
            "id": item.id,
            "parent": entry.id,
            "type": "pricetag",
            "text": rkp.No + "." + entry.No + "." +item.No + " " + item.Nama,
            "state": {
              "opened": true
            }
          })
        })
      })

      $scope.belanjaTreeData = vm.belanjaTreeData;
      $scope.belanjaConfig.version ++;
    }

    $scope.belanjaTreereadyCB = function() {
      var elementName = '#belanjaTree';
        var element = angular.element(elementName);
        element.on("select_node.jstree", onBelanjaSelected);
        $scope.belanjaTree = element.jstree(true);
        $scope.selectedBelanjaNode = $scope.belanjaTree.get_selected()[0];
        $timeout(function () {
          $scope.ignoreChanges = false;
        });
    }

    var formatter = new Intl.NumberFormat('id', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    })

    $scope.formatCurrency = function(value) {
      return formatter.format(value);
    }

    function onSelected(e, data) {
      var node = data.node;
      var parent = node.parent;
      var selectedId = node.id;
      $scope.currentTabIndex = getActiveTab().No -1;
      if (node.type === 'pricetag') {
        $scope.selectedNode = $filter('filter')($scope.RKPList[$scope.currentTabIndex], { id: selectedId })[0];
        $scope.selectedNode.TotalBiaya = 0;
        if ($scope.selectedNode.SumberBiaya && $scope.selectedNode.SumberBiaya.length > 0) {
          $scope.selectedSumberBiaya = $scope.selectedNode.SumberBiaya;
          $scope.selectedNode.SumberBiaya.forEach(function(entry){
            $scope.selectedNode.TotalBiaya += entry.Jumlah;
          })
        }
        populateBelanjaTree($scope.selectedNode);
        $scope.$apply();
      } else if (node.type === 'folder'){
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: selectedId })[0];
        $scope.selectedRPJMDes.SubBidang = "-";
        $scope.selectedNode = false;
        $scope.$apply();
      } else {
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: parent })[0];
        $scope.selectedRPJMDes = $filter('filter')($scope.RPJMDesList[$scope.currentTabIndex], { id: selectedId })[0];
        $scope.selectedNode = false;
        $scope.$apply();
      }
    }

    function onBelanjaSelected(e, data) {
      var node = data.node;
      var parent = node.parent;
      var selectedId = node.id;
      console.log("onBelanjaSelected" + selectedId);
    }

    $scope.applyModelChanges = function () {
      return !$scope.ignoreChanges;
    };

    $scope.open = function (page, size) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        controller: RkpModalInstanceCtrl,
        controllerAs: 'vm',
        resolve: {
        }
      });

      modalInstance.result.then(function (data) {
        //TODO
      })
    };


  }

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('BelanjaModalInstanceCtrl', BelanjaModalInstanceCtrl);

  function BelanjaModalInstanceCtrl($uibModalInstance) {
    var vm = this;

    vm.ok = function () {
      $uibModalInstance.close({
      });
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

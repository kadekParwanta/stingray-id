/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('RkpPageCtrl', RkpPageCtrl);

  /** @ngInject */
  function RkpPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, $q, RPJMDes, WaktuPelaksanaan, RKP) {
    var vm = this;
    vm.treeData = [];
    vm.treesData = [];

    $scope.basicTree;
    $scope.basicTrees = [];
    $scope.selectedNode;
    $scope.bidangTitle = "Mohon pilih item di samping";

    $scope.ignoreChanges = false;
    var newId = 0;
    $scope.newNode = {};
    $scope.activeRPJM = {};
    $scope.waktuPelaksanaanList = [];
    $scope.bidangList = [];
    $scope.RKPList = [];
    $scope.RPJMDesList = [];
    $scope.treesData = [];
    $scope.basicConfigs = [];
    $scope.currentTabIndex = 0;
    $scope.selectedBidang = {};
    $scope.selectedRPJMDes = {};

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
          }]
        }
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

    function onSelected(e, data) {
      var node = data.node;
      var parent = node.parent;
      var selectedId = node.id;
      $scope.currentTabIndex = getActiveTab().No -1;
      if (node.type === 'pricetag') {
        $scope.selectedNode = $filter('filter')($scope.RKPList[$scope.currentTabIndex], { id: selectedId })[0];
        $scope.$apply();
      } else if (node.type === 'folder'){
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: selectedId })[0];
        $scope.selectedRPJMDes.SubBidang = "-";
        $scope.$apply();
      } else {
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: parent })[0];
        $scope.selectedRPJMDes = $filter('filter')($scope.RPJMDesList[$scope.currentTabIndex], { id: selectedId })[0];
        $scope.$apply();
      }
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
          bidang: function () {
            return $scope.selectedBidang;
          },
          rpjmdes: function () {
            return $scope.selectedRPJMDes;
          }

        }
      });

      modalInstance.result.then(function (data) {
        var rpjmdes = data.rpjmdes;
        var bidang = data.bidang;
        var newRKP = data.rkp;
        var currentWaktuPelaksanaan = getActiveTab();
        if (rpjmdes.SubBidang === "-") {
          RKP.create({
            BidangId: bidang.id,
            WaktuPelaksanaanId : currentWaktuPelaksanaan.id,
            Nama: newRKP.Nama
          }, function(res){
            $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
            $scope.refresh();
          })
        } else {
          RKP.create({
            RPJMDesId: rpjmdes.id,
            WaktuPelaksanaanId : currentWaktuPelaksanaan.id,
            Nama: newRKP.Nama
          }, function(res){
            $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
            $scope.refresh();
          })
        }
      })
    };

  }

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('RkpModalInstanceCtrl', RkpModalInstanceCtrl);

  function RkpModalInstanceCtrl($uibModalInstance, bidang, rpjmdes) {
    var vm = this;
    vm.rpjmdes = rpjmdes;
    vm.bidang = bidang;
    vm.newRKP = {};

    vm.ok = function () {
      $uibModalInstance.close({
        rkp: vm.newRKP,
        bidang: vm.bidang,
        rpjmdes:vm.rpjmdes
      });
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

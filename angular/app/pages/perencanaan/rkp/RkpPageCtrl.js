/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('RkpPageCtrl', RkpPageCtrl);

  /** @ngInject */
  function RkpPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, $q, RPJMDes, WaktuPelaksanaan) {
    var vm = this;
    vm.treeData = [];
    vm.treesData = [];

    $scope.basicTree;
    $scope.basicTrees;
    $scope.selectedNode;
    $scope.bidangTitle = "Mohon pilih item di samping";

    $scope.ignoreChanges = false;
    var newId = 0;
    $scope.newNode = {};
    $scope.activeRPJM = {};
    $scope.waktuPelaksanaanList = [];
    $scope.bidangList = [];
    $scope.treesData = [];
    $scope.basicConfigs = [];

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
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
        var deferred = $q.defer();

        WaktuPelaksanaan.RPJMDes({
          id: waktupelaksanaan.id,
          filter: {
            include: [
              { relation: "Bidang" }
            ]
          }
        }, function (result) {
          var treeData = angular.copy(vm.treeData);

          angular.forEach(result, function (rpjmdes, index, arr) {
            var bidang = rpjmdes.Bidang;
            treeData.push({
              "id": rpjmdes.id,
              "parent": bidang.id,
              "type": "default",
              "text": bidang.No + "." + rpjmdes.No + " " + rpjmdes.SubBidang,
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
              { relation: "RPJMDes", scope:{
                include : {relation: "Bidang"}
              } }
            ]
          }
        }, function (result) {
          var treeData = angular.copy($scope.treesData[i]);

          angular.forEach(result, function (item, index, arr) {
            var bidang = item.Bidang;
            var RPJMDes = item.RPJMDes;
            var parent = {};
            if (bidang) {
              parent = bidang;
            } else if (RPJMDes){
              parent = RPJMDes;
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

    getActiveRPJM();


    $scope.addNewNode = function () {
      $scope.ignoreChanges = true;
      var selected = this.basicTree.jstree(true).get_selected()[0];
      if (selected)
        $scope.treeData.push({
          id: (newId++).toString(),
          parent: selected,
          text: "New node " + newId,
          state: { opened: true }
        });
      $scope.basicConfig.version++;
    };


    $scope.refresh = function () {
      $scope.ignoreChanges = true;
      newId = 0;
      getActiveRPJM();
      $scope.basicConfig.version++;
    };

    $scope.expand = function () {
      $scope.ignoreChanges = true;
      $scope.treeData.forEach(function (n) {
        n.state.opened = true;
      });
      $scope.basicConfig.version++;
    };

    $scope.collapse = function () {
      $scope.ignoreChanges = true;
      $scope.treeData.forEach(function (n) {
        n.state.opened = false;
      });
      $scope.basicConfig.version++;
    };

    $scope.readyCB = function () {
      var element = angular.element('#basicTree');
      element.on("select_node.jstree", onSelected)
      $scope.basicTree = element.jstree(true);
      $scope.selectedNode = $scope.basicTree.get_selected()[0];
      $timeout(function () {
        $scope.ignoreChanges = false;
      });
    };

    function onSelected(e, data) {
      var node = data.node;
      var parent = node.parent;
      var selectedId = node.id;
      if (parent !== "#") {
        var bidang = $filter('filter')($scope.bidangList, { id: parent })[0];
        $scope.bidangTitle = bidang.Nama;
        $scope.selectedNode = $filter('filter')(bidang.RPJMDes, { id: selectedId })[0];
        $scope.$apply();
      } else {
        $scope.bidangTitle = "Mohon pilih item di samping";
        $scope.$apply();
      }
    }

    $scope.applyModelChanges = function () {
      return !$scope.ignoreChanges;
    };

  }

})();

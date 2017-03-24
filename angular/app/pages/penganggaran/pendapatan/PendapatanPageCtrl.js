/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('PendapatanPageCtrl', PendapatanPageCtrl);

  /** @ngInject */
  function PendapatanPageCtrl(RPJM, $timeout, $scope, $uibModal, $filter, AnggaranPendapatan, Pendapatan) {
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
    $scope.IsSubpendapatanSelected = false;
    $scope.selectedSubPendapatan;
    $scope.selectedWaktuPelaksanaan;

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
                include:
                {
                  relation: "SubPendapatan",
                  scope: {
                    include: {
                      relation: "AnggaranPendapatan"
                    }
                  }
                }
              }
            }
          ]
        }
      }, function (result) {
        $scope.activeRPJM = {
          id: result.id,
          TahunMulai: result.TahunMulai,
          TahunSelesai: result.TahunSelesai,
          Regulasi: result.Regulasi,
          Perihal: result.Perihal,
          Keterangan: result.Keterangan
        }

        $scope.waktuPelaksanaanList = result.WaktuPelaksanaan;
        $scope.pendapatanList = result.Pendapatan;
        vm.treesData.length = $scope.waktuPelaksanaanList.length;
        populateAnggaranPendapatanByWaktu($scope.waktuPelaksanaanList, $scope.pendapatanList);
      })
    }

    function fetchAnggaranPendapatanByWaktu(waktuPelaksanaan) {
      Pendapatan.find({
        filter: {
          include: {
            relation: 'SubPendapatan', scope: {
              include: {
                relation: 'AnggaranPendapatan', scope: {
                  where: {
                    WaktuPelaksanaanId: waktuPelaksanaan.id
                  }
                }
              }
            }
          },
          where: {
            RPJMId: $scope.activeRPJM.id
          }
        }
      }, function(result){
        populateAnggaranPendapatanByWaktu([waktuPelaksanaan], result);
      })
    }

    function populateAnggaranPendapatanByWaktu(waktuPelaksanaanList, pendapatanList) {
      angular.forEach(waktuPelaksanaanList, function (item) {
        var indexWaktu = item.No - 1;
        vm.treeData.length = 0;

        angular.forEach(pendapatanList, function (pendapatan) {
          var pendapatanId = item.id + "-" + pendapatan.id ;
          vm.treeData.push({
            "id": pendapatanId,
            "parent": "#",
            "type": "pendapatan",
            "text": pendapatan.No + " " + pendapatan.Nama,
            "state": {
              "opened": true
            }
          })

          var subpendapatanList = pendapatan.SubPendapatan;
          subpendapatanList.forEach(function (subpendapatan, index) {
            var subPendapatanId = item.id + "-" + subpendapatan.id ;
            vm.treeData.push({
              "id": subPendapatanId,
              "parent": pendapatanId,
              "type": "subpendapatan",
              "text": pendapatan.No + "." + subpendapatan.No + " " + subpendapatan.Nama,
              "state": {
                "opened": true
              }
            })

            var anggaranPendapatanList = subpendapatan.AnggaranPendapatan;
            anggaranPendapatanList.forEach(function (anggaranPendapatan) {
              if (anggaranPendapatan.WaktuPelaksanaanId == item.id) {
                vm.treeData.push({
                  "id": anggaranPendapatan.id,
                  "parent": subPendapatanId,
                  "type": "anggaranpendapatan",
                  "text": pendapatan.No + "." + subpendapatan.No + "." + anggaranPendapatan.No + " " + anggaranPendapatan.Nama,
                  "li_attr": { "class": "green" },
                  "state": {
                    "opened": true
                  }
                })
              }
            })
          })
        })

        $scope.treesData[indexWaktu] = angular.copy(vm.treeData);
        $scope.pendapatanConfigs[indexWaktu] = $scope.pendapatanConfig;        
        $scope.pendapatanConfigs[indexWaktu].version ++;
      })
    }

    function onSelected(e, data) {
      var node = data.node;
      if (node.type == "subpendapatan") {
        var parent = node.parent;
        var waktuPelaksanaanId = getActiveTab().id;
        var pendapatanId = parent.substring(waktuPelaksanaanId.length + 1);
        var selectedId = node.id;
        selectedId = selectedId.substring(waktuPelaksanaanId.length + 1);
        $scope.IsSubpendapatanSelected = true;
        var pendapatan = $filter('filter')($scope.pendapatanList, { id: pendapatanId })[0];
        $scope.selectedSubPendapatan = $filter('filter')(pendapatan.SubPendapatan, { id: selectedId })[0];
      } else {
        $scope.IsSubpendapatanSelected = false;
        $scope.selectedSubPendapatan = undefined;
      }
    }

    function getActiveTab() {
      return $scope.selectedWaktuPelaksanaan;
    };

    $scope.tabSelected = function(tab) {
      $scope.selectedWaktuPelaksanaan = tab;
    }

    $scope.applyModelChanges = function () {
      return !$scope.ignoreChanges;
    };

    $scope.expand = function () {
      var ind = getActiveTab().No -1;
      $scope.ignoreChanges = true;
      $scope.treesData[ind].forEach(function (n) {
        n.state.opened = true;
      });
      $scope.pendapatanConfigs[ind].version++;
    };

    $scope.collapse = function () {
      var ind = getActiveTab().No -1;
      $scope.ignoreChanges = true;
      $scope.treesData[ind].forEach(function (n) {
        n.state.opened = false;
      });
      $scope.pendapatanConfigs[ind].version++;
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

    $scope.open = function (page, size, message) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        controller: PendapatanModalInstanceCtrl,
        controllerAs: 'vm',
        resolve: {
          message: function () {
            return message;
          },
          selectedSubPendapatan: function () {
            return $scope.selectedSubPendapatan;
          },
          selectedWaktuPelaksanaan : function() {
            return getActiveTab();
          }
        }
      });

      modalInstance.result.then(function (data) {
        var anggaranPendapatan = data.anggaranPendapatan;
        AnggaranPendapatan.create(anggaranPendapatan, function (res) {
          $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
          $scope.refresh(getActiveTab());
        })
      })
    };

    $scope.addNewAnggaranPendapatan = function() {
      if ($scope.IsSubpendapatanSelected) {
        $scope.open('app/pages/penganggaran/pendapatan/pendapatanModal.html','md');
      } else {
        $scope.open('app/pages/penganggaran/pendapatan/errorModal.html','md','Tidak dapat menambahkan anggaran pendapatan di sini. \nMohon pilih item pendapatan terlebih dahulu');
      }
      
    }
    $scope.refresh = function(waktuPelaksanaan) {
      fetchAnggaranPendapatanByWaktu(waktuPelaksanaan);
    }

    getActiveRPJM();
  }

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('PendapatanModalInstanceCtrl', PendapatanModalInstanceCtrl);

  function PendapatanModalInstanceCtrl($uibModalInstance, message, selectedSubPendapatan, selectedWaktuPelaksanaan) {
    var vm = this;
    vm.message = message;
    vm.newAnggaranPendapatan = {}
    if (selectedSubPendapatan) {
      vm.selectedSubPendapatan = selectedSubPendapatan;
      vm.newAnggaranPendapatan.SubPendapatanId = selectedSubPendapatan.id;
      vm.newAnggaranPendapatan.WaktuPelaksanaanId = selectedWaktuPelaksanaan.id;
    }
    

    vm.ok = function () {
      $uibModalInstance.close({
        anggaranPendapatan: vm.newAnggaranPendapatan
      });
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('PendapatanPageCtrl', PendapatanPageCtrl);

  /** @ngInject */
  function PendapatanPageCtrl(RPJM, $timeout, $scope, $uibModal, $filter, AnggaranPendapatan, Pendapatan, $q) {
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
    $scope.selectedPendapatan;
    $scope.selectedAnggaranPendapatan;
    $scope.selectedWaktuPelaksanaan;
    $scope.selectedDefault;

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
        },
        default: {
          icon: 'ion-ios-folder'
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
        getPendapatanByWaktu($scope.waktuPelaksanaanList);
      })
    }

    function getPendapatanByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
        var deferred = $q.defer();

        Pendapatan.find({
          filter: {
            include: {
              relation: 'SubPendapatan', scope: {
                include: {
                  relation: 'AnggaranPendapatan', scope: {
                    where: {
                      WaktuPelaksanaanId: waktupelaksanaan.id
                    }
                  }
                }
              }
            },
            where: {
              RPJMId: $scope.activeRPJM.id
            }
          }
        }, function (pendapatanList) {
          var indexWaktuPel = waktupelaksanaan.No - 1;
          $scope.pendapatanList[indexWaktuPel] = pendapatanList;
          var treeData = [];
          treeData.push({
            "id": waktupelaksanaan.id,
            "parent": "#",
            "type": "default",
            "text": "PENDAPATAN ",
            "state": {
              "opened": true
            }
          })

          angular.forEach(pendapatanList, function (pendapatan) {
            var pendapatanId = waktupelaksanaan.id + "-" + pendapatan.id;
            treeData.push({
              "id": pendapatanId,
              "parent": waktupelaksanaan.id,
              "type": "pendapatan",
              "text": pendapatan.No + " " + pendapatan.Nama,
              "state": {
                "opened": true
              }
            })

            var subpendapatanList = pendapatan.SubPendapatan;
            subpendapatanList.forEach(function (subpendapatan, index) {
              var subPendapatanId = waktupelaksanaan.id + "-" + subpendapatan.id;
              treeData.push({
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
                treeData.push({
                  "id": anggaranPendapatan.id,
                  "parent": subPendapatanId,
                  "type": "anggaranpendapatan",
                  "text": pendapatan.No + "." + subpendapatan.No + "." + anggaranPendapatan.No + " " + anggaranPendapatan.Nama,
                  "li_attr": { "class": "green" },
                  "state": {
                    "opened": true
                  }
                })
              })
            })
          })
          deferred.resolve(treeData);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (treesData) {
        waktuPelaksanaanList.forEach(function(item, index){
          $scope.treesData[(item.No - 1)] = treesData[index];
          $scope.pendapatanConfigs[(item.No - 1)] = $scope.pendapatanConfig;        
          $scope.pendapatanConfigs[(item.No - 1)].version ++;
        })
      })
    }

    function onSelected(e, data) {
      var node = data.node;
      var selectedId = node.id;
      if (node.type == "subpendapatan") {
        var parent = node.parent;
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        var pendapatanId = parent.substring(waktuPelaksanaanId.length + 1);
        selectedId = selectedId.substring(waktuPelaksanaanId.length + 1);
        $scope.IsSubpendapatanSelected = true;
        var pendapatan = $filter('filter')($scope.pendapatanList[indexWaktu], { id: pendapatanId })[0];
        $scope.selectedSubPendapatan = $filter('filter')(pendapatan.SubPendapatan, { id: selectedId })[0];
        $scope.selectedAnggaranPendapatan = undefined;
        $scope.selectedPendapatan = undefined;
        $scope.selectedDefault = undefined;
        $scope.selectedSubPendapatan.TotalPendapatan = 0;
        var anggaranPendapatanList = $scope.selectedSubPendapatan.AnggaranPendapatan;
          anggaranPendapatanList.forEach(function(entry){
            $scope.selectedSubPendapatan.TotalPendapatan += entry.Jumlah;
          })
      } else if (node.type == 'pendapatan') {
        $scope.IsSubpendapatanSelected = false;
        $scope.selectedSubPendapatan = undefined;
        $scope.selectedAnggaranPendapatan = undefined;
        $scope.selectedDefault = undefined;
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        pendapatanId = selectedId.substring(waktuPelaksanaanId.length + 1);
        $scope.selectedPendapatan = $filter('filter')($scope.pendapatanList[indexWaktu], { id: pendapatanId })[0];
        $scope.selectedPendapatan.TotalPendapatan = 0;
        var subPendapatanList = $scope.selectedPendapatan.SubPendapatan;
        subPendapatanList.forEach(function(item){
          var anggaranPendapatanList = item.AnggaranPendapatan;
          anggaranPendapatanList.forEach(function(entry){
            $scope.selectedPendapatan.TotalPendapatan += entry.Jumlah;
          })
        })
      } else if (node.type == 'anggaranpendapatan') {
        $scope.IsSubpendapatanSelected = false;
        $scope.selectedSubPendapatan = undefined;
        $scope.selectedPendapatan = undefined;
        $scope.selectedDefault = undefined;
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        var parents = node.parents;
        var subPendapatanId = parents[0].substring(waktuPelaksanaanId.length + 1);
        var pendapatanId = parents[1].substring(waktuPelaksanaanId.length + 1);
        var pendapatan = $filter('filter')($scope.pendapatanList[indexWaktu], { id: pendapatanId })[0];
        var subPendapatan = $filter('filter')(pendapatan.SubPendapatan, { id: subPendapatanId })[0];
        $scope.selectedAnggaranPendapatan = $filter('filter')(subPendapatan.AnggaranPendapatan, { id: selectedId })[0];
      } else {
        $scope.IsSubpendapatanSelected = false;
        $scope.selectedSubPendapatan = undefined;
        $scope.selectedPendapatan = undefined;
        $scope.selectedAnggaranPendapatan = undefined;
        $scope.selectedDefault = {
          TotalPendapatan : 0
        }
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        $scope.pendapatanList[indexWaktu].forEach(function (pendapatan) {
          var subPendapatanList = pendapatan.SubPendapatan;
          subPendapatanList.forEach(function (item) {
            var anggaranPendapatanList = item.AnggaranPendapatan;
            anggaranPendapatanList.forEach(function (entry) {
              $scope.selectedDefault.TotalPendapatan += entry.Jumlah;
            })
          })
        })
        
      }
    }

    function getActiveTab() {
      return $scope.selectedWaktuPelaksanaan;
    };
    

    $scope.tabSelected = function(tab) {
      $scope.selectedWaktuPelaksanaan = tab;
      $scope.refresh(tab);
      
    }


    var formatter = new Intl.NumberFormat('id', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    })

    $scope.formatCurrency = function(value) {
      return formatter.format(value);
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

      if ($scope.IsSubpendapatanSelected) {
        var selectedWaktuPelaksanaan = getActiveTab();
        var indexWaktu = selectedWaktuPelaksanaan.No - 1;
        var id = selectedWaktuPelaksanaan.id + "-" + $scope.selectedSubPendapatan.id;
        $scope.basicTrees[indexWaktu].select_node(id);
      } else {
        var selectedWaktuPelaksanaan = getActiveTab();
        var indexWaktu = selectedWaktuPelaksanaan.No - 1;
        $scope.basicTrees[indexWaktu].select_node(selectedWaktuPelaksanaan.id);
      }
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
        $scope.open('app/pages/perencanaan/pendapatan/pendapatanModal.html','md');
      } else {
        $scope.open('app/pages/perencanaan/pendapatan/errorModal.html','md','Tidak dapat menambahkan anggaran pendapatan di sini. \nMohon pilih item pendapatan terlebih dahulu');
      }
      
    }
    $scope.refresh = function(waktuPelaksanaan) {
      getPendapatanByWaktu([waktuPelaksanaan]);
    }

    $scope.deleteAnggaranPendapatan = function(anggaranPendapatan) {
      AnggaranPendapatan.deleteById({ id: anggaranPendapatan.id }, function () {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        $scope.refresh(getActiveTab());
      })
    }

    $scope.editAnggaranPendapatan = function(anggaranPendapatan) {
      AnggaranPendapatan.prototype$updateAttributes({
        id: anggaranPendapatan.id,
        Nama: anggaranPendapatan.Nama,
        Jumlah: anggaranPendapatan.Jumlah
      }, function (result) {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        $scope.refresh(getActiveTab());
      })
    }

    getActiveRPJM();
  }

  angular.module('BlurAdmin.pages.perencanaan')
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

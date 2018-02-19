/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('PembiayaanPageCtrl', PembiayaanPageCtrl);

  /** @ngInject */
  function PembiayaanPageCtrl(RPJM, $timeout, $scope, $uibModal, $filter, AnggaranBiaya, Biaya, $q) {
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
    $scope.IsSubbiayaSelected = false;
    $scope.selectedSubBiaya;
    $scope.selectedBiaya;
    $scope.selectedAnggaranBiaya;
    $scope.selectedWaktuPelaksanaan;
    $scope.selectedDefault;

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
        getBiayaByWaktu($scope.waktuPelaksanaanList);
      })
    }

    function getBiayaByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
        var deferred = $q.defer();

        Biaya.find({
          filter: {
            include: {
              relation: 'SubBiaya', scope: {
                include: {
                  relation: 'AnggaranBiaya', scope: {
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
        }, function (biayaList) {
          var indexWaktuPel = waktupelaksanaan.No - 1;
          $scope.biayaList[indexWaktuPel] = biayaList;
          var treeData = [];
          treeData.push({
            "id": waktupelaksanaan.id,
            "parent": "#",
            "type": "default",
            "text": "PEMBIAYAAN ",
            "state": {
              "opened": true
            }
          })

          angular.forEach(biayaList, function (biaya) {
            var biayaId = waktupelaksanaan.id + "-" + biaya.id;
            treeData.push({
              "id": biayaId,
              "parent": waktupelaksanaan.id,
              "type": "biaya",
              "text": biaya.No + " " + biaya.Nama,
              "state": {
                "opened": true
              }
            })

            var subbiayaList = biaya.SubBiaya;
            subbiayaList.forEach(function (subbiaya, index) {
              var subBiayaId = waktupelaksanaan.id + "-" + subbiaya.id;
              var a_attr = {};
              if (subbiaya.AnggaranBiaya) {
                a_attr = {"class":"green"};
              }

              treeData.push({
                "id": subBiayaId,
                "parent": biayaId,
                "type": "subbiaya",
                "text": biaya.No + "." + subbiaya.No + " " + subbiaya.Nama,
                "a_attr":a_attr,
                "state": {
                  "opened": true
                }
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
          $scope.biayaConfigs[(item.No - 1)] = $scope.biayaConfig;        
          $scope.biayaConfigs[(item.No - 1)].version ++;
        })
      })
    }

    function onSelected(e, data) {
      var node = data.node;
      var selectedId = node.id;
      if (node.type == "subbiaya") {
        var parent = node.parent;
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        var biayaId = parent.substring(waktuPelaksanaanId.length + 1);
        selectedId = selectedId.substring(waktuPelaksanaanId.length + 1);
        $scope.IsSubbiayaSelected = true;
        var biaya = $filter('filter')($scope.biayaList[indexWaktu], { id: biayaId })[0];
        $scope.selectedSubBiaya = $filter('filter')(biaya.SubBiaya, { id: selectedId })[0];
        $scope.selectedAnggaranBiaya = undefined;
        $scope.selectedBiaya = undefined;
        $scope.selectedDefault = undefined;
        $scope.selectedSubBiaya.TotalBiaya = 0;
        var anggaranBiaya = $scope.selectedSubBiaya.AnggaranBiaya;
        if (anggaranBiaya) {
          $scope.selectedAnggaranBiaya = anggaranBiaya;
        }
      } else if (node.type == 'biaya') {
        $scope.IsSubbiayaSelected = false;
        $scope.selectedSubBiaya = undefined;
        $scope.selectedAnggaranBiaya = undefined;
        $scope.selectedDefault = undefined;
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        biayaId = selectedId.substring(waktuPelaksanaanId.length + 1);
        $scope.selectedBiaya = $filter('filter')($scope.biayaList[indexWaktu], { id: biayaId })[0];
        $scope.selectedBiaya.TotalBiaya = 0;
        var subBiayaList = $scope.selectedBiaya.SubBiaya;
        subBiayaList.forEach(function(item){
          var anggaranBiaya = item.AnggaranBiaya;
        if (anggaranBiaya) {
          $scope.selectedBiaya.TotalBiaya += anggaranBiaya.Jumlah;
        }
        })
      } else if (node.type == 'anggaranbiaya') {
        $scope.IsSubbiayaSelected = false;
        $scope.selectedSubBiaya = undefined;
        $scope.selectedBiaya = undefined;
        $scope.selectedDefault = undefined;
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        var parents = node.parents;
        var subBiayaId = parents[0].substring(waktuPelaksanaanId.length + 1);
        var biayaId = parents[1].substring(waktuPelaksanaanId.length + 1);
        var biaya = $filter('filter')($scope.biayaList[indexWaktu], { id: biayaId })[0];
        var subBiaya = $filter('filter')(biaya.SubBiaya, { id: subBiayaId })[0];
        $scope.selectedAnggaranBiaya = $filter('filter')(subBiaya.AnggaranBiaya, { id: selectedId })[0];
      } else {
        $scope.IsSubbiayaSelected = false;
        $scope.selectedSubBiaya = undefined;
        $scope.selectedBiaya = undefined;
        $scope.selectedAnggaranBiaya = undefined;
        $scope.selectedDefault = {
          TotalBiaya : 0
        }
        var activeWaktuPelaksanaan = getActiveTab();
        var waktuPelaksanaanId = activeWaktuPelaksanaan.id;
        var indexWaktu = activeWaktuPelaksanaan.No - 1;
        $scope.biayaList[indexWaktu].forEach(function (biaya) {
          var subBiayaList = biaya.SubBiaya;
          subBiayaList.forEach(function (item) {
            var anggaranBiaya = item.AnggaranBiaya;
            if (anggaranBiaya) $scope.selectedDefault.TotalBiaya += anggaranBiaya.Jumlah;
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
      $scope.biayaConfigs[ind].version++;
    };

    $scope.collapse = function () {
      var ind = getActiveTab().No -1;
      $scope.ignoreChanges = true;
      $scope.treesData[ind].forEach(function (n) {
        n.state.opened = false;
      });
      $scope.biayaConfigs[ind].version++;
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

      if ($scope.IsSubbiayaSelected) {
        var selectedWaktuPelaksanaan = getActiveTab();
        var indexWaktu = selectedWaktuPelaksanaan.No - 1;
        var id = selectedWaktuPelaksanaan.id + "-" + $scope.selectedSubBiaya.id;
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
        controller: PembiayaanModalInstanceCtrl,
        controllerAs: 'vm',
        resolve: {
          message: function () {
            return message;
          },
          selectedSubBiaya: function () {
            return $scope.selectedSubBiaya;
          },
          selectedWaktuPelaksanaan : function() {
            return getActiveTab();
          }
        }
      });

      modalInstance.result.then(function (data) {
        var anggaranBiaya = data.anggaranBiaya;
        AnggaranBiaya.create(anggaranBiaya, function (res) {
          $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
          $scope.refresh(getActiveTab());
        })
      })
    };

    $scope.addNewAnggaranBiaya = function() {
      if ($scope.IsSubbiayaSelected) {
        $scope.open('app/pages/penganggaran/pembiayaan/biayaModal.html','md');
      } else {
        $scope.open('app/pages/penganggaran/pembiayaan/errorModal.html','md','Tidak dapat menambahkan anggaran biaya di sini. \nMohon pilih item biaya terlebih dahulu');
      }
      
    }
    $scope.refresh = function(waktuPelaksanaan) {
      getBiayaByWaktu([waktuPelaksanaan]);
    }

    $scope.deleteAnggaranBiaya = function(anggaranBiaya) {
      AnggaranBiaya.deleteById({ id: anggaranBiaya.id }, function () {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        $scope.refresh(getActiveTab());
      })
    }

    $scope.editAnggaranBiaya = function(anggaranBiaya) {
      if (!anggaranBiaya.id) {
        AnggaranBiaya.create({
          Jumlah: anggaranBiaya.Jumlah,
          SubBiayaId: $scope.selectedSubBiaya.id,
          WaktuPelaksanaanId: getActiveTab().id
        }, function (result) {
          $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
          $scope.refresh(getActiveTab());
        })
      } else {
        AnggaranBiaya.prototype$patchAttributes({
          id: anggaranBiaya.id,
          Nama: anggaranBiaya.Nama,
          Jumlah: anggaranBiaya.Jumlah
        }, function (result) {
          $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
          $scope.refresh(getActiveTab());
        })
      }
      
    }

    getActiveRPJM();
  }

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('PembiayaanModalInstanceCtrl', PembiayaanModalInstanceCtrl);

  function PembiayaanModalInstanceCtrl($uibModalInstance, message, selectedSubBiaya, selectedWaktuPelaksanaan) {
    var vm = this;
    vm.message = message;
    vm.newAnggaranBiaya = {}
    if (selectedSubBiaya) {
      vm.selectedSubBiaya = selectedSubBiaya;
      vm.newAnggaranBiaya.SubBiayaId = selectedSubBiaya.id;
      vm.newAnggaranBiaya.WaktuPelaksanaanId = selectedWaktuPelaksanaan.id;
    }
    

    vm.ok = function () {
      $uibModalInstance.close({
        anggaranBiaya: vm.newAnggaranBiaya
      });
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

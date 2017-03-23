/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('BelanjaPageCtrl', BelanjaPageCtrl);

  /** @ngInject */
  function BelanjaPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, $q, RPJMDes, WaktuPelaksanaan, RKP, SumberBiaya, RAB, Bidang, BelanjaTitle) {
    var vm = this;
    vm.treeData = [];
    vm.treesData = [];
    vm.belanjaTreeData = [];
    vm.belanjaForm;

    $scope.basicTree;
    $scope.basicTrees = [];
    $scope.selectedRKP;
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
    $scope.selectedBidang = {};
    $scope.selectedRPJMDes = {};
    $scope.selectedBelanja;
    $scope.belanjaTree = {};
    $scope.belanjaTreeData = [];
    $scope.selectedRABNode;
    $scope.selectedBelanjaTitleNode;
    $scope.selectedWaktuPelaksanaan = {};

    $scope.belanjaConfig = {
      core: {
        multiple: false,
        check_callback: true,
        worker: true
      },
      types: {
        rkp: {
          icon: 'ion-pricetag'
        },
        belanja: {
          icon: 'ion-android-cart'
        },
        rab: {
          icon: 'ion-bag'
        },
        belanjatitle: {
          icon: 'ion-ios-folder'
        },
        belanjatitlerab: {
          icon: 'ion-bag'
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

      angular.forEach($scope.waktuPelaksanaanList, function(item, index){
        vm.treesData[index] = vm.treeData;
      })

      getRPJMDesByWaktu($scope.waktuPelaksanaanList);
    }

    function populateRPJMDesByWaktu(bidangList, waktuPelaksanaan) {
      var index = waktuPelaksanaan.No - 1;
      vm.treesData[index] = [];
      angular.forEach(bidangList, function (bidang) {
        vm.treesData[index].push({
          "id": bidang.id,
          "parent": "#",
          "type": "folder",
          "text": bidang.No + " " + bidang.Nama,
          "state": {
            "opened": true
          }
        })
      })

      getRPJMDesByWaktu([waktuPelaksanaan]);
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
          var indexWaktuPel = waktupelaksanaan.No - 1;
          $scope.RPJMDesList[indexWaktuPel] = result;
          var treeData = angular.copy(vm.treesData[indexWaktuPel]);

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
        waktuPelaksanaanList.forEach(function(item, index){
          $scope.treesData[(item.No - 1)] = treesData[index];
          $scope.basicConfigs[(item.No - 1)] = $scope.basicConfig;
          $scope.basicConfigs[(item.No - 1)].version++;
        })
        getRKPByWaktu(waktuPelaksanaanList);
      })
    }

    function getRKPByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
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
                  include: [
                    { relation: "RAB" },
                    {
                      relation: "BelanjaTitle", scope: {
                        include:
                        { relation: "RAB" }
                      }
                    }]
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
          var indexWaktuPel = waktupelaksanaan.No - 1;
          $scope.RKPList[indexWaktuPel] = result;
          var treeData = angular.copy($scope.treesData[indexWaktuPel]);

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
              "li_attr":{"class":"green"},
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
        waktuPelaksanaanList.forEach(function(item, index){
          $scope.treesData[(item.No - 1)] = treesData[index];
          $scope.basicConfigs[(item.No - 1)].version++;
        })
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
      return $scope.selectedWaktuPelaksanaan;
    };

    $scope.tabSelected = function(tab) {
      $scope.selectedWaktuPelaksanaan = tab;
    }

    getActiveRPJM();

    
    $scope.refresh = function (waktuPelaksanaan) {
      populateRPJMDesByWaktu($scope.bidangList, waktuPelaksanaan);
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
        $scope.selectedRKP = $scope.basicTrees[ind].get_selected()[0];
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
        "type": "rkp",
        "text": rkp.No + " " + rkp.Nama,
        "state": {
          "opened": true
        }
      })

      var belanja = rkp.Belanja;
      belanja.forEach(function (entry) {
        vm.belanjaTreeData.push({
          "id": entry.id,
          "parent": rkp.id,
          "type": "belanja",
          "text": rkp.No+"." + entry.No+" " + entry.Nama,
          "state": {
            "opened": true
          }
        })

        var rab = entry.RAB;
        rab.forEach(function (item) {
          vm.belanjaTreeData.push({
            "id": item.id,
            "parent": entry.id,
            "type": "rab",
            "text": "- " + item.Nama,
            "li_attr": { "class": "green" },
            "state": {
              "opened": true
            }
          })
        })

        var belanjaTitle = entry.BelanjaTitle;
        belanjaTitle.forEach(function (belanjatitle) {
          vm.belanjaTreeData.push({
            "id": belanjatitle.id,
            "parent": entry.id,
            "type": "belanjatitle",
            "text": "- " + belanjatitle.Nama,
            "state": {
              "opened": true
            }
          })

          var rabFromTitle = belanjatitle.RAB;
          rabFromTitle.forEach(function (item) {
            vm.belanjaTreeData.push({
              "id": item.id,
              "parent": belanjatitle.id,
              "type": "belanjatitlerab",
              "text": "- " + item.Nama,
              "li_attr": { "class": "green" },
              "state": {
                "opened": true
              }
            })
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
        $scope.selectedRABNode = $scope.belanjaTree.get_selected()[0];
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
      var parents = node.parents;
      var selectedId = node.id;
      var ind = getActiveTab().No -1;
      $scope.selectedBelanja = false;
      if (node.type === 'pricetag') {
        var parentNo;
        if (parents.length === 3) {
          var rpjmdes = $filter('filter')($scope.RPJMDesList[ind], { id: parents[0] })[0];
          var bidang = $filter('filter')($scope.bidangList, { id: parents[1] })[0];
          parentNo = bidang.No + '.' + rpjmdes.No;
        } else {
          var rpjmdesOrBidang = $filter('filter')($scope.RPJMDesList[ind], { id: parent })[0] || $filter('filter')($scope.bidangList, { id: parent })[0];
          parentNo = rpjmdesOrBidang.No;
        }
        $scope.selectedRKP = $filter('filter')($scope.RKPList[ind], { id: selectedId })[0];
        $scope.selectedRKP.TotalBiaya = 0;
        $scope.selectedRKP.parentNo = parentNo;
        if ($scope.selectedRKP.SumberBiaya && $scope.selectedRKP.SumberBiaya.length > 0) {
          $scope.selectedSumberBiaya = $scope.selectedRKP.SumberBiaya;
          $scope.selectedRKP.SumberBiaya.forEach(function(entry){
            $scope.selectedRKP.TotalBiaya += entry.Jumlah;
          })
        }
        $scope.selectedBidang = false;
        $scope.selectedRPJMDes = false;
        $scope.isBidang = false;
        populateBelanjaTree($scope.selectedRKP);
        $scope.$apply();
      } else if (node.type === 'folder'){
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: selectedId })[0];
        $scope.selectedRPJMDes = false;
        $scope.selectedRKP = false;
        $scope.isBidang = true;
        getRKPByBidang($scope.selectedBidang);
        $scope.$apply();
      } else {
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: parent })[0];
        $scope.selectedRPJMDes = $filter('filter')($scope.RPJMDesList[ind], { id: selectedId })[0];
        $scope.selectedRKP = false;
        $scope.isBidang = false;
        getRKPByRPJMDes($scope.selectedRPJMDes);
        $scope.$apply();
      }
    }

    function getRKPByRPJMDes(rpjmdes) {
      rpjmdes.TotalBiaya = 0;
      RPJMDes.RKP({
        id: rpjmdes.id, filter:
          {
            where: {
              WaktuPelaksanaanId: getActiveTab().id
            },
            include: {
              relation: "SumberBiaya"
            }
          }
      }, function (data) {
        rpjmdes.RKP = [];
        data.forEach(function(item, index){
          var sumberBiaya = item.SumberBiaya;
          item.Total = 0;
          sumberBiaya.forEach(function(entry){
            var total = entry.Jumlah;
            item.Total += total;
          })
          rpjmdes.RKP.push(item);
          rpjmdes.TotalBiaya += item.Total;
        })
      })
    }

    function getRKPByBidang(bidang) {
      bidang.TotalBiaya = 0;
      Bidang.findById({
        id: bidang.id,
        filter: {
          include: [
            { relation: "RKP", scope: {include: {relation: "SumberBiaya" }, where: {WaktuPelaksanaanId: getActiveTab().id}}}, 
            { relation: "RPJMDes", scope: {include: {relation: "RKP", scope: {include :{relation: "SumberBiaya" }, where: {WaktuPelaksanaanId: getActiveTab().id}}}}}]
        }
      }, function (data) {
        var rkp = data.RKP;
        var rpjmdes = data.RPJMDes;
        bidang.RKP = [];
        bidang.RPJMDes = [];

        rkp.forEach(function (item) {
          var sumberBiaya = item.SumberBiaya;
          item.Total = 0;
          sumberBiaya.forEach(function (entry) {
            var total = entry.Jumlah;
            item.Total += total;
          })
          bidang.RKP.push(item);
          bidang.TotalBiaya += item.Total;
        })

        rpjmdes.forEach(function (item) {
          var rkp = item.RKP;
          rkp.forEach(function (item) {
            var sumberBiaya = item.SumberBiaya;
            item.Total = 0;
            sumberBiaya.forEach(function (entry) {
              var total = entry.Jumlah;
              item.Total += total;
            })
            bidang.RPJMDes.push(item);
            bidang.TotalBiaya += item.Total;
          })
        })

      })
    }

    function onBelanjaSelected(e, data) {
      var node = data.node;
      var parent = node.parent;
      var selectedId = node.id;
      if (node.type === 'rkp') {
        $scope.selectedRABNode = false;
        $scope.selectedBelanja = false;
        $scope.selectedBelanjaTitleNode = false;
      } else if (node.type === 'belanja') {
        $scope.selectedBelanja = $filter('filter')($scope.selectedRKP.Belanja, { id: selectedId })[0];
        $scope.selectedRABNode = false;
        $scope.selectedBelanjaTitleNode = false;
        if ($scope.selectedBelanja.RAB) {
          $scope.selectedBelanja.TotalBiaya = 0;
          $scope.selectedBelanja.RAB.forEach(function(entry){
            var harga = entry.Volume * entry.Durasi *entry.HargaSatuan;
            $scope.selectedBelanja.TotalBiaya += harga;
          })
        }
      } else if (node.type === 'rab') {
        var belanja = $filter('filter')($scope.selectedRKP.Belanja, { id: parent })[0];
        $scope.selectedRABNode = $filter('filter')(belanja.RAB, { id: selectedId })[0];
        $scope.selectedRABNode.belanjaNo = belanja.No;
        $scope.selectedBelanja = false;
        $scope.selectedBelanjaTitleNode = false;
      } else if (node.type === 'belanjatitle') {
        var belanja = $filter('filter')($scope.selectedRKP.Belanja, { id: parent })[0];
        $scope.selectedBelanjaTitleNode = $filter('filter')(belanja.BelanjaTitle, { id: selectedId })[0];
        $scope.selectedBelanja = false;
        $scope.selectedRABNode = false;
      } else if (node.type === 'belanjatitlerab') {
        var parents = node.parents;
        var belanjaTitleId = parents[0];
        var belanjaId = parents[1];
        var rkpId = parents[2];
        var belanja = $filter('filter')($scope.selectedRKP.Belanja, { id: belanjaId })[0];
        var belanjaTitle = $filter('filter')(belanja.BelanjaTitle, { id: belanjaTitleId })[0];
        $scope.selectedRABNode = $filter('filter')(belanjaTitle.RAB, { id: selectedId })[0];
        $scope.selectedRABNode.belanjaNo = belanja.No;
        $scope.selectedBelanja = false;
        $scope.selectedBelanjaTitleNode = false;
      }
      $scope.$apply();
    }

    $scope.expandBelanja = function () {
      $scope.ignoreChanges = true;
      $scope.belanjaTreeData.forEach(function (n) {
        n.state.opened = true;
      });
      $scope.belanjaConfig.version++;
    };

    $scope.collapseBelanja = function () {
      $scope.ignoreChanges = true;
      $scope.belanjaTreeData.forEach(function (n) {
        n.state.opened = false;
      });
      $scope.belanjaConfig.version++;
    };

    $scope.applyModelChanges = function () {
      return !$scope.ignoreChanges;
    };

    $scope.open = function (page, size, message) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        controller: BelanjaModalInstanceCtrl,
        controllerAs: 'vm',
        resolve: {
          selectedBelanja : function() {
            return $scope.selectedBelanja;
          },
          sumberBiayaItemList: function() {
            return $scope.sumberBiayaItemList;
          },
          selectedBelanjaTitle: function() {
            return $scope.selectedBelanjaTitleNode;
          },
          message: function(){
            return message;
          }
        }
      });

      modalInstance.result.then(function (data) {
        var rab = data.rab;
        var isTitleOnly = data.isTitleOnly;
        var selectedBelanjaTitle = data.selectedBelanjaTitle;
        if (isTitleOnly) {
          var belanjaTitle = {
            Nama: rab.Nama,
            BelanjaId: rab.BelanjaId
          }
          BelanjaTitle.create(belanjaTitle, function (res) {
            $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
            $scope.refresh(getActiveTab());
          })
        } else {
          RAB.create(rab, function (res) {
            $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
            $scope.refresh(getActiveTab());
          })
        }
        
      })
    };

    $scope.addNewRAB = function() {
      if($scope.selectedRABNode) {
        $scope.open('app/pages/penganggaran/belanja/errorModal.html','md','Tidak dapat menambahkan anggaran belanja di sini. \nMohon pilih item belanja terlebih dahulu');
      } else {
        $scope.open('app/pages/penganggaran/belanja/belanjaModal.html', 'md');
      }
    }

    $scope.editRAB = function (rab) {
      RAB.prototype$updateAttributes({
        id: rab.id,
        Nama: rab.Nama,
        Durasi: rab.Durasi,
        SatuanDurasi: rab.SatuanDurasi,
        Volume: rab.Volume,
        Satuan: rab.Satuan,
        HargaSatuan: rab.HargaSatuan,
        SumberBiayaId: rab.SumberBiayaId
      }, function (result) {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        $scope.refresh(getActiveTab());
      })
    }

    $scope.deleteRAB = function (rab) {
      RAB.deleteById({ id: rab.id }, function () {
        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        $scope.refresh(getActiveTab());
      })
    }


    $scope.calculateTotal = function() {
      var durasi = (typeof $scope.selectedRABNode.Durasi == 'undefined' || $scope.selectedRABNode.Durasi == undefined) ? 1 : $scope.selectedRABNode.Durasi;
      var volume = (typeof $scope.selectedRABNode.Volume == 'undefined' || $scope.selectedRABNode.Volume == undefined) ? 1 : $scope.selectedRABNode.Volume;
      return formatter.format(durasi*volume*$scope.selectedRABNode.HargaSatuan);
    }
  }

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('BelanjaModalInstanceCtrl', BelanjaModalInstanceCtrl);

  function BelanjaModalInstanceCtrl($uibModalInstance, selectedBelanja, sumberBiayaItemList, $scope, selectedBelanjaTitle, message) {
    var vm = this;
    if (!selectedBelanja) {
      $uibModalInstance.dismiss('cancel');
    }
    vm.sumberBiayaItemList = sumberBiayaItemList;
    vm.newRAB = {};
    vm.selectedBelanjaTitle = selectedBelanjaTitle;
    if (selectedBelanjaTitle) {
      vm.newRAB.BelanjaTitleId = selectedBelanjaTitle.id;
    } else {
      vm.newRAB.BelanjaId = selectedBelanja.id;
    }
    
    vm.isTitleOnly = false;
    vm.message = message;

    vm.ok = function () {
      $uibModalInstance.close({
        rab: vm.newRAB,
        isTitleOnly: vm.isTitleOnly,
        selectedBelanjaTitle: vm.selectedBelanjaTitle
      });
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }

    var formatter = new Intl.NumberFormat('id', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    })

    $scope.calculateTotal = function() {
      var durasi = (typeof vm.newRAB.Durasi == 'undefined' || vm.newRAB.Durasi == undefined) ? 1 : vm.newRAB.Durasi;
      var volume = (typeof vm.newRAB.Volume == 'undefined' || vm.newRAB.Volume == undefined) ? 1 : vm.newRAB.Volume;
      return formatter.format(durasi*volume*vm.newRAB.HargaSatuan);
    }

    $scope.formatCurrency = function(value) {
      return formatter.format(value);
    }
  }

})();

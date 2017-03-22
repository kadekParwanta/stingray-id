/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('RkpPageCtrl', RkpPageCtrl);

  /** @ngInject */
  function RkpPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, $q, RPJMDes, WaktuPelaksanaan, RKP, SumberBiaya) {
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
    $scope.polaPelaksanaanList = [];
    $scope.sumberBiayaItemList = [];
    $scope.bidangList = [];
    $scope.RKPList = [];
    $scope.RPJMDesList = [];
    $scope.treesData = [];
    $scope.basicConfigs = [];
    // $scope.currentTabIndex = 1;
    $scope.selectedBidang = {};
    $scope.selectedRPJMDes = {};
    $scope.selectedWaktuPelaksanaan = {};

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
              { relation: "SumberBiaya" },
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
        vm.treesData.length = 0;
        $scope.treesData.length = 0;
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
      var ind = getActiveTab().No -1;
      if (node.type === 'pricetag') {
        $scope.selectedNode = $filter('filter')($scope.RKPList[ind], { id: selectedId })[0];
        if ($scope.selectedNode.SumberBiaya && $scope.selectedNode.SumberBiaya.length > 0) {
          $scope.selectedSumberBiaya = $scope.selectedNode.SumberBiaya;
        } else {
          $scope.defaultSumberBiaya.RKPId = $scope.selectedNode.id;
          $scope.selectedSumberBiaya = [
            $scope.defaultSumberBiaya
          ];
        }
        
        $scope.$apply();
      } else if (node.type === 'folder'){
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: selectedId })[0];
        $scope.selectedRPJMDes.SubBidang = "-";
        $scope.selectedNode = false;
        $scope.$apply();
      } else {
        $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: parent })[0];
        $scope.selectedRPJMDes = $filter('filter')($scope.RPJMDesList[ind], { id: selectedId })[0];
        $scope.selectedNode = false;
        $scope.$apply();
      }
    }

    $scope.applyModelChanges = function () {
      return !$scope.ignoreChanges;
    };

    $scope.deleteRKP = function(rkp) {
      var currentWaktuPelaksanaan = getActiveTab();
      RKP.deleteById({ id: rkp.id }, function () {
                $scope.refresh(currentWaktuPelaksanaan);
                $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
            })
    }

    function reCreateSumberBiaya(rkp, cb) {
      var promises = $scope.selectedSumberBiaya.map(function (sumberBiaya) {
        var deferred = $q.defer();
        if (sumberBiaya.id) {
          //update
          RKP.SumberBiaya.updateById({ id: rkp.id, fk: sumberBiaya.id }, sumberBiaya, function (res) {
            deferred.resolve(res);
          })
        } else {
          //create
          SumberBiaya.create(sumberBiaya, function (res) {
            deferred.resolve(res);
          });
        }

        return deferred.promise;;
      })

      $q.all(promises).then(function (data) {
        cb();
      })

    }

    $scope.editRKP = function (rkp) {
      var currentWaktuPelaksanaan = getActiveTab();
      RKP.prototype$updateAttributes({
        id: rkp.id,
        Nama: rkp.Nama,
        Lokasi: rkp.Lokasi,
        Volume: rkp.Volume,
        Sasaran: rkp.Sasaran,
        Pelaksana: rkp.Pelaksana,
        PraLamaPelaksanaan: rkp.PraLamaPelaksanaan,
        PolaPelaksanaanId: rkp.PolaPelaksanaanId,
        TanggalMulai: rkp.TanggalMulai,
        TanggalSelesai: rkp.TanggalSelesai
      }, function (result) {
        reCreateSumberBiaya(rkp, function (res) {
          $scope.refresh(currentWaktuPelaksanaan);
          $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
        })
        
      })
    }

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
          },
          polaPelaksanaanList: function() {
            return $scope.polaPelaksanaanList;
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
            Nama: newRKP.Nama,
            Lokasi: newRKP.Lokasi,
            Volume: newRKP.Volume,
            Sasaran: newRKP.Sasaran,
            Pelaksana: newRKP.Pelaksana,
            PraLamaPelaksanaan: newRKP.PraLamaPelaksanaan,
            PolaPelaksanaanId: newRKP.PolaPelaksanaanId,
            TanggalMulai: newRKP.TanggalMulai,
            TanggalSelesai: newRKP.TanggalSelesai
          }, function(res){
            $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
            $scope.refresh(currentWaktuPelaksanaan);
          })
        } else {
          RKP.create({
            RPJMDesId: rpjmdes.id,
            WaktuPelaksanaanId : currentWaktuPelaksanaan.id,
            Nama: newRKP.Nama,
            Lokasi: newRKP.Lokasi,
            Volume: newRKP.Volume,
            Sasaran: newRKP.Sasaran,
            Pelaksana: newRKP.Pelaksana,
            PraLamaPelaksanaan: newRKP.PraLamaPelaksanaan,
            PolaPelaksanaanId: newRKP.PolaPelaksanaanId,
            TanggalMulai: newRKP.TanggalMulai,
            TanggalSelesai: newRKP.TanggalSelesai
          }, function(res){
            $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
            $scope.refresh(currentWaktuPelaksanaan);
          })
        }
      })
    };

    $scope.selectedSumberBiaya = [
      {}
    ];

    $scope.defaultSumberBiaya = {
      Jumlah: null,
      SumberBiayaItemId: null,
      RKPId: null
    }

    $scope.addNewSumberBiaya = function () {
      var defaultSumberBiaya = angular.copy($scope.defaultSumberBiaya);
      if ($scope.selectedNode.id) {
        defaultSumberBiaya = {
          Jumlah: null,
          SumberBiayaItemId: null,
          RKPId: $scope.selectedNode.id
        }
      }
      $scope.selectedSumberBiaya.push(defaultSumberBiaya);
    }

    $scope.removeSumberBiaya = function(sumberBiaya) {
      var ind = $scope.selectedSumberBiaya.indexOf(sumberBiaya);
      $scope.selectedSumberBiaya.splice(ind,1);
    }

    //datepicker
    $scope.today = function () {
      $scope.selectedNode.TanggalMulai = new Date();
      $scope.selectedNode.TanggalSelesai = new Date();
    };

    $scope.clear = function () {
      $scope.selectedNode.TanggalMulai = null;
      $scope.selectedNode.TanggalSelesai = null;
    };

    $scope.inlineOptions = {
      customClass: getDayClass,
      minDate: new Date(),
      showWeeks: true
    };

    $scope.dateOptions = {
      dateDisabled: disabled,
      formatYear: 'yy',
      // maxDate: new Date(2020, 5, 22),
      // minDate: new Date(),
      startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function () {
      $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
      $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };

    $scope.open2 = function () {
      $scope.popup2.opened = true;
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
      opened: false
    };

    $scope.popup2 = {
      opened: false
    };

    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }

      return '';
    }


  }

  angular.module('BlurAdmin.pages.perencanaan')
    .controller('RkpModalInstanceCtrl', RkpModalInstanceCtrl);

  function RkpModalInstanceCtrl($uibModalInstance, bidang, rpjmdes, polaPelaksanaanList, $scope) {
    var vm = this;
    vm.rpjmdes = rpjmdes;
    vm.bidang = bidang;
    vm.polaPelaksanaanList = polaPelaksanaanList;
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

    //datepicker
    $scope.today = function () {
      vm.newRKP.TanggalMulai = new Date();
      vm.newRKP.TanggalSelesai = new Date();
    };

    $scope.clear = function () {
      vm.newRKP.TanggalMulai = null;
      vm.newRKP.TanggalSelesai = null;
    };

    $scope.inlineOptions = {
      customClass: getDayClass,
      minDate: new Date(),
      showWeeks: true
    };

    $scope.dateOptions = {
      dateDisabled: disabled,
      formatYear: 'yy',
      // maxDate: new Date(2020, 5, 22),
      // minDate: new Date(),
      startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function () {
      $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
      $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };

    $scope.open2 = function () {
      $scope.popup2.opened = true;
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
      opened: false
    };

    $scope.popup2 = {
      opened: false
    };

    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }

      return '';
    }
  }

})();

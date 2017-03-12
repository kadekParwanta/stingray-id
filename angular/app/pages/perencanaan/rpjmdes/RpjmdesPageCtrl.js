/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesPageCtrl', RpjmdesPageCtrl);

    /** @ngInject */
    function RpjmdesPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, $q, RPJMDes, WaktuPelaksanaan) {
        var vm = this;
        $scope.RPJMDesList = [];
        $scope.bidangList = [];
        $scope.waktuPelaksanaanList
        $scope.Bidang1 = [];
        $scope.Bidang2 = [];
        $scope.Bidang3 = [];
        $scope.Bidang4 = [];
        $scope.treeData = [];
        vm.treeData = [];
        $scope.Bidang1Total = 0;
        $scope.Bidang2Total = 0;
        $scope.Bidang3Total = 0;
        $scope.Bidang4Total = 0;
        $scope.basicTree;
        $scope.selectedNode;
        $scope.bidangTitle = "Mohon pilih item di samping";

        $scope.ignoreChanges = false;
        var newId = 0;
        $scope.newNode = {};

        $scope.basicConfig = {
            core: {
                multiple: false,
                check_callback: true,
                worker: true
            },
            'types': {
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
            $scope.Bidang1.length = 0;
            $scope.Bidang2.length = 0;
            $scope.Bidang3.length = 0;
            $scope.Bidang4.length = 0;
            $scope.Bidang1Total = 0;
            $scope.Bidang2Total = 0;
            $scope.Bidang3Total = 0;
            $scope.Bidang4Total = 0;

            angular.forEach($scope.bidangList, function (bidang) {
                vm.treeData.push({
                    "id": bidang.id,
                    "parent": "#",
                    "type": "folder",
                    "text": bidang.No + " " + bidang.Nama,
                    "state": {
                        "opened": true
                    }
                })
                $scope.treeData = vm.treeData;
                $scope.basicConfig.version++;

                var rpjmdesList = bidang.RPJMDes;
                if (rpjmdesList.length > 0) {
                    angular.forEach(rpjmdesList, function (rpjmdes, index) {
                        $scope.treeData.push({
                            "id": rpjmdes.id,
                            "parent": bidang.id,
                            "type": "default",
                            "text": bidang.No + "." + (index + 1) + " " + rpjmdes.SubBidang,
                            "state": {
                                "opened": true
                            }
                        })
                        if (bidang.No === 1) {
                            $scope.Bidang1.push(rpjmdes);
                            if (rpjmdes.SumberBiaya) {
                                var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                                $scope.Bidang1Total += jumlah;
                            }
                        } else if (bidang.No === 2) {
                            $scope.Bidang2.push(rpjmdes);
                            if (rpjmdes.SumberBiaya) {
                                var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                                $scope.Bidang2Total += jumlah;
                            }
                        } else if (bidang.No === 3) {
                            $scope.Bidang3.push(rpjmdes);
                            if (rpjmdes.SumberBiaya) {
                                var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                                $scope.Bidang3Total += jumlah;
                            }
                        } else if (bidang.No === 4) {
                            $scope.Bidang4.push(rpjmdes);

                            if (rpjmdes.SumberBiaya) {
                                var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                                $scope.Bidang4Total += jumlah;
                            }
                        }
                    })
                }
            })
        }

        function getActiveRPJM() {
            RPJM.findOne({
                filter: {
                    where: { IsActive: true },
                    include: { 
                        relation: "Bidang", 
                        scope: {
                            order: "No ASC",
                            include:{
                                relation: "RPJMDes", 
                                scope: {
                                    include:  ['WaktuPelaksanaan', 'SumberBiaya', 'PolaPelaksanaan']
                            }
                        }
                    }
                    }
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
                populateRPJMDes($scope.bidangList);
                getWaktuPelaksanaanList();
            })
        }

        function getWaktuPelaksanaanList() {
            WaktuPelaksanaan.find(function (results) {
                $scope.waktuPelaksanaanList = results;
            });
        };

        function assignWaktuPelaksanaan(rpjmdes, waktuPelaksanaanList) {
            var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
                var deferred = $q.defer();
                if (waktupelaksanaan) {
                    RPJMDes.WaktuPelaksanaan.link({ id: rpjmdes.id, fk: waktupelaksanaan.id }, null, function (data) {
                        deferred.resolve(data);
                    });
                } else {
                    deferred.resolve("");
                }
                return deferred.promises;
            });

            return $q.all(promises);
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

        $scope.open = function (page, size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: RpjmdesModalInstanceCtrl,
                controllerAs: 'vm',
                resolve: {
                    bidangList: function () {
                        return $scope.bidangList;
                    },
                    waktuPelaksanaanList: function () {
                        return $scope.waktuPelaksanaanList;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                var newRPJMDes = data.rpjmdes;
                if (newRPJMDes.BidangId) {
                    RPJMDes.create(newRPJMDes, function (rpjmdes) {
                        assignWaktuPelaksanaan(rpjmdes, data.waktuPelaksanaan).then(function () {
                            $scope.treeData.push({
                                id: rpjmdes.id,
                                parent: newRPJMDes.BidangId,
                                text: rpjmdes.SubBidang,
                                state: { opened: true }
                            });
                            $scope.basicConfig.version++;
                        })
                    })
                }
            })
        };
    }


    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesModalInstanceCtrl', RpjmdesModalInstanceCtrl);

    function RpjmdesModalInstanceCtrl($uibModalInstance, bidangList, waktuPelaksanaanList) {
        var vm = this;
        vm.bidangList = bidangList;
        vm.waktuPelaksanaanList = waktuPelaksanaanList;
        vm.selectedWaktuPelaksanaan = [];
        vm.newRPJMDes = {};

        vm.ok = function () {
            $uibModalInstance.close({
                rpjmdes: vm.newRPJMDes,
                waktuPelaksanaan: vm.selectedWaktuPelaksanaan
            });
        }

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    }

})();

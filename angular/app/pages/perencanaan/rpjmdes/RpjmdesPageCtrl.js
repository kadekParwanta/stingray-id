/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesPageCtrl', RpjmdesPageCtrl);

    /** @ngInject */
    function RpjmdesPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, RPJMDes) {
        var vm = this;
        $scope.RPJMDesList = [];
        $scope.bidangList = [];
        $scope.Bidang1 = [];
        $scope.Bidang2 = [];
        $scope.Bidang3 = [];
        $scope.Bidang4 = [];
        $scope.treeData = [];
        $scope.Bidang1Total = 0;
        $scope.Bidang2Total = 0;
        $scope.Bidang3Total = 0;
        $scope.Bidang4Total = 0;
        $scope.basicTree;
        $scope.selectedNode;
        $scope.bidangTitle = "Mohon pilih item di samping";

        $scope.ignoreChanges = false;
        var newId = 0;
        $scope.ignoreChanges = false;
        $scope.newNode = {};

        $scope.basicConfig = {
            core: {
                multiple: false,
                animation: true,
                error: function (error) {
                    $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                },
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

        function populateRPJMDes(data) {
            $scope.treeData.length = 0;
            $scope.Bidang1.length = 0;
            $scope.Bidang2.length = 0;
            $scope.Bidang3.length = 0;
            $scope.Bidang4.length = 0;
            $scope.Bidang1Total = 0;
            $scope.Bidang2Total = 0;
            $scope.Bidang3Total = 0;
            $scope.Bidang4Total = 0;
            angular.forEach($scope.bidangList, function (bidang) {
                $scope.treeData.push({
                    "id": bidang.id,
                    "parent": "#",
                    "type": "folder",
                    "text": bidang.No + " " + bidang.Nama,
                    "state": {
                        "opened": true
                    }
                })
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

        function getBidangList() {
            Bidang.find({
                filter: {
                    include: { 'RPJMDes': ['WaktuPelaksanaan', 'SumberBiaya', 'PolaPelaksanaan'] }
                }
            }, function (results) {
                $scope.bidangList = results;
                populateRPJMDes(results);
            });
        };


        function getActiveRPJM() {
            RPJM.findOne({
                filter: {
                    where: { IsActive: true },
                    include: { Bidang: { RPJMDes: ['WaktuPelaksanaan', 'SumberBiaya', 'PolaPelaksanaan'] } }
                }
            }, function (result) {
                $scope.activeRPJM = {
                    TahunMulai: result.TahunMulai,
                    TahunSelesai: result.TahunSelesai,
                    Regulasi: result.Regulasi,
                    Perihal: result.Perihal,
                    Keterangan: result.Keterangan
                }

                var bidangList = result.Bidang;
                $scope.bidangList = bidangList;
                populateRPJMDes(bidangList);
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

        $scope.open = function (page, size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: RpjmdesModalInstanceCtrl,
                controllerAs: 'vm',
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (newRPJMDes) {
                if (newRPJMDes.BidangId) {
                    RPJMDes.create(newRPJMDes, function (rpjmdes) {
                        $scope.treeData.push({
                            id: rpjmdes.id,
                            parent: newRPJMDes.BidangId,
                            text: rpjmdes.SubBidang,
                            state: { opened: true }
                        });
                        $scope.basicConfig.version++;
                    })
                }
            })
        };

    }

    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesModalInstanceCtrl', RpjmdesModalInstanceCtrl);

    function RpjmdesModalInstanceCtrl($uibModalInstance) {
        var vm = this;
        vm.newRPJMDes = {};

        vm.ok = function () {
            $uibModalInstance.close(vm.newRPJMDes);
        }

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    }

})();

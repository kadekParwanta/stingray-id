/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesPageCtrl', RpjmdesPageCtrl);

    /** @ngInject */
    function RpjmdesPageCtrl($scope, RPJMDes, Bidang, $timeout) {
        var vm = this;
        $scope.RPJMDesList = [];
        $scope.bidangList = [];
        $scope.Bidang1 = [];
        $scope.Bidang1Total = 0;
        $scope.Bidang2 = [];
        $scope.Bidang2Total = 0;
        $scope.Bidang3 = [];
        $scope.Bidang3Total = 0;
        $scope.Bidang4 = [];
        $scope.Bidang4Total = 0;
        $scope.treeData = [];

        $scope.ignoreChanges = false;
        var newId = 0;
        $scope.ignoreChanges = false;
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
            'plugins': ['types'],
            'version': 1
        };

        function getRPJMDesList() {
            RPJMDes
                .find({
                    filter: {
                        include: ['Bidang', 'WaktuPelaksanaan', 'SumberBiaya', 'PolaPelaksanaan']
                    }
                }, function (results) {
                    $scope.RPJMDesList = results;
                    populateRPJMDes(results);
                })
        }

        function populateRPJMDes(data) {
            angular.forEach($scope.bidangList, function(bidang){
                $scope.treeData.push({
                        "id": bidang.id,
                        "parent": "#",
                        "type": "folder",
                        "text": bidang.Nama,
                        "state": {
                            "opened": true
                        }
                    })
            })
            angular.forEach(data, function (rpjmdes) {
                var bidang = rpjmdes.Bidang;
                if (bidang.No === 1) {
                    $scope.Bidang1.push(rpjmdes);
                    $scope.treeData.push({
                        "id": rpjmdes.id,
                        "parent": $scope.bidangList[0].id,
                        "type": "default",
                        "text": rpjmdes.SubBidang,
                        "state": {
                            "opened": true
                        }
                    })
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang1Total += jumlah;
                    }
                } else if (bidang.No === 2) {
                    $scope.Bidang2.push(rpjmdes);
                    $scope.treeData.push({
                        "id": rpjmdes.id,
                        "parent": $scope.bidangList[1].id,
                        "type": "folder",
                        "text": rpjmdes.SubBidang,
                        "state": {
                            "opened": true
                        }
                    })
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang2Total += jumlah;
                    }
                } else if (bidang.No === 3) {
                    $scope.Bidang3.push(rpjmdes);
                    $scope.treeData.push({
                        "id": rpjmdes.id,
                        "parent": $scope.bidangList[2].id,
                        "type": "folder",
                        "text": rpjmdes.SubBidang,
                        "state": {
                            "opened": true
                        }
                    })
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang3Total += jumlah;
                    }
                } else if (bidang.No === 4) {
                    $scope.Bidang4.push(rpjmdes);
                    $scope.treeData.push({
                        "id": rpjmdes.id,
                        "parent": $scope.bidangList[3].id,
                        "type": "folder",
                        "text": rpjmdes.SubBidang,
                        "state": {
                            "opened": true
                        }
                    })
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang4Total += jumlah;
                    }
                }
            })
        }

        function getBidangList(cb) {
            Bidang
                .find()
                .$promise
                .then(function (results) {
                    $scope.bidangList = results;
                    cb();
                });
        };

        getBidangList(function(){
            getRPJMDesList();
        });
        



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
            $scope.treeData = getDefaultData();
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
            $timeout(function () {
                $scope.ignoreChanges = false;
            });
        };


        $scope.applyModelChanges = function () {
            return !$scope.ignoreChanges;
        };

    }

})();

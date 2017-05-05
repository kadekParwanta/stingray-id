/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesPageCtrl', RpjmdesPageCtrl);

    /** @ngInject */
    function RpjmdesPageCtrl($scope, RPJM, $timeout, $filter, $uibModal, $q, RPJMDes, WaktuPelaksanaan, RKP, Desa, SumberBiaya) {
        var vm = this;
        $scope.RPJMDesList = [];
        $scope.bidangList = [];
        $scope.waktuPelaksanaanList = [];
        $scope.polaPelaksanaanList = [];
        $scope.sumberBiayaItemList = [];
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
        $scope.selectedBidang;
        $scope.bidangTitle = "Mohon pilih item di samping";
        $scope.desa;

        $scope.ignoreChanges = false;
        var newId = 0;
        $scope.newNode = {};

        $scope.selectedSumberBiaya = [
            {}
        ];

        $scope.defaultSumberBiaya = {
            Jumlah: null,
            SumberBiayaItemId: null,
            RPJMDesId: null
        }

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
                        var a_attr = {"class":"green"};
                        if (!rpjmdes.Sah) {
                            a_attr = {"class":"red"};
                        }
                        $scope.treeData.push({
                            "id": rpjmdes.id,
                            "parent": bidang.id,
                            "type": "default",
                            "text": bidang.No + "." + rpjmdes.No + " " + rpjmdes.SubBidang,
                            "a_attr": a_attr,
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
                    include: [{
                        relation: "Bidang",
                        scope: {
                            order: "No ASC",
                            include: {
                                relation: "RPJMDes",
                                scope: {
                                    include: ['WaktuPelaksanaan', {'SumberBiaya':'Sumber'}, 'PolaPelaksanaan']
                                }
                            }
                        }
                    },
                    {
                        relation: "WaktuPelaksanaan",
                        scope: {
                            order: "No ASC"
                        }
                    },
                    { relation: "PolaPelaksanaan" },
                    { relation: "SumberBiayaItem" }]
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
                $scope.polaPelaksanaanList = result.PolaPelaksanaan;
                $scope.sumberBiayaItemList = result.SumberBiayaItem;
                populateRPJMDes($scope.bidangList);
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

        function createRKP(rpjmdes, waktuPelaksanaanList) {
            var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
                var deferred = $q.defer();
                if (waktupelaksanaan) {
                    RKP.create({
                        WaktuPelaksanaanId: waktupelaksanaan.id,
                        Nama: rpjmdes.SubBidang,
                        Lokasi: rpjmdes.Lokasi,
                        Volume: rpjmdes.PrakiraanVolume,
                        Sasaran: rpjmdes.Sasaran,
                        BidangId: rpjmdes.BidangId,
                        PolaPelaksanaanId: rpjmdes.PolaPelaksanaanId
                    }, function (data) {
                        createSumberBiayaForRKP(data, function() {
                            deferred.resolve(data);
                        })
                    })
                } else {
                    deferred.resolve("");
                }
                return deferred.promises;
            });

            return $q.all(promises);
        }

        function getDesaDetail() {
            Desa.find(function (desaList) {
                $scope.desa = desaList[0];
            })
        }

        function init() {
            getDesaDetail();
            getActiveRPJM();
        }

        init();

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
                $scope.selectedNode.TambahRKP = $scope.selectedNode.Sah;
                if ($scope.selectedNode.SumberBiaya) {
                    $scope.selectedSumberBiaya = [$scope.selectedNode.SumberBiaya];
                } else {
                    $scope.defaultSumberBiaya.RPJMDesId = $scope.selectedNode.id;
                    $scope.selectedSumberBiaya = [
                        $scope.defaultSumberBiaya
                    ];
                }
                $scope.$apply();
            } else {
                $scope.selectedNode = {};
                $scope.selectedBidang = $filter('filter')($scope.bidangList, { id: selectedId })[0];
                $scope.bidangTitle = "Mohon pilih item di samping";
                $scope.$apply();
            }
        }

        $scope.addNewSumberBiaya = function () {
            var defaultSumberBiaya = angular.copy($scope.defaultSumberBiaya);
            if ($scope.selectedNode.id) {
                defaultSumberBiaya = {
                    Jumlah: null,
                    SumberBiayaItemId: null,
                    RPJMDesId: $scope.selectedNode.id
                }
            }
            $scope.selectedSumberBiaya.push(defaultSumberBiaya);
        }

        $scope.removeSumberBiaya = function (sumberBiaya) {
            var ind = $scope.selectedSumberBiaya.indexOf(sumberBiaya);
            $scope.selectedSumberBiaya.splice(ind, 1);
        }

        function reCreateSumberBiayaForRPJMDes(rpjmdes, cb) {
            var promises = $scope.selectedSumberBiaya.map(function (sumberBiaya) {
                var deferred = $q.defer();
                if (sumberBiaya.id) {
                    //update
                    RPJMDes.SumberBiaya.update({ id: rpjmdes.id}, sumberBiaya, function (res) {
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

        function createSumberBiayaForRKP(rkp, cb) {
            var promises = $scope.selectedSumberBiaya.map(function (sumberBiaya) {
                var deferred = $q.defer();
                var item = {
                    Jumlah: sumberBiaya.Jumlah,
                    SumberBiayaItemId: sumberBiaya.SumberBiayaItemId,
                    RKPId: rkp.id
                }
                SumberBiaya.create(item, function (res) {
                        deferred.resolve(res);
                    });

                return deferred.promise;;
            })

            $q.all(promises).then(function (data) {
                cb();
            })

        }

        $scope.applyModelChanges = function () {
            return !$scope.ignoreChanges;
        };

        $scope.open = function (page, size, topClass, message) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: RpjmdesModalInstanceCtrl,
                controllerAs: 'vm',
                windowClass: topClass,
                resolve: {
                    bidangList: function () {
                        return $scope.bidangList;
                    },
                    waktuPelaksanaanList: function () {
                        return $scope.waktuPelaksanaanList;
                    },
                    selectedBidang: function () {
                        return $scope.selectedBidang;
                    },
                    desa: function () {
                        return $scope.desa;
                    },
                    message: function () {
                        return message;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                var newRPJMDes = data.rpjmdes;
                if (newRPJMDes.BidangId) {
                    RPJMDes.create(newRPJMDes, function (rpjmdes) {
                        assignWaktuPelaksanaan(rpjmdes, data.waktuPelaksanaan).then(function () {
                            $scope.refresh();
                        })
                    })
                }
            })
        };

        $scope.deleteRPJMDes = function (rpjmdes) {
            RPJMDes.deleteById({ id: rpjmdes.id }, function () {
                $scope.refresh();
            })
        }

        $scope.editRPJMDes = function (rpjmdes) {
            if (rpjmdes.TambahRKP && !rpjmdes.WaktuPelaksanaan) {
                $scope.open('app/pages/perencanaan/belanja/errorModal.html', 'md', null, 'Mohon pilih waktu pelaksanaan');
                return;
            }
            RPJMDes.prototype$updateAttributes({
                id: rpjmdes.id,
                SubBidang: rpjmdes.SubBidang,
                Jenis: rpjmdes.Jenis,
                Lokasi: rpjmdes.Lokasi,
                PrakiraanVolume: rpjmdes.PrakiraanVolume,
                Sasaran: rpjmdes.Sasaran,
                Sah: rpjmdes.TambahRKP,
                PolaPelaksanaanId: rpjmdes.PolaPelaksanaanId
            }, function (result) {
                reCreateSumberBiayaForRPJMDes(result, function (res) {
                    unlinkAllWaktuPelaksanaan(rpjmdes).then(function (res) {
                        if (rpjmdes.WaktuPelaksanaan) {
                            var waktuPelaksanaan = Object.keys(rpjmdes.WaktuPelaksanaan).map(function (key) { return rpjmdes.WaktuPelaksanaan[key]; });
                            assignWaktuPelaksanaan(rpjmdes, waktuPelaksanaan).then(function () {
                                if (rpjmdes.TambahRKP) {
                                    createRKP(rpjmdes, waktuPelaksanaan).then(function () {
                                        $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
                                        $scope.refresh();
                                    })
                                } else {
                                    $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
                                    $scope.refresh();
                                }
                            })
                        } else {
                            $scope.open('app/pages/ui/modals/modalTemplates/successModal.html');
                            $scope.refresh();
                        }

                    })
                })
            })
        }

        var formatter = new Intl.NumberFormat();

        $scope.formatCurrency = function (value) {
            return formatter.format(value);
        }

        $scope.export = function () {
            tableToExcel("rpjmdesTable","RPJMDes");
        }


        function tableToExcel(table, name) {
            var uri = 'data:application/vnd.ms-excel;base64,'
                , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
                , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
                , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
            if (!table.nodeType) table = document.getElementById(table)
                var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
                return window.location.href = uri + base64(format(template, ctx))
        }
        
        $scope.convertAlphabetical = function(n) {
            return String.fromCharCode(97 + n);
        }

        function unlinkAllWaktuPelaksanaan(rpjmdes) {
            var promises = $scope.waktuPelaksanaanList.map(function (waktuPelaksanaan) {
                var deferred = $q.defer();
                RPJMDes.WaktuPelaksanaan.exists({ id: rpjmdes.id, fk: waktuPelaksanaan.id },
                    function (res) {
                        RPJMDes.WaktuPelaksanaan.unlink({ id: rpjmdes.id, fk: waktuPelaksanaan.id },
                            null, function (result) {
                                deferred.resolve(result);
                            }, function (err) {
                                deferred.reject();
                            });
                    }, function (err) {
                        console.log(err);
                        deferred.resolve();
                    });

                return deferred.promise;
            });

            return $q.all(promises);
        }
    }


    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesModalInstanceCtrl', RpjmdesModalInstanceCtrl);

    function RpjmdesModalInstanceCtrl($uibModalInstance, bidangList, waktuPelaksanaanList, selectedBidang, desa, message) {
        var vm = this;
        vm.bidangList = bidangList;
        vm.waktuPelaksanaanList = waktuPelaksanaanList;
        vm.selectedWaktuPelaksanaan = [];
        vm.desa = desa;
        vm.newRPJMDes = {};
        vm.message = message;
        if (selectedBidang) vm.newRPJMDes.BidangId = selectedBidang.id;

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

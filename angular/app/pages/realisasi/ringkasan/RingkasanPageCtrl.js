/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.realisasi')
        .controller('RingkasanPageCtrl', RingkasanPageCtrl);

    /** @ngInject */
    function RingkasanPageCtrl($scope, $uibModal, $log, $timeout, moment, RPJM, WaktuPelaksanaan, $q, Realisasi, Pembayaran, RKP) {

        $scope.data = [];
        $scope.activeRPJM;
        $scope.bidangList;
        $scope.waktuPelaksanaanList;
        $scope.selectedWaktuPelaksanaan = {};
        $scope.RKPList = [];
        $scope.ganttData = [];
        $scope.defaultGanttData = [];
        $scope.selectedTask;
        $scope.live = {};

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
                    }
                    ]
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
                populateBidang($scope.bidangList);
            })
        }

        function populateBidang(bidangList) {
            bidangList.forEach(function (bidang) {
                $scope.defaultGanttData.push({
                    name: bidang.Nama,
                    children: []
                })
            })
            getRKPByWaktu($scope.waktuPelaksanaanList);
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
                                relation: "Realisasi", scope: {
                                    include: {
                                        relation: "Pembayaran"
                                    }
                                }
                            },
                            {
                                relation: "Belanja", scope: {
                                    order: "No ASC",
                                    include: [
                                        {
                                            relation: "RAB", scope: {
                                                order: "No ASC",
                                            }
                                        },
                                        {
                                            relation: "BelanjaTitle", scope: {
                                                order: "No ASC",
                                                include:
                                                {
                                                    relation: "RAB", scope: {
                                                        order: "No ASC",
                                                    }
                                                }
                                            }
                                        }]
                                }
                            }
                        ]
                    }
                }, function (result) {
                    var indexWaktuPel = waktupelaksanaan.No - 1;
                    $scope.RKPList[indexWaktuPel] = result;
                    var ganttData = angular.copy($scope.defaultGanttData);
                    angular.forEach(result, function (item, index, arr) {
                        var totalBiaya = 0;
                        var tasks = [];
                        var progress = 0;
                        var tanggalMulai = item.TanggalMulai;
                        var tanggalSelesai = item.TanggalSelesai;
                        var realisasi = item.Realisasi;
                        var id = item.id;
                        var RKPId = id;

                        var initialTask =
                            {
                                id: item.id,
                                name: item.Nama,
                                priority: 1,
                                color: '#F1C232',
                                from: tanggalMulai,
                                to: tanggalSelesai,
                                progress: progress,
                                classes: ['gantt-pointer'],
                                RKPId: RKPId,
                                totalBiaya: totalBiaya,
                                totalUangMasuk: 0,
                                totalUangKeluar: 0
                            };
                        if (realisasi) {
                            initialTask.from = realisasi.TanggalMulai;
                            initialTask.to = realisasi.TanggalSelesai
                            initialTask.progress = realisasi.Progress;
                            initialTask.id = realisasi.id;
                            initialTask.RKPId = item.id;
                            initialTask.totalBiaya = realisasi.TotalBiaya;

                            var pembayaranList = realisasi.Pembayaran;
                            if (pembayaranList.length > 0) {
                                var totalPembayaran = calculateTotalPembayaran(pembayaranList);
                                initialTask.totalUangMasuk = totalPembayaran[0];
                                initialTask.totalUangKeluar = totalPembayaran[1];
                                initialTask.progress = (totalPembayaran[1] / realisasi.TotalBiaya) * 100;
                                pembayaranList.forEach(function (pembayaran, index) {
                                    tasks.push({
                                        id: pembayaran.id,
                                        name: pembayaran.Info,
                                        priority: 2,
                                        color: '#228B22',
                                        from: pembayaran.Tanggal,
                                        to: pembayaran.Tanggal,
                                        classes: ['gantt-pointer']
                                    })
                                })
                            }

                        } else {
                            initialTask.totalBiaya = calculateTotalRKP(item);
                        }

                        tasks.push(initialTask);

                        ganttData.push({
                            name: item.Nama,
                            tasks: tasks
                        })
                        populateDataForGantt(ganttData, item);
                    })

                    deferred.resolve(ganttData);
                })

                return deferred.promise;
            })

            $q.all(promises).then(function (result) {
                $scope.waktuPelaksanaanList.forEach(function (item, index) {
                    $scope.ganttData[item.No - 1] = result[index];
                })
            })
        }

        function calculateTotalRKP(rkpitem) {
            var totalRkp = 0;
            var belanjaList = rkpitem.Belanja;
            belanjaList.forEach(function (belanja) {
                var totalBelanjaJumlah = 0;

                var rabList = belanja.RAB;
                rabList.forEach(function (rabItem) {
                    var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                    totalBelanjaJumlah += jumlah;
                })

                var belanjaTitleList = belanja.BelanjaTitle;
                belanjaTitleList.forEach(function (belanjaTitle) {
                    var totalBelanjaTitle = 0;

                    var rabList = belanjaTitle.RAB;
                    rabList.forEach(function (rabItem) {
                        var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                        totalBelanjaTitle += jumlah;
                    })

                    totalBelanjaJumlah += totalBelanjaTitle;
                })

                totalRkp += totalBelanjaJumlah;
            })

            return totalRkp;
        }

        function calculateTotalPembayaran(pembayaranList) {
            var totalUangMasuk = 0;
            var totalUangKeluar = 0;
            pembayaranList.forEach(function (item) {
                if (item.Debit) {
                    totalUangKeluar += item.Nominal;
                } else {
                    totalUangMasuk += item.Nominal;
                }
            })

            return [totalUangMasuk, totalUangKeluar];
        }

        function populateDataForGantt(ganttData, rkp) {
            ganttData.forEach(function (bidang) {
                if (rkp.Bidang.Nama == bidang.name) {
                    bidang.children.push(rkp.Nama);
                }
            })
        }

        function getActiveTab() {
            return $scope.selectedWaktuPelaksanaan;
        };

        function init() {
            $scope.ganttData = [[]];
            getActiveRPJM();
        }

        $scope.tabSelected = function (tab) {
            $scope.selectedWaktuPelaksanaan = tab;
        }

        init();

        var dataToRemove;

        // Event handler
        var logScrollEvent = function (left, date, direction) {
            if (date !== undefined) {
                $log.info('[Event] api.on.scroll: ' + left + ', ' + (date === undefined ? 'undefined' : date.format()) + ', ' + direction);
            }
        };

        // Event handler
        var logDataEvent = function (eventName) {
            $log.info('[Event] ' + eventName);
        };

        // Event handler
        var logTaskEvent = function (eventName, task) {
            $log.info('[Event] ' + eventName + ': ' + task.model.name);
        };

        // Event handler
        var logRowEvent = function (eventName, row) {
            $log.info('[Event] ' + eventName + ': ' + row.model.name);
        };

        // Event handler
        var logTimespanEvent = function (eventName, timespan) {
            $log.info('[Event] ' + eventName + ': ' + timespan.model.name);
        };

        // Event handler
        var logLabelsEvent = function (eventName, width) {
            $log.info('[Event] ' + eventName + ': ' + width);
        };

        // Event handler
        var logColumnsGenerateEvent = function (columns, headers) {
            $log.info('[Event] ' + 'columns.on.generate' + ': ' + columns.length + ' column(s), ' + headers.length + ' header(s)');
        };

        // Event handler
        var logRowsFilterEvent = function (rows, filteredRows) {
            $log.info('[Event] rows.on.filter: ' + filteredRows.length + '/' + rows.length + ' rows displayed.');
        };

        // Event handler
        var logTasksFilterEvent = function (tasks, filteredTasks) {
            $log.info('[Event] tasks.on.filter: ' + filteredTasks.length + '/' + tasks.length + ' tasks displayed.');
        };

        // Event handler
        var logReadyEvent = function () {
            $log.info('[Event] core.on.ready');
        };

        // Event utility function
        var addEventName = function (eventName, func) {
            return function (data) {
                return func(eventName, data);
            };
        };

        $scope.open = function (page, size, RKPId) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: TimelineModalInstanceCtrl,
                controllerAs: 'vm',
                resolve: {
                    selectedTask: function () {
                        return $scope.selectedTask;
                    },
                    selectedRKP: function () {
                        return RKP.findById({ id: RKPId }, function (rkp) {
                            return rkp;
                        })
                    }
                }
            });

            modalInstance.result.then(function (data) {
                var realisasi = data.realisasi;
                var pembayaranList = data.pembayaranList;
                var id = data.realisasi.id;
                var RKPId = data.realisasi.RKPId;
                if (id == RKPId) {
                    Realisasi.create({
                        RKPId: RKPId,
                        TanggalMulai: realisasi.TanggalMulai,
                        TanggalSelesai: realisasi.TanggalSelesai,
                        TotalBiaya: realisasi.totalBiaya,
                        Progress: realisasi.progress
                    }, function (res) {
                        sendPembayaranList(pembayaranList, res).then(function () {
                            init();
                        })
                    })
                } else {
                    Realisasi.prototype$patchAttributes({
                        id: id,
                        TanggalMulai: realisasi.TanggalMulai,
                        TanggalSelesai: realisasi.TanggalSelesai,
                        Progress: realisasi.progress
                    }, function (res) {
                        sendPembayaranList(pembayaranList, res).then(function () {
                            init();
                        })
                    })
                }
            })
        };

        function sendPembayaranList(pembayaranList, realisasi) {
            var promises = pembayaranList.map(function (pembayaran) {
                var deferred = $q.defer();
                var debit = true;
                if (pembayaran.Debit === "false") {
                    debit = false;
                }

                Pembayaran.create({
                    RealisasiId: realisasi.id,
                    Nominal: pembayaran.Nominal,
                    Tanggal: pembayaran.Tanggal,
                    Info: pembayaran.Info,
                    Debit: debit
                }, function (result) {
                    deferred.resolve(result);
                })

                return deferred.promise;
            })

            return $q.all(promises)
        }

        // angular-gantt options
        $scope.options = {
            mode: 'custom',
            scale: 'day',
            sortMode: undefined,
            sideMode: 'TreeTable',
            daily: false,
            maxHeight: false,
            width: true,
            zoom: 1,
            columns: ['model.name'],
            treeTableColumns: [],
            columnsHeaders: { 'model.name': 'Name' },
            columnsClasses: { 'model.name': 'gantt-column-name' },
            columnsFormatters: {
                'from': function (from) {
                    return from !== undefined ? from.format('lll') : undefined;
                },
                'to': function (to) {
                    return to !== undefined ? to.format('lll') : undefined;
                }
            },
            treeHeaderContent: '<i class="fa fa-align-justify"></i> {{getHeader()}}',
            columnsHeaderContents: {
                'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
            },
            autoExpand: 'none',
            taskOutOfRange: 'truncate',
            fromDate: moment(null),
            toDate: undefined,
            rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
            taskContent: '<i class="fa fa-tasks"></i> {{task.model.name}}',
            allowSideResizing: true,
            labelsEnabled: true,
            currentDate: 'line',
            currentDateValue: new Date(2013, 9, 23, 11, 20, 0),
            draw: false,
            readOnly: false,
            groupDisplayMode: 'disabled',
            filterTask: '',
            filterRow: '',
            timeFrames: {
                'day': {
                    start: moment('8:00', 'HH:mm'),
                    end: moment('20:00', 'HH:mm'),
                    color: '#ACFFA3',
                    working: true,
                    default: true
                },
                'noon': {
                    start: moment('12:00', 'HH:mm'),
                    end: moment('13:30', 'HH:mm'),
                    working: false,
                    default: true
                },
                'closed': {
                    working: false,
                    default: true
                },
                'weekend': {
                    working: false
                },
                'holiday': {
                    working: false,
                    color: 'red',
                    classes: ['gantt-timeframe-holiday']
                }
            },
            dateFrames: {
                'weekend': {
                    evaluator: function (date) {
                        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
                    },
                    targets: ['weekend']
                },
                '11-november': {
                    evaluator: function (date) {
                        return date.month() === 10 && date.date() === 11;
                    },
                    targets: ['holiday']
                }
            },
            timeFramesWorkingMode: 'hidden',
            timeFramesNonWorkingMode: 'visible',
            columnMagnet: '15 minutes',
            timeFramesMagnet: true,
            dependencies: {
                enabled: true,
                conflictChecker: true
            },
            movable: {
                allowRowSwitching: function (task, targetRow) {
                    return task.row.model.name !== 'Milestones' && targetRow.model.name !== 'Milestones';
                }
            },
            corner: {
                headersLabels: function (key) { return key.charAt(0).toUpperCase() + key.slice(1); },
                headersLabelsTemplates: '{{getLabel(header)}} <i class="fa fa-calendar"></i>'
            },
            targetDataAddRowIndex: undefined,
            canDraw: function (event) {
                var isLeftMouseButton = event.button === 0 || event.button === 1;
                return $scope.options.draw && !$scope.options.readOnly && isLeftMouseButton;
            },
            drawTaskFactory: function () {
                return {
                    id: utils.randomUuid(),  // Unique id of the task.
                    name: 'Drawn task', // Name shown on top of each task.
                    color: '#AA8833' // Color of the task in HEX format (Optional).
                };
            },
            api: function (api) {
                // API Object is used to control methods and events from angular-gantt.
                $scope.api = api;

                api.core.on.ready($scope, function () {
                    // Log various events to console
                    api.scroll.on.scroll($scope, logScrollEvent);
                    api.core.on.ready($scope, logReadyEvent);

                    api.data.on.remove($scope, addEventName('data.on.remove', logDataEvent));
                    api.data.on.load($scope, addEventName('data.on.load', logDataEvent));
                    api.data.on.clear($scope, addEventName('data.on.clear', logDataEvent));
                    api.data.on.change($scope, addEventName('data.on.change', logDataEvent));

                    api.tasks.on.add($scope, addEventName('tasks.on.add', logTaskEvent));
                    api.tasks.on.change($scope, addEventName('tasks.on.change', logTaskEvent));
                    api.tasks.on.rowChange($scope, addEventName('tasks.on.rowChange', logTaskEvent));
                    api.tasks.on.remove($scope, addEventName('tasks.on.remove', logTaskEvent));

                    if (api.tasks.on.moveBegin) {
                        api.tasks.on.moveBegin($scope, addEventName('tasks.on.moveBegin', logTaskEvent));
                        //api.tasks.on.move($scope, addEventName('tasks.on.move', logTaskEvent));
                        api.tasks.on.moveEnd($scope, addEventName('tasks.on.moveEnd', logTaskEvent));

                        api.tasks.on.resizeBegin($scope, addEventName('tasks.on.resizeBegin', logTaskEvent));
                        //api.tasks.on.resize($scope, addEventName('tasks.on.resize', logTaskEvent));
                        api.tasks.on.resizeEnd($scope, addEventName('tasks.on.resizeEnd', logTaskEvent));
                    }

                    if (api.tasks.on.drawBegin) {
                        api.tasks.on.drawBegin($scope, addEventName('tasks.on.drawBegin', logTaskEvent));
                        //api.tasks.on.draw($scope, addEventName('tasks.on.draw', logTaskEvent));
                        api.tasks.on.drawEnd($scope, addEventName('tasks.on.drawEnd', logTaskEvent));
                    }

                    api.rows.on.add($scope, addEventName('rows.on.add', logRowEvent));
                    api.rows.on.change($scope, addEventName('rows.on.change', logRowEvent));
                    api.rows.on.move($scope, addEventName('rows.on.move', logRowEvent));
                    api.rows.on.remove($scope, addEventName('rows.on.remove', logRowEvent));

                    api.side.on.resizeBegin($scope, addEventName('labels.on.resizeBegin', logLabelsEvent));
                    //api.side.on.resize($scope, addEventName('labels.on.resize', logLabelsEvent));
                    api.side.on.resizeEnd($scope, addEventName('labels.on.resizeEnd', logLabelsEvent));

                    api.timespans.on.add($scope, addEventName('timespans.on.add', logTimespanEvent));
                    api.columns.on.generate($scope, logColumnsGenerateEvent);

                    api.rows.on.filter($scope, logRowsFilterEvent);
                    api.tasks.on.filter($scope, logTasksFilterEvent);

                    api.data.on.change($scope, function (newData) {
                        /*
                        if (dataToRemove === undefined) {
                            dataToRemove = [
                                { 'id': newData[2].id }, // Remove Kickoff row
                                {
                                    'id': newData[0].id, 'tasks': [
                                        { 'id': newData[0].tasks[0].id },
                                        { 'id': newData[0].tasks[3].id }
                                    ]
                                }, // Remove some Milestones
                                {
                                    'id': newData[7].id, 'tasks': [
                                        { 'id': newData[7].tasks[0].id }
                                    ]
                                } // Remove order basket from Sprint 2
                            ];
                        }*/
                    });

                    // When gantt is ready, load data.
                    // `data` attribute could have been used too.
                    $scope.load();

                    // Add some DOM events
                    api.directives.on.new($scope, function (directiveName, directiveScope, element) {
                        if (directiveName === 'ganttTask') {
                            element.bind('click', function (event) {
                                event.stopPropagation();
                                // logTaskEvent('task-click', directiveScope.task);
                                $scope.handleTaskIconClick(directiveScope.task.model);
                            });
                            element.bind('mousedown touchstart', function (event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.task.row.model;
                                if (directiveScope.task.originalModel !== undefined) {
                                    $scope.live.task = directiveScope.task.originalModel;
                                } else {
                                    $scope.live.task = directiveScope.task.model;
                                }
                                $scope.$digest();
                            });
                        } else if (directiveName === 'ganttRow') {
                            element.bind('click', function (event) {
                                event.stopPropagation();
                                logRowEvent('row-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function (event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        } else if (directiveName === 'ganttRowLabel') {
                            element.bind('click', function () {
                                logRowEvent('row-label-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function () {
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        }
                    });

                    api.tasks.on.rowChange($scope, function (task) {
                        $scope.live.row = task.row.model;
                    });


                });
            },
            shortHeaders: ['month', 'day'],
            longHeaders: ['month', 'week', 'day']
        };

        $scope.handleTaskIconClick = function (taskModel) {
            // alert('Icon from ' + taskModel.name + ' task has been clicked.');
            $scope.selectedTask = taskModel;
            if (taskModel.priority == 1) $scope.open('app/pages/realisasi/timeline/modal.html', '', taskModel.RKPId);
        };

        $scope.handleRowIconClick = function (rowModel) {
            alert('Icon from ' + rowModel.name + ' row has been clicked.');
        };

        $scope.expandAll = function () {
            $scope.api.tree.expandAll();
        };

        $scope.collapseAll = function () {
            $scope.api.tree.collapseAll();
        };

        $scope.$watch('options.sideMode', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.api.side.setWidth(undefined);
                $timeout(function () {
                    $scope.api.columns.refresh();
                });
            }
        });

        $scope.canAutoWidth = function (scale) {
            if (scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/)) {
                return false;
            }
            return true;
        };

        $scope.getColumnWidth = function (widthEnabled, scale, zoom) {
            if (!widthEnabled && $scope.canAutoWidth(scale)) {
                return undefined;
            }

            if (scale.match(/.*?week.*?/)) {
                return 150 * zoom;
            }

            if (scale.match(/.*?month.*?/)) {
                return 300 * zoom;
            }

            if (scale.match(/.*?quarter.*?/)) {
                return 500 * zoom;
            }

            if (scale.match(/.*?year.*?/)) {
                return 800 * zoom;
            }

            return 40 * zoom;
        };

        // Reload data action
        $scope.load = function () {
            $scope.data = [
                // Order is optional. If not specified it will be assigned automatically
                {
                    name: 'Milestones', height: '3em', sortable: false, drawTask: false, classes: 'gantt-row-milestone', color: '#45607D', tasks: [
                        // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
                        { name: 'Kickoff', color: '#93C47D', from: '2013-10-07T09:00:00', to: '2013-10-07T10:00:00', data: 'Can contain any custom data or object' },
                        { name: 'Concept approval', color: '#93C47D', from: new Date(2013, 9, 18, 18, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0), est: new Date(2013, 9, 16, 7, 0, 0), lct: new Date(2013, 9, 19, 0, 0, 0) },
                        { name: 'Development finished', color: '#93C47D', from: new Date(2013, 10, 15, 18, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0) },
                        { name: 'Shop is running', color: '#93C47D', from: new Date(2013, 10, 22, 12, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0) },
                        { name: 'Go-live', color: '#93C47D', from: new Date(2013, 10, 29, 16, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0) }
                    ], data: 'Can contain any custom data or object'
                },
                {
                    name: 'Status meetings', tasks: [
                        { name: 'Demo #1', color: '#9FC5F8', from: new Date(2013, 9, 25, 15, 0, 0), to: new Date(2013, 9, 25, 18, 30, 0) },
                        { name: 'Demo #2', color: '#9FC5F8', from: new Date(2013, 10, 1, 15, 0, 0), to: new Date(2013, 10, 1, 18, 0, 0) },
                        { name: 'Demo #3', color: '#9FC5F8', from: new Date(2013, 10, 8, 15, 0, 0), to: new Date(2013, 10, 8, 18, 0, 0) },
                        { name: 'Demo #4', color: '#9FC5F8', from: new Date(2013, 10, 15, 15, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0) },
                        { name: 'Demo #5', color: '#9FC5F8', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 24, 10, 0, 0) }
                    ]
                },
                {
                    name: 'Kickoff', movable: { allowResizing: false }, tasks: [
                        {
                            name: 'Day 1', color: '#9FC5F8', from: new Date(2013, 9, 7, 9, 0, 0), to: new Date(2013, 9, 7, 17, 0, 0),
                            progress: { percent: 100, color: '#3C8CF8' }, movable: false
                        },
                        {
                            name: 'Day 2', color: '#9FC5F8', from: new Date(2013, 9, 8, 9, 0, 0), to: new Date(2013, 9, 8, 17, 0, 0),
                            progress: { percent: 100, color: '#3C8CF8' }
                        },
                        {
                            name: 'Day 3', color: '#9FC5F8', from: new Date(2013, 9, 9, 8, 30, 0), to: new Date(2013, 9, 9, 12, 0, 0),
                            progress: { percent: 100, color: '#3C8CF8' }
                        }
                    ]
                },
                {
                    name: 'Create concept', tasks: [
                        {
                            name: 'Create concept', priority: 20, content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}}', color: '#F1C232', from: new Date(2013, 9, 10, 8, 0, 0), to: new Date(2013, 9, 16, 18, 0, 0), est: new Date(2013, 9, 8, 8, 0, 0), lct: new Date(2013, 9, 18, 20, 0, 0),
                            progress: 100, sections: {
                                items: [
                                    { name: 'Section #1', classes: ['section-1'], from: new Date(2013, 9, 10, 8, 0, 0), to: new Date(2013, 9, 13, 8, 0, 0) },
                                    { name: 'Section #2', classes: ['section-2'], from: new Date(2013, 9, 13, 8, 0, 0), to: new Date(2013, 9, 15, 8, 0, 0) },
                                    { name: 'Section #3', classes: ['section-3'], from: new Date(2013, 9, 15, 8, 0, 0), to: new Date(2013, 9, 16, 18, 0, 0) }
                                ]
                            }
                        }
                    ]
                },
                {
                    name: 'Finalize concept', tasks: [
                        {
                            id: 'Finalize concept', name: 'Finalize concept', priority: 10, color: '#F1C232', from: new Date(2013, 9, 17, 8, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0),
                            progress: 100
                        }
                    ]
                },
                { name: 'Development', children: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'], content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}' },
                {
                    name: 'Sprint 1', tooltips: false, tasks: [
                        {
                            id: 'Product list view', name: 'Product list view', color: '#F1C232', from: new Date(2013, 9, 21, 8, 0, 0), to: new Date(2013, 9, 25, 15, 0, 0),
                            progress: 25, dependencies: [{ to: 'Order basket' }, { from: 'Finalize concept' }]
                        }
                    ]
                },
                {
                    name: 'Sprint 2', tasks: [
                        {
                            id: 'Order basket', name: 'Order basket', color: '#F1C232', from: new Date(2013, 9, 28, 8, 0, 0), to: new Date(2013, 10, 1, 15, 0, 0),
                            dependencies: { to: 'Checkout' }
                        }
                    ]
                },
                {
                    name: 'Sprint 3', tasks: [
                        {
                            id: 'Checkout', name: 'Checkout', color: '#F1C232', from: new Date(2013, 10, 4, 8, 0, 0), to: new Date(2013, 10, 8, 15, 0, 0),
                            dependencies: { to: 'Login & Signup & Admin Views' }
                        }
                    ]
                },
                {
                    name: 'Sprint 4', tasks: [
                        {
                            id: 'Login & Signup & Admin Views', name: 'Login & Signup & Admin Views', color: '#F1C232', from: new Date(2013, 10, 11, 8, 0, 0), to: new Date(2013, 10, 15, 15, 0, 0),
                            dependencies: [{ to: 'HW' }, { to: 'SW / DNS/ Backups' }]
                        }
                    ]
                },
                { name: 'Hosting' },
                {
                    name: 'Setup', tasks: [
                        { id: 'HW', name: 'HW', color: '#F1C232', from: new Date(2013, 10, 18, 8, 0, 0), to: new Date(2013, 10, 18, 12, 0, 0) }
                    ]
                },
                {
                    name: 'Config', tasks: [
                        { id: 'SW / DNS/ Backups', name: 'SW / DNS/ Backups', color: '#F1C232', from: new Date(2013, 10, 18, 12, 0, 0), to: new Date(2013, 10, 21, 18, 0, 0) }
                    ]
                },
                { name: 'Server', parent: 'Hosting', children: ['Setup', 'Config'] },
                {
                    name: 'Deployment', parent: 'Hosting', tasks: [
                        { name: 'Depl. & Final testing', color: '#F1C232', from: new Date(2013, 10, 21, 8, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0), 'classes': 'gantt-task-deployment' }
                    ]
                },
                {
                    name: 'Workshop', tasks: [
                        { name: 'On-side education', color: '#F1C232', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 25, 15, 0, 0) }
                    ]
                },
                {
                    name: 'Content', tasks: [
                        { name: 'Supervise content creation', color: '#F1C232', from: new Date(2013, 10, 26, 9, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0) }
                    ]
                },
                {
                    name: 'Documentation', tasks: [
                        { name: 'Technical/User documentation', color: '#F1C232', from: new Date(2013, 10, 26, 8, 0, 0), to: new Date(2013, 10, 28, 18, 0, 0) }
                    ]
                }
            ];
            dataToRemove = undefined;

            $scope.timespans = [
                {
                    from: new Date(2013, 9, 21, 8, 0, 0),
                    to: new Date(2013, 9, 25, 15, 0, 0),
                    name: 'Sprint 1 Timespan'
                    //priority: undefined,
                    //classes: [],
                    //data: undefined
                }
            ];
        };

        $scope.reload = function () {
            $scope.load();
        };

        // Remove data action
        $scope.remove = function () {
            $scope.api.data.remove(dataToRemove);
            $scope.api.dependencies.refresh();
        };

        // Clear data action
        $scope.clear = function () {
            $scope.data = [];
        };

        // Add data to target row index
        $scope.addOverlapTaskToTargetRowIndex = function () {
            var targetDataAddRowIndex = parseInt($scope.options.targetDataAddRowIndex);

            if (targetDataAddRowIndex) {
                var targetRow = $scope.data[$scope.options.targetDataAddRowIndex];

                if (targetRow && targetRow.tasks && targetRow.tasks.length > 0) {
                    var firstTaskInRow = targetRow.tasks[0];
                    var copiedColor = firstTaskInRow.color;
                    var firstTaskEndDate = firstTaskInRow.to.toDate();
                    var overlappingFromDate = new Date(firstTaskEndDate);

                    overlappingFromDate.setDate(overlappingFromDate.getDate() - 1);

                    var overlappingToDate = new Date(overlappingFromDate);

                    overlappingToDate.setDate(overlappingToDate.getDate() + 7);

                    targetRow.tasks.push({
                        'name': 'Overlapping',
                        'from': overlappingFromDate,
                        'to': overlappingToDate,
                        'color': copiedColor
                    });
                }
            }
        };

    }

    angular.module('BlurAdmin.pages.realisasi')
        .controller('TimelineModalInstanceCtrl', TimelineModalInstanceCtrl);

    function TimelineModalInstanceCtrl($uibModalInstance, selectedTask, selectedRKP, $state) {
        var vm = this;
        vm.selectedRKP = selectedRKP;
        vm.selectedTask = angular.copy(selectedTask);
        vm.selectedTask.TanggalMulai = selectedTask.from.toDate();
        vm.selectedTask.TanggalSelesai = selectedTask.to.toDate();

        vm.ok = function () {
            $uibModalInstance.close({
                realisasi: vm.selectedTask,
                pembayaranList: vm.pembayaranList
            });
        }

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        vm.goToDetail = function(id) {
            $uibModalInstance.dismiss('cancel');
            $state.go('realisasiitem', {id:id});
        }

        vm.pembayaranList = [
        ];

        vm.defaultPembayaran = {
            Nominal: null,
            Tanggal: null,
            RealisasiId: null,
            RKPId: null,
            Debit: "true"
        }

        vm.addNewPembayaran = function () {
            var defaultPembayaran = angular.copy(vm.defaultPembayaran);
            if (vm.selectedTask.id) {
                defaultPembayaran = {
                    Nominal: null,
                    Tanggal: null,
                    RealisasiId: null,
                    RKPId: null,
                    Debit: "true"
                }
            }
            vm.pembayaranList.push(defaultPembayaran);
        }

        vm.removePembayaran = function (pembayaran) {
            var ind = vm.pembayaranList.indexOf(pembayaran);
            vm.pembayaranList.splice(ind, 1);
        }

        //datepicker
        vm.today = function () {
            vm.selectedTask.TanggalMulai = new Date();
            vm.selectedTask.TanggalSelesai = new Date();
        };

        vm.clear = function () {
            vm.selectedTask.from = null;
            vm.selectedTask.to = null;
        };

        vm.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        vm.dateOptions = {
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

        vm.toggleMin = function () {
            vm.inlineOptions.minDate = vm.inlineOptions.minDate ? null : new Date();
            vm.dateOptions.minDate = vm.inlineOptions.minDate;
        };

        vm.toggleMin();

        vm.open1 = function () {
            vm.popup1.opened = true;
        };

        vm.open2 = function () {
            vm.popup2.opened = true;
        };

        vm.open3 = function () {
            vm.popup3.opened = true;
        };

        vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        vm.format = vm.formats[0];
        vm.altInputFormats = ['M!/d!/yyyy'];

        vm.popup1 = {
            opened: false
        };

        vm.popup2 = {
            opened: false
        };

        vm.popup3 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < vm.events.length; i++) {
                    var currentDay = new Date(vm.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return vm.events[i].status;
                    }
                }
            }

            return '';
        }

        var formatter = new Intl.NumberFormat();

        vm.formatCurrency = function (value) {
            return formatter.format(value);
        }
    }

})();

/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.realisasi')
        .controller('TimelinePageCtrl', TimelinePageCtrl);

    /** @ngInject */
    function TimelinePageCtrl($scope, $uibModal) {

        $scope.data = [
            {
                name: 'row1', tasks: [
                    { name: 'task1', from: new Date(2017, 1, 1, 1, 1, 1), to: new Date(2017, 1, 24, 2, 2, 2) },
                    { name: 'task2', from: new Date(2017, 2, 3, 3, 3, 3), to: new Date(2017, 2, 24, 4, 4, 4) }
                ]
            },
            {
                name: 'row2', tasks: [
                    { name: 'task3', from: new Date(2017, 2, 25, 1, 1, 1), to: new Date(2017, 3, 4, 1, 1, 1) }
                ]
            },
            {
                name: 'row3', tasks: [
                    { name: 'task5', from: new Date(2017, 2, 5, 1, 1, 1), to: new Date(2017, 2, 24, 1, 1, 1) },
                    { name: 'task6', from: new Date(2017, 3, 7, 1, 1, 1), to: new Date(2017, 3, 24, 1, 1, 1) }
                ]
            }
        ]

        $scope.open = function (page, size, gagasan) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: TimelineModalInstanceCtrl,
                controllerAs: 'vm'
            });

            modalInstance.result.then(function (data) {
            })
        };
    }

    angular.module('BlurAdmin.pages.realisasi')
        .controller('TimelineModalInstanceCtrl', TimelineModalInstanceCtrl);

    function TimelineModalInstanceCtrl($uibModalInstance) {
        var vm = this;


        vm.ok = function () {
            $uibModalInstance.close(result);
        }

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    }

})();

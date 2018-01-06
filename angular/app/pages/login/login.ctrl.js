(function () {
    'use strict';

    angular.module('BlurAdmin.pages.login')
        .controller('loginCtrl', loginCtrl);

    /** @ngInject */
    function loginCtrl($scope, User,  $state) {
        var vm = this;
        $scope.user = {}

        $scope.login = function() {
            User.login($scope.user, function(user){
                $state.go('dashboard');
            })
        }
    }

})();
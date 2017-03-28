/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penduduk')
    .controller('PendudukPageCtrl', PendudukPageCtrl);

  /** @ngInject */
  function PendudukPageCtrl($scope, fileReader, $filter, $uibModal, Desa, siDropbox, Media, $sce, Keluarga) {
    var vm = this;
    $scope.listKeluarga = [];
    $scope.smartTablePageSize = 10;

    function getKeluarga() {
        Keluarga.find({filter:{include:['AnggotaKeluarga','KepalaKeluarga']}}
            ,function(listKeluarga){
            $scope.listKeluarga = listKeluarga;
        })
    }

    getKeluarga();
  }

})();

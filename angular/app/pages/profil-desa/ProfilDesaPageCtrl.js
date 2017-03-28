/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.profildesa')
    .controller('ProfilDesaPageCtrl', ProfilDesaPageCtrl);

  /** @ngInject */
  function ProfilDesaPageCtrl($scope, fileReader, $filter, $uibModal, Desa) {
    $scope.desa;

    function getDesaDetail() {
      Desa.find(function(desaList){
        $scope.desa = desaList[0];
      })
    }

    getDesaDetail();

    $scope.picture = $filter('profilePicture')('bangli');

    $scope.removePicture = function () {
      $scope.picture = $filter('appImage')('theme/no-photo.png');
      $scope.noPicture = true;
    };

    $scope.uploadPicture = function () {
      var fileInput = document.getElementById('uploadFile');
      fileInput.click();

    };

    $scope.showModal = function (page) {
      $uibModal.open({
        animation: true,
        templateUrl: page
      }).result.then(function () {});
    };

    $scope.getFile = function () {
      fileReader.readAsDataUrl($scope.file, $scope)
        .then(function (result) {
          $scope.picture = result;
        });
    };

    $scope.save = function(desa) {
      if (desa.id) {
        Desa.prototype$updateAttributes({
          jalan: desa.jalan,
          desa: desa.desa,
          kecamatan: desa.kecamatan,
          kabupaten: desa.kabupaten,
          provinsi: desa.provinsi,
          kodepos: desa.kodepos
        }, function(res){
          $scope.showModal('app/pages/ui/modals/modalTemplates/successModal.html');
        })
      } else {
        Desa.create(desa, function(res){
          $scope.showModal('app/pages/ui/modals/modalTemplates/successModal.html');
        })
      }
    }
  }

})();

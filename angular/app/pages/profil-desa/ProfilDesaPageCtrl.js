/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.profildesa')
    .controller('ProfilDesaPageCtrl', ProfilDesaPageCtrl);

  /** @ngInject */
  function ProfilDesaPageCtrl($scope, fileReader, $filter, $uibModal, Desa, siDropbox, Media, $sce) {
    $scope.desa;
    $scope.picture = $filter('appImage')('theme/no-photo.png');

    function getDesaDetail() {
      Desa.find({ filter: { include: 'logo' } }, function (desaList) {
        $scope.desa = desaList[0];
        var logo = $scope.desa.logo;
        if (logo) {
          siDropbox.filesDownload(logo.path).then(function (pic) {
            $scope.picture = pic.fileBlob;
            var url = URL.createObjectURL(new Blob([pic.fileBlob], { type: 'application/octet-stream' }));
            $scope.picture = $sce.trustAsResourceUrl(url);
          }).catch(function (err) {
            console.log(err);
          })
        }

      })
    }

    getDesaDetail();

    // $scope.picture = $filter('profilePicture')('bangli');

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
      }).result.then(function () { });
    };

    $scope.getFile = function (file) {
      fileReader.readAsDataUrl(file, $scope)
        .then(function (result) {
          $scope.picture = result;
        });
        uploadFileToDropbox(file);
    };

    function uploadFileToDropbox(file) {
      siDropbox.filesUpload(file).then(function (res) {
        console.log("success");
        var logo = $scope.desa.logo;
        if (logo) {
          siDropbox.filesDelete(logo.path).then(function (success) {
            Media.prototype$updateAttributes({
              id: logo.id,
              name: file.name,
              path: '/' + file.name,
              DesaId: $scope.desa.id
            })
          }).catch(function (err) {
            console.log(err);
          })
        } else {
          Media.create({
            name: file.name,
            path: '/' + file.name,
            DesaId: $scope.desa.id
          })
        }

      }).catch(function (err) {
        console.log("error");
      })
    }

    $scope.save = function (desa) {
      if (desa.id) {
        Desa.prototype$updateAttributes({
          jalan: desa.jalan,
          desa: desa.desa,
          kecamatan: desa.kecamatan,
          kabupaten: desa.kabupaten,
          provinsi: desa.provinsi,
          kodepos: desa.kodepos,
          id: desa.id
        }, function (res) {
          $scope.showModal('app/pages/ui/modals/modalTemplates/successModal.html');
        })
      } else {
        Desa.create(desa, function (res) {
          $scope.showModal('app/pages/ui/modals/modalTemplates/successModal.html');
        })
      }
    }
  }

})();

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
        var geo = $scope.desa.geo;
        if (!geo) {
          geo = {
            lat: 0,
            lng:0
          }
        }
        initializeMap(geo);
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
        var logo = $scope.desa.logo;
        if (logo) {
          siDropbox.filesDelete(logo.path).then(function (success) {
            Media.prototype$updateAttributes({
              id: logo.id,
              name: file.name,
              path: '/' + file.name,
              DesaId: $scope.desa.id
            }, function(media){
              //TODO
            })
          }).catch(function (err) {
            console.log(err);
          })
        } else {
          Media.create({
            name: file.name,
            path: '/' + file.name,
            DesaId: $scope.desa.id
          }, function(media){
            //TODO
          })
        }

      }).catch(function (err) {
        console.log("error");
      })
    }

    function initializeMap(geo) {
      var mapCanvas = document.getElementById('google-maps');
      var mapOptions = {
        center: new google.maps.LatLng(geo.lat, geo.lng),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(mapCanvas, mapOptions);
      var marker = new google.maps.Marker({
          position: geo,
          map: map,
          title: $scope.desa.desa
        });
    }

    /*
    function initOpenStreetMap(geo) {
      L.Icon.Default.imagePath = 'assets/img/theme/vendor/leaflet/dist/images';
      var map = L.map(document.getElementById('leaflet-map')).setView([geo.lat, geo.lng], 13);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.marker([geo.lat, geo.lng]).addTo(map)
          .bindPopup($scope.desa.desa)
          .openPopup();
    }*/

    $scope.save = function (desa) {
      if (desa.id) {
        Desa.prototype$updateAttributes({
          jalan: desa.jalan,
          desa: desa.desa,
          kecamatan: desa.kecamatan,
          kabupaten: desa.kabupaten,
          provinsi: desa.provinsi,
          kodepos: desa.kodepos,
          geo: {
            lat: desa.geo.lat,
            lng: desa.geo.lng
          },
          id: desa.id
        }, function (res) {
          $scope.showModal('app/pages/ui/modals/modalTemplates/successModal.html');
          getDesaDetail();
        })
      } else {
        Desa.create(desa, function (res) {
          $scope.showModal('app/pages/ui/modals/modalTemplates/successModal.html');
          getDesaDetail();
        })
      }
    }
  }

})();

var mapService = angular.module('MapService', ['ServiceMod', 'ionic']);

mapService.factory('mapHelper', [
    '$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        var service = {};
        service.map = false;
        service.center = false;
        service.zoom = 11;
        service.marker = false;
        service.listener1 = false;
        service.listener2 = false;
        service.listener3 = false;
        service.script_loaded = false;
        service.position = {};
        service.getPosition = function () {
            return this.position;
        };
        service.destroy = function () {
            if (this.map) {
                google.maps.event.removeListener(this.listener1);
                google.maps.event.removeListener(this.listener2);
                google.maps.event.removeListener(this.listener3);
                this.marker.setMap(null);
                this.market = null;
                this.map = null;
            }
        };
        service.showMap = function (location, canvas_id) {
            if (!service.script_loaded) {
                loadScript();
            } else {
                $rootScope.$broadcast('map_init');
            }
            var context = this;
            console.log(location);
            $rootScope.$on('map_init', function () {
                console.log('map init recieved');
                service.script_loaded = true;
                var mapOptions = {
                    zoom: location.zoom,
                    center: new google.maps.LatLng(location.lat, location.lng)
                };
                $timeout(function () {
                    console.log(canvas_id);
                    console.log(document.getElementById(canvas_id));
                    context.map = new google.maps.Map(document.getElementById(canvas_id), mapOptions);
                    context.marker = new google.maps.Marker({
                        map: context.map,
                        draggable: true,
                        animation: google.maps.Animation.DROP,
                        position: new google.maps.LatLng(location.lat, location.lng)
                    });
                });
            });
        };
        service.initMap = function ($scope, canvas_id) {
            if (!service.script_loaded) {
                loadScript();
            } else {
                $rootScope.$broadcast('map_init');
            }
            $scope.done = false;

            var context = this;
            $rootScope.$on('map_init', function () {
                console.log('map init recieved');
                service.script_loaded = true;
                if (context.position.lat) {
                    context.center = new google.maps.LatLng(context.position.lat, context.position.lng);
                    context.zoom = context.position.zoom;
                } else {
                    context.center = new google.maps.LatLng(28.7040592, 77.1024902);


                    if (navigator.geolocation) {
                        browserSupportFlag = true;
                        navigator.geolocation.getCurrentPosition(function (position) {
                            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            context.map.panTo(initialLocation);
                            context.marker.setPosition(initialLocation);
                            context.position.zoom = context.map.getZoom();
                            context.position.lat = initialLocation.lat();
                            context.position.lng = initialLocation.lng();
                            $scope.done = true;
                            $scope.$apply();
                        }, function () {
                        });
                    }
                    // Browser doesn't support Geolocation
                    else {

                    }


                }
                var mapOptions = {
                    zoom: context.zoom,
                    center: context.center
                };
                console.log(canvas_id);
                console.log(document.getElementById(canvas_id));    
                context.map = new google.maps.Map(document.getElementById(canvas_id), mapOptions);

                context.marker = new google.maps.Marker({
                    map: context.map,
                    draggable: true,
                    animation: google.maps.Animation.DROP,
                    position: context.center
                });
                service.listener1 = google.maps.event.addListener(context.marker, 'click', function () {
                    if (context.marker.getAnimation() !== null) {
                        context.marker.setAnimation(null);
                    } else {
                        context.marker.setAnimation(google.maps.Animation.BOUNCE);
                    }
                });
//
                service.listener2 = google.maps.event.addListener(context.map, 'click', function (event) {
                    context.marker.setPosition(event.latLng);
                    context.position.zoom = context.map.getZoom();
                    context.position.lat = event.latLng.lat();
                    context.position.lng = event.latLng.lng();
                    $scope.done = true;
                    $scope.$apply();
                });
                service.listener3 = google.maps.event.addListener(context.marker, 'dragend', function (event) {
                    context.marker.setPosition(event.latLng);
                    context.position.zoom = context.map.getZoom();
                    context.position.lat = event.latLng.lat();
                    context.position.lng = event.latLng.lng();
                    $scope.done = true;
                    $scope.$apply();
                });
            });
        };
        return service;
    }]);

function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';



    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyBs5KzFvREmBYJ0dIvLyQTodZP0_WpUCQw&' +
            'callback=initializeMap';

    document.body.appendChild(script);
}
function initializeMap() {
    var elem = angular.element(document.querySelector('[ng-app]'));
    var injector = elem.injector();
    var $rootScope = injector.get('$rootScope');
    $rootScope.$broadcast('map_init');
}

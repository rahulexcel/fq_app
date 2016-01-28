var serviceMod = angular.module('ServiceMod', ['ngStorage', 'ionic', 'UrlService']);

serviceMod.factory('pinchServie', ['$window', '$timeout',
    function ($window, $timeout) {
        var service = {
            bodyElem: false,
            headElem: false,
            animElem: false,
            animCenter: false,
            is_showing: false,
            active_class: false,
            active_pin: false,
            f_c_elem: false,
            s_c_elem: false,
            t_c_elem: false,
            ft_c_elem: false,
            backdrop: false,
            radius: 20,
            pinchCount: 4,
            positions: {},
            init: function (pinchCount) {
                this.pinchCount = pinchCount;
                if (!this.bodyElem) {
                    this.backdrop = angular.element(document.querySelector('.backdrop'));
                    this.animElem = angular.element(document.querySelector('#anim'));
                    this.headElem = angular.element(document.querySelector('head'));
                    this.bodyElem = angular.element(document.querySelector('body'));
                    this.animCenter = angular.element(document.querySelector('.anim_center'));
                    this.f_c_elem = angular.element(document.querySelector('.f_c'))
                    this.s_c_elem = angular.element(document.querySelector('.s_c'))
                    this.t_c_elem = angular.element(document.querySelector('.t_c'))
                    this.ft_c_elem = angular.element(document.querySelector('.ft_c'))
                    this.is_showing = false;
                    this.active_class = false;
                    this.active_pin = false;
                    this.positions = {};
                    this.startTransform();
                    this.classTransform(-1000, -1000, this.animElem);
                }
            },
            destroy: function () {
                this.is_showing = false;
            },
            startTransform: function () {
                this.addTransform(0, 0, 0, 0, 0, 0, 0, 0, 0);
            },
            removeTemp: function () {
                var tempElem = document.getElementById('temp');
                tempElem = angular.element(tempElem);
                tempElem.remove();
            },
            hide: function (event) {
                console.log('hide');
                this.removeTemp();
                this.startTransform();
                this.classTransform(-1000, -1000, this.animElem);
//                console.log('release');
                this.backdrop.removeClass('visible active');
                this.is_showing = false;
                return this.active_class;
            },
            classTransform: function (x, y, ele) {
                var css = '';
                var pfx = ["-webkit-", "-moz-", "-MS-", "-o-", ""];
                for (var i = 0; i < pfx.length; i++) {
                    var pf = pfx[i];
                    css += pf + 'transform: translate3d(' + x + 'px,' + y + 'px,0);';
                }
                ele.attr('style', "display:block;" + css);
            },
            addTransform: function (f_x, f_y, s_x, s_y, t_x, t_y, ft_x, ft_y, anim) {
                if (typeof anim === "undefined") {
                    anim = true;
                }
                this.removeTemp();
                var pfx = ["-webkit-", "-moz-", "-MS-", "-o-", ""];
                var html = '<style id="temp">';
                var style1 = '';
                var style2 = '';
                var style3 = '';
                var style4 = '';
                for (var i = 0; i < pfx.length; i++) {
                    var pf = pfx[i];
                    style1 += pf + 'transform:translate3d(' + (f_x) + 'px, ' + (f_y) + 'px, 0);';
                    style2 += pf + 'transform:translate3d(' + (s_x) + 'px, ' + (s_y) + 'px, 0);';
                    style3 += pf + 'transform:translate3d(' + (t_x) + 'px, ' + (t_y) + 'px, 0);';
                    style4 += pf + 'transform:translate3d(' + (ft_x) + 'px, ' + (ft_y) + 'px, 0);';
                    if (anim) {
                        style1 += pf + 'transition:all .3s ease-out;';
                        style2 += pf + 'transition:all .3s ease-out;';
                        style3 += pf + 'transition:all .3s ease-out;';
                        style4 += pf + 'transition:all .3s ease-out;';
                    }
                }
                html += '#anim .f_c{' + style1 + '}';
                html += '#anim .s_c{' + style2 + '}';
                html += '#anim .t_c{' + style3 + '}';
                html += '#anim .ft_c{' + style4 + '}';
                html += '</style>';
                this.headElem.append(html);
            },
            checkIsPin: function (event) {
                var target = angular.element(event.gesture.target);
                var max_depth = 10;
                var found = false;
                var i = 0;
                while (i < max_depth) {

                    if (target.hasClass('pinch_ele')) {
                        this.active_pin = target.attr('id');
//                        console.log(this.active_pin + 'active pin');
                        found = true;
                        break;
                    }
                    target = target.parent();
                    i++;
                }
                return found;
            },
            distance: function (center, point) {
                return Math.sqrt(Math.pow(center.x - point.x, 2) + Math.pow(center.y - point.y, 2));
            },
            inCircle: function (center, radius, point) {
                var dist = this.distance(center, point);
//                console.log(dist);
                if (dist < radius) {
                    return true;
                } else {
                    return false;
                }
            },
            caneDrag: function () {
                return this.is_showing;
            },
            handleDrag: function (event) {
                if (this.is_showing) {

//                    console.log('handling drag');
//                    var target = angular.element(event.gesture.target);

                    var x = event.gesture.center.pageX;
                    var y = event.gesture.center.pageY;
                    var positions = this.positions;
                    var radius = this.radius;
                    var f_c = positions.first;
                    var s_c = positions.second;
                    var t_c = positions.third;
                    var ft_c = positions.fourth;
//                    var imageRect = $ionicPosition.offset(this.bodyElem);
//                    console.log(imageRect);

//                    console.log('org pos');
//                    console.log({x: x, y: y});
//                    angular.element(document.querySelector('#dot')).attr('style', 'top:' + y + 'px;left:' + x + 'px')
                    y = y * 1;
                    x = x * 1;


                    var found_f = false;
                    var found_s = false;
                    var found_t = false;
                    var found_ft = false;

//                    console.log('pos');
//                    console.log({x: x, y: y});

//                    console.log('center');
//                    console.log(center);

//                    console.log('first');
//                    console.log(f_c);
//
//                    console.log('second');
//                    console.log(s_c);
//
//                    console.log('third');
//                    console.log(t_c);
//                    angular.element(document.querySelector('#dot')).attr('style', 'top:' + (center.y * 1) + 'px;left:' + (center.x * 1) + 'px')
//                    angular.element(document.querySelector('#dot1')).attr('style', 'top:' + (f_c.y * 1) + 'px;left:' + (f_c.x * 1) + 'px')
//                    angular.element(document.querySelector('#dot2')).attr('style', 'top:' + (s_c.y * 1) + 'px;left:' + (s_c.x * 1) + 'px')
//                    angular.element(document.querySelector('#dot3')).attr('style', 'top:' + (t_c.y * 1) + 'px;left:' + (t_c.x) + 'px')
//                    angular.element(document.querySelector('#dot4')).attr('style', 'top:' + (ft_c.y * 1) + 'px;left:' + (ft_c.x * 1) + 'px')

                    if (this.inCircle({x: x, y: y}, radius, f_c)) {
                        found_f = true;
                    }
                    if (this.inCircle({x: x, y: y}, radius, s_c)) {
                        found_s = true;
                    }
                    if (this.inCircle({x: x, y: y}, radius, t_c)) {
                        found_t = true;
                    }
                    if (this.inCircle({x: x, y: y}, radius, ft_c)) {
                        found_ft = true;
                    }
                    if (found_f) {
                        if (this.active_class !== 'f') {
                            this.f_c_elem.toggleClass('active_circle');
                            this.active_class = 'f';
                        }
                    } else {
                        if (this.active_class === 'f') {
                            this.f_c_elem.toggleClass('active_circle');
                            this.active_class = '';
                        }
                    }
                    if (found_s) {
                        if (this.active_class !== 's') {
                            this.s_c_elem.toggleClass('active_circle');
                            this.active_class = 's';
                        }
                    } else {
                        if (this.active_class === 's') {
                            this.s_c_elem.toggleClass('active_circle');
                            this.active_class = '';
                        }
                    }
                    if (found_t) {
                        if (this.active_class !== 't') {
                            this.t_c_elem.toggleClass('active_circle');
                            this.active_class = 't';
                        }
                    } else {
                        if (this.active_class === 't') {
                            this.t_c_elem.toggleClass('active_circle');
                            this.active_class = '';
                        }
                    }
                    if (found_ft) {
                        if (this.active_class !== 'ft') {
                            this.ft_c_elem.toggleClass('active_circle');
                            this.active_class = 'ft';
                        }
                    } else {
                        if (this.active_class === 'ft') {
                            this.ft_c_elem.toggleClass('active_circle');
                            this.active_class = '';
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            },
            show: function (event) {
                console.log('hold');
                if (!this.checkIsPin(event)) {
                    console.log('is not pin');
                    return false;
                }

                this.positions = {};
                this.f_c_elem.removeClass('active_circle');
                this.s_c_elem.removeClass('active_circle');
                this.t_c_elem.removeClass('active_circle');
                this.ft_c_elem.removeClass('active_circle');
                this.active_class = false;
                this.is_showing = true;
                var x = event.gesture.center.pageX;
                var y = event.gesture.center.pageY;
                this.classTransform(0, 0, this.animElem); //radius of small circle
                this.classTransform(x - 10, y - 10, this.animCenter); //radius of small circle
                this.addTransform(x - 10, y - 10, x - 10, y - 10, x - 10, y - 10, x - 10, y - 10, false);
                var length = 75;
                var window_width = $window.innerWidth;
                var window_height = $window.innerHeight;
                var right = true;
                if (y > window_height / 2) {
                    //down = false;
                    //let it be top always like pintrest
                }
                if (x > window_width / 2) {
                    right = false;
                }

//equation for circle
// x = cx + r * cos(a)
//y = cy + r * sin(a)
//the cordiates of this circle are inverted
                console.log('pinch count' + this.pinchCount);
                if (this.pinchCount * 1 === 3) {
                    this.s_c_elem.addClass('circle_hide');
                    if (right) {
                        var f_c_coord = {
                            x: x + Math.round(Math.cos(Math.PI * 60 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 60 / 180) * length, 2) * -1
                        };
                        var s_c_coord = {
                            x: -1000,
                            y: -1000
                        };
                        var t_c_coord = {
                            x: x + length,
                            y: y
                        };
                        var ft_c_coord = {
                            x: x + Math.round(Math.cos(Math.PI * 60 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 60 / 180) * length, 2)
                        };
                    } else {
                        var f_c_coord = {
                            x: x - Math.round(Math.cos(Math.PI * 60 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 60 / 180) * length, 2) * -1
                        };
                        var s_c_coord = {
                            x: -1000,
                            y: -1000
                        };
                        var t_c_coord = {
                            x: x - length,
                            y: y
                        };
                        var ft_c_coord = {
                            x: x - Math.round(Math.cos(Math.PI * 60 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 60 / 180) * length, 2)
                        };
                    }

                } else {
                    this.s_c_elem.removeClass('circle_hide');
                    if (right) {
                        var f_c_coord = {
                            x: x + Math.round(Math.cos(Math.PI * 90 * 3 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 90 * 3 / 180) * length, 2)
                        };
                        var s_c_coord = {
                            x: x + Math.round(Math.cos(Math.PI * 30 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 30 / 180) * length, 2) * -1
                        };
                        var t_c_coord = {
                            x: x + Math.round(Math.cos(Math.PI * 30 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 30 / 180) * length, 2)
                        };
                        var ft_c_coord = {
                            x: x + Math.round(Math.cos(Math.PI * 90 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 90 / 180) * length, 2)
                        };
                    } else {
                        var f_c_coord = {
                            x: x - Math.round(Math.cos(Math.PI * 90 * 3 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 90 * 3 / 180) * length, 2)
                        };
                        var s_c_coord = {
                            x: x - Math.round(Math.cos(Math.PI * 30 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 30 / 180) * length, 2) * -1
                        };
                        var t_c_coord = {
                            x: x - Math.round(Math.cos(Math.PI * 30 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 30 / 180) * length, 2)
                        };
                        var ft_c_coord = {
                            x: x - Math.round(Math.cos(Math.PI * 90 / 180) * length, 2),
                            y: y + Math.round(Math.sin(Math.PI * 90 / 180) * length, 2)
                        };
                    }
                }
//                console.log(f_c_coord);
//                console.log(s_c_coord);
//                console.log(t_c_coord);
//                console.log(ft_c_coord);
//                console.log(this.distance({
//                    x: x,
//                    y: y
//                }, f_c_coord));
//
//                console.log(this.distance({
//                    x: x,
//                    y: y
//                }, s_c_coord));
//
//                console.log(this.distance({
//                    x: x,
//                    y: y
//                }, t_c_coord));
//                console.log(this.distance({
//                    x: x,
//                    y: y
//                }, ft_c_coord));
                this.positions = {
                    center: {
                        x: x,
                        y: y
                    },
                    first: f_c_coord,
                    second: s_c_coord,
                    third: t_c_coord,
                    fourth: ft_c_coord
                };

                var f_c_coord1 = this.adjustCord(f_c_coord);
                var s_c_coord1 = this.adjustCord(s_c_coord);
                var t_c_coord1 = this.adjustCord(t_c_coord);
                var ft_c_coord1 = this.adjustCord(ft_c_coord);
                //adjust to show elements in center

//                if (!down) {
//                    f_c_coord.y = f_c_coord.y * -1 + this.radius;
//                    s_c_coord.y = s_c_coord.y * -1;
//                    t_c_coord.y = t_c_coord.y * -1;
//                    ft_c_coord.y = ft_c_coord.y * -1 + this.radius;
//                } else {
//                    f_c_coord.y = f_c_coord.y - this.radius;
////                    s_c_coord.y = s_c_coord.y;
//                    t_c_coord.y = t_c_coord.y - this.radius;
//                    ft_c_coord.y = ft_c_coord.y - this.radius;
//                }
                var self = this;
                $timeout(function () {
                    self.addTransform(f_c_coord1.x, f_c_coord1.y, s_c_coord1.x, s_c_coord1.y, t_c_coord1.x, t_c_coord1.y, ft_c_coord1.x, ft_c_coord1.y);
                });

//                $ionicBackdrop.retain();
                this.backdrop.addClass('visible active');
                return true;
            },
            adjustCord: function (point) {
                var new_point = {};
                if (point.x >= 0) {
                    new_point.x = point.x - this.radius;
                } else {
                    new_point.x = point.x + this.radius;
                }
                if (point.y >= 0) {
                    new_point.y = point.y - this.radius;
                } else {
                    new_point.y = point.y + this.radius;
                }
                return new_point;
            }
        };
        return service;
    }
]);

serviceMod.directive('pinch', ['pinchServie', '$ionicGesture', '$timeout', '$ionicScrollDelegate',
    function (pinchServie, $ionicGesture, $timeout, $ionicScrollDelegate) {
        return {
            link: {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                },
                post: function postLink(scope, iElement, iAttrs, controller) {
                    console.log('pinch directive called');
                    var relase_gesture = false;
                    var drag_gesture = false;
                    var hold_gesture = false;
                    var pinchCount = 4;
                    var pinchShowing = false;
                    if (iAttrs.pinchCount) {
                        pinchCount = iAttrs.pinchCount;
                    }
                    pinchServie.init(pinchCount);
//                    console.log('init');

                    scope.$on('$destroy', function () {
                        pinchServie.destroy();
                        pinchShowing = false;
                        $ionicGesture.off(relase_gesture, 'release');
                        $ionicGesture.off(drag_gesture, 'drag');
                        $ionicGesture.off(hold_gesture, 'hold');
                    });
                    var wait_for_anim = false;
                    relase_gesture = $ionicGesture.on('release', function (e) {
                        if (pinchShowing) {
                            pinchShowing = false;
                            var ret = pinchServie.hide(e);
                            if (ret === 'f') {
                                scope.$broadcast('first');
                                scope.$emit('first'); // in category page, cos of ion content
                            } else if (ret === 's') {
                                scope.$broadcast('second');
                                scope.$emit('second');
                            } else if (ret === 't') {
                                scope.$broadcast('third');
                                scope.$emit('third');
                            } else if (ret === 'ft') {
                                scope.$broadcast('fourth');
                                scope.$emit('fourth');
                            }
                            $ionicScrollDelegate.freezeAllScrolls(false);
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }, angular.element(iElement));
                    drag_gesture = $ionicGesture.on('drag', function (e) {
                        if (!wait_for_anim) {
                            if (pinchServie.caneDrag(e)) {
                                pinchServie.handleDrag(e);
                                e.preventDefault();
                                e.stopPropagation();
                            } else {
                            }
                        }
                    }, angular.element(iElement));
                    hold_gesture = $ionicGesture.on('hold', function (e) {
                        if (pinchServie.show(e)) {
                            pinchShowing = true;
                            $ionicScrollDelegate.freezeAllScrolls(true);
                            wait_for_anim = true;
                            $timeout(function () {
                                wait_for_anim = false;
                            }, 100);
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }, angular.element(iElement));
                }
            }
        };
    }
]);

serviceMod.directive('materialadd', ['$ionicGesture', '$ionicPlatform', '$rootScope', '$timeout', '$state',
    function ($ionicGesture, $ionicPlatform, $rootScope, $timeout, $state) {
        return {
            link: {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                    var html = '<div id="add_tap" class="hide-on-keyboard-open fab">';
                    html += "<div id='tap_main' class='fab_icon'>";
                    html += '<i class="ion-android-add"></i>';
                    html += "</div>";
                    html += '<ul style="position: relative">';
                    html += '<li id="tap_first" class="fab_first">';
                    html += "<div class='anim_text'>Camera</div>";
                    html += '<div class="fab_small"><i class="ion-ios-camera"></i></div>';
                    html += '</li>';
                    html += '<li id="tap_second" class="fab_second">';
                    html += "<div class='anim_text'>Gallery</div>";
                    html += '<div class="fab_small"><i class="ion-images"></i></div>';
                    html += '</li>';
//                    html += '<li id="tap_third" class="fab_third">';
//                    html += "<div class='anim_text'>Web Link</div>";
//                    html += '<div class="fab_small"><i class="ion-link"></i></div>';
//                    html += '</li>';
//                    html += '<li id="tap_fourth" class="fab_fourth">';
//                    html += "<div class='anim_text'>NearBy</div>";
//                    html += '<div class="fab_small"><i class="ion-location"></i></div>';
//                    html += '</li>';
                    html += '</ul>';
                    html += '</div>';
                    iElement.html(html);
                },
                post: function postLink(scope, iElement, iAttrs, controller) {
                    if (!ionic.Platform.isAndroid()) {
                        //return;
                    }

                    var ele = angular.element(document.getElementById('add_tap'));
                    var backdrop = angular.element(document.querySelector('.backdrop'));
                    var back_button = false;

//                    ele.removeClass('fab_rotate');

                    $rootScope.$on('$ionicView.beforeEnter', function () {
                        console.log($state.current.name);
                        if ($state.current.name.indexOf('app.home') !== -1) {
                            ele.addClass('fab_pink');
                        } else {
                            ele.removeClass('fab_pink');
                        }
                    });
                    if ($state.current.name.indexOf('app.home') !== -1) {
                        ele.addClass('fab_pink');
                    } else {
                        ele.removeClass('fab_pink');
                    }
                    $rootScope.$on('$ionicView.afterEnter', function () {
                        $timeout(function () {
                            var eles = document.querySelectorAll('.bar-footer');
                            var is_footer_showing = false;
                            for (var i = 0; i < eles.length; i++) {
                                var el = eles[i];
                                if (el.offsetParent === null) {
                                    //hidden element http://stackoverflow.com/a/21696585/2304347
                                } else {
                                    is_footer_showing = true;
                                }
                            }
                            if (is_footer_showing) {
                                ele.attr('style', 'right:20px;bottom:50px');
                            } else {
                                ele.attr('style', 'right:20px;bottom:20px');
                            }
                        }, 1000);
                    });

                    $rootScope.$on('hide_android_add', function () {
                        ele.addClass('fab_hide');
                    });
                    $rootScope.$on('show_android_add', function () {
                        ele.removeClass('fab_hide');
                    });

                    $ionicGesture.on('tap', function (e) {
                        if (ele.hasClass('fab_rotate')) {
                            back_button();
                        } else {
                            back_button = $ionicPlatform.registerBackButtonAction(function (e) {
                                ele.toggleClass('fab_rotate')
                                backdrop.toggleClass('active visible');
                                e.preventDefault();
                                return false;
                            }, 9999);
                        }
                        ele.toggleClass('fab_rotate')
                        backdrop.toggleClass('active visible');
                        e.preventDefault();
                        e.stopPropagation();
                    }, angular.element(document.getElementById('tap_main')));
                    $ionicGesture.on('tap', function (e) {
                        ele.toggleClass('fab_rotate')
                        backdrop.toggleClass('active visible');
                        back_button();
                        scope.$broadcast('tap_first');
                        e.preventDefault();
                        e.stopPropagation();
                    }, angular.element(document.getElementById('tap_first')));
                    $ionicGesture.on('tap', function (e) {
                        ele.toggleClass('fab_rotate')
                        backdrop.toggleClass('active visible');
                        back_button();
                        scope.$broadcast('tap_second');
                        e.preventDefault();
                        e.stopPropagation();
                    }, angular.element(document.getElementById('tap_second')));
//                    $ionicGesture.on('tap', function (e) {
//                        ele.toggleClass('fab_rotate')
//                        backdrop.toggleClass('active visible');
//                        back_button();
//                        scope.$broadcast('tap_third');
//                        e.preventDefault();
//                        e.stopPropagation();
//                    }, angular.element(document.getElementById('tap_third')));
//                    $ionicGesture.on('tap', function (e) {
//                        ele.toggleClass('fab_rotate')
//                        backdrop.toggleClass('active visible');
//                        back_button();
//                        scope.$broadcast('tap_fourth');
//                        e.preventDefault();
//                        e.stopPropagation();
//                    }, angular.element(document.getElementById('tap_fourth')));
                }
            }
        };
    }]);
serviceMod.directive('imgLoader', function () {
    // in many cases image height was more than image width
    // in such cases, it was showing image half cut because it was reszing only by width and not by height
    // so in such need to resize by height than width
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('load', function (e) {
                var naturalWidth = this.naturalWidth * 1;
                var naturalHeight = this.naturalHeight * 1;
//                console.log(naturalWidth + "XXX" + naturalHeight + " src" + this.src);
                if (naturalHeight > naturalWidth) {
                    angular.element(element).attr('style', 'max-height:100%;width:auto');
                }
                if (attrs.id)
                    scope.$emit('image_loaded_' + attrs.id);
            });
        }
    };
});
serviceMod.directive("userBox", ['toast', 'friendHelper', '$localStorage', 'urlHelper',
    function (toast, friendHelper, $localStorage, urlHelper) {
        var obj = {
            scope: {user: '=', me: '=', index: '@', users: '='},
            templateUrl: 'template/directive/user.html',
            controller: function ($scope) {
                $scope.profile = function () {
                    urlHelper.openProfilePage($scope.user._id, 'mine');
                };
                $scope.unFriend = function () {
                    var friend_user_id = $scope.user._id;
                    var ajax = friendHelper.unFriend($localStorage.user.id, friend_user_id);
                    ajax.then(function () {
                        $scope.is_friend = 2;
//                        $scope.$broadcast('unfriend');

                        if ($scope.index) {
                            var users = $scope.users;
                            users.slice($scope.index, 1);
                            $scope.users = users;
                        }
                        toast.showShortBottom('Friend Removed, Pull Down To Refresh');
                    }, function () {
                        $scope.is_friend = 2;
                    });
                };
                $scope.unFollowUser = function () {
                    var user_id = $scope.user._id;
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = friendHelper.user_follow(user_id, 'remove');
                    ajax.then(function (follow_user) {
                        if ($scope.index) {
                            var users = $scope.users;
                            users.splice($scope.index, 1);
                            $scope.users = users;
                        }
                        toast.showShortBottom('You Stopped Following ' + follow_user.name);
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
                $scope.followUser = function () {
                    var user_id = $scope.user._id;
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = friendHelper.user_follow(user_id);
                    ajax.then(function (follow_user) {
//                        if (angular.isDefined($scope.index)) {
//                            var users = $scope.users;
//                            users.splice($scope.index, 1);
//                            $scope.users = users;
//                        }
                        toast.showShortBottom('You Are Now Following ' + follow_user.name);
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
            },
            link: {
                pre: function ($scope) {

                }
            }
        };
        return obj;
    }]);
serviceMod.directive("listBox",
        ['wishlistHelper', 'urlHelper', 'toast', 'friendHelper',
            function (wishlistHelper, urlHelper, toast, friendHelper) {
                var obj = {
                    scope: {list: '=', me: '=', index: '@', lists: '='},
                    templateUrl: 'template/directive/list.html',
                    link: {
                        pre: function ($scope) {
                            if ($scope.list.user_id.picture) {

                            } else {
                                if (!$scope.list.list_symbol) {
                                    var name = $scope.list.name;
                                    var char = name.substring(0, 1);
                                    var color = wishlistHelper.getRandomColor();
                                    $scope.list.list_symbol = char;
                                    $scope.list.bg_color = color;
                                }
                            }
                        }
                    },
                    controller: function ($scope) {
                        $scope.viewList = function () {
                            var list = $scope.list;
                            urlHelper.openWishlistPage(list._id, list.name);
                        };
                        $scope.editList = function () {
                            var list = $scope.list;
                            if ($scope.me) {
//                                dataShare.broadcastData(list, 'edit_list');
                                urlHelper.openWishlistEditPage(list._id);
                            } else {
                                toast.showShortBottom('You Cannot Edit This List');
                            }
                        };
                        $scope.unFollowList = function () {
                            var list_id = $scope.list._id;
                            if ($scope.request_process) {
                                toast.showProgress();
                                return;
                            }
                            $scope.request_process = true;
                            var ajax = friendHelper.list_follow(list_id, 'remove');
                            ajax.then(function (data) {
                                var lists = $scope.lists;
                                if ($scope.index)
                                    lists.splice($scope.index, 1);
                                $scope.lists = lists;
                                $scope.request_process = false;
                                toast.showShortBottom('You Have Stopped Following ' + data.name);
                            }, function () {
                                $scope.request_process = false;
                            });
                        };
                        $scope.followList = function () {
                            if (window.analytics) {
                                window.analytics.trackEvent('Follow List', 'Profile Page', urlHelper.getPath());
                            }
                            var list_id = $scope.list._id;
                            if ($scope.request_process) {
                                toast.showProgress();
                                return;
                            }
                            $scope.request_process = true;
                            var ajax = friendHelper.list_follow(list_id);
                            ajax.then(function (data) {
                                var lists = $scope.lists;
                                if ($scope.index)
                                    lists.splice($scope.index, 1);
                                $scope.lists = lists;
                                $scope.request_process = false;
                                toast.showShortBottom('You Are Now Following ' + data.name);
                            }, function () {
                                $scope.request_process = false;
                            });
                        };
                    }

                };
                return obj;
            }]);
serviceMod.filter('prettyDate', function () {
    return function (date) {
        return prettyDate(date);
    };
});
serviceMod.filter('picture', ['ajaxRequest', 'CDN', function (ajaxRequest, CDN) {
        return function (picture, width, height) {
            if (!angular.isDefined(picture) || picture === null || picture == "null") {
                return "img/empty.png";
            }
            if (picture === 'fashioniq') {
                return 'img/icon.png';
            }
            if (picture.length === 0) {
                return "img/empty.png";
            }
            if (picture.indexOf('empty.png') !== -1) {
                return picture;
            }
            if (!angular.isDefined(width)) {
                return picture;
            }
            //if (picture.length <= 32) {
            if (picture.indexOf('http') === -1) {
                //mongodb id
                picture = ajaxRequest.url('v1/picture/view/' + picture);
            }

            if (picture.indexOf('facebook') !== -1) {
                if (picture.indexOf('width=') !== -1) {
                    picture = picture.substring(0, picture.lastIndexOf('?width=') + "?width=".length);
                    picture = picture + width;
                } else {
                    picture = picture.substring(0, picture.lastIndexOf('?'));
                    picture = picture + "?width=" + width;
                }
                if (height) {
                    picture = picture + "&height=" + height;
                }
            } else if (picture.indexOf('picture/view') !== -1) {
                if (picture.indexOf('width=') !== -1) {
                    picture = picture.substring(0, picture.indexOf('?width='));
                }
                picture = picture + "?width=" + width;
                if (height) {
                    picture = picture + "&height=" + height;
                }
                picture = CDN.cdnize(picture);
            } else {

            }
            return picture;
        };
    }]);
serviceMod.factory('CDN', ['ajaxRequest', function (ajaxRequest) {
        var service = {};
        service.cdnize = function (url) {
            var cdn = 'http://dyc4yp9si5syy.cloudfront.net/';
            var server = ajaxRequest.url('');
//            console.log('url ' + url);
//            console.log('server ' + server);
//            console.log('cdn ' + cdn);
            if (url.indexOf(server) === -1) {
                url = ajaxRequest.url('v1/picture/view/' + url);
            }
            url = url.replace(server, cdn);
//            console.log('final ' + url);
            return url;
        };
        return service;
    }]);
serviceMod.factory('socialJs', function () {
    var service = {};
    service.social_js = false;
    service.addSocialJs = function () {
        if (this.social_js) {
            return;
        }
        this.social_js = true;
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
                return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&appId=765213543516434&version=v2.0";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        window.twttr = (function (d, s, id) {
            var t, js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            return window.twttr || (t = {_e: [], ready: function (f) {
                    t._e.push(f);
                }});
        }(document, "script", "twitter-wjs"));
    };
    return service;
});
serviceMod.factory('timeStorage', ['$localStorage', function ($localStorage) {
        var timeStorage = {};
        timeStorage.cleanUp = function () {
            var cur_time = new Date().getTime();
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.indexOf('_expire') === -1) {
                    var new_key = key + "_expire";
                    var value = localStorage.getItem(new_key);
                    if (value && cur_time > value) {
                        localStorage.removeItem(key);
                        localStorage.removeItem(new_key);
                    }
                }
            }
        };
        timeStorage.remove = function (key) {
            this.cleanUp();
            var time_key = key + '_expire';
            $localStorage[key] = false;
            $localStorage[time_key] = false;
        };
        timeStorage.set = function (key, data, hours) {
            this.cleanUp();
            $localStorage[key] = data;
            var time_key = key + '_expire';
            var time = new Date().getTime();
            time = time + (hours * 1 * 60 * 60 * 1000);
            $localStorage[time_key] = time;
        };
        timeStorage.get = function (key) {
            this.cleanUp();
            var time_key = key + "_expire";
            if (!$localStorage[time_key]) {
                return false;
            }
            var expire = $localStorage[time_key] * 1;
            if (new Date().getTime() > expire) {
                $localStorage[key] = null;
                $localStorage[time_key] = null;
                return false;
            }
            return $localStorage[key];
        };
        return timeStorage;
    }]);
serviceMod.factory('dataShare', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        var shareService = {};
        shareService.data = false;
        shareService.broadcastData = function (data, event, fast) {
            this.data = data;
            if (fast) {
                $rootScope.$broadcast(event);
            } else {
                $timeout(function () {
                    $rootScope.$broadcast(event);
                }, 500);
            }
        };
        shareService.getData = function () {
            var data = shareService.data;
            return data;
        };
        return shareService;
    }
]);
serviceMod.factory('toast', ['$ionicPopup', function ($ionicPopup) {
        return {
            showShortBottom: function (message) {
                if (window.plugins && window.plugins.toast) {
                    window.plugins.toast.showShortBottom(message, function (a) {
                    }, function (b) {
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: message
                    }, function () {

                    }, function () {

                    });
                }
            },
            showProgress: function () {
                this.showShortBottom('Please Wait...');
            }
        };
    }
]);
serviceMod.factory('ajaxRequest',
        ['$http', '$q', '$log', 'toast', '$localStorage', '$ionicLoading', '$cordovaNetwork', '$rootScope', '$ionicPlatform', '$ionicBackdrop',
            function ($http, $q, $log, toast, $localStorage, $ionicLoading, $cordovaNetwork, $rootScope, $ionicPlatform, $ionicBackdrop) {
                return {
                    deviceStatus: 1,
                    hasInit: false,
                    init: function () {
                        var self = this;
                        self.hasInit = true;
                        $ionicPlatform.on('pause', function () {
                            self.deviceStatus = 0;
                        });
                        $ionicPlatform.on('resume', function () {
                            self.deviceStatus = 1;
                        });
                    },
                    url: function (api) {
                        return 'http://144.76.83.246:5000/' + api;
                    },
                    send: function (api, data, method) {
                        var self = this;
                        if (!self.hasInit) {
                            self.init();
                        }
                        var silent = false;
                        if (!angular.isDefined(method)) {
                            method = 'POST';
                        } else {
                            if (method === true) {
                                silent = true;
                                method = 'POST';
                            }
                        }
                        if (method === 'POST' && $localStorage.user) {
                            var api_key = $localStorage.user.api_key;
                            if (angular.isDefined(api_key) && api_key.length > 0) {
                                var timestamp = new Date().getTime();
                                var api_secret = $localStorage.user.api_secret;
                                data.timestamp = timestamp;
                                var hash = CryptoJS.HmacSHA1(JSON.stringify(data), api_secret);
                                hash = hash.toString(CryptoJS.enc.Hex);
                                var new_data = {
                                    digest: hash,
                                    data: data,
                                    api_key: api_key
                                };
                                data = new_data;
                            }

                        }
//                        console.log('data to send');
//                        console.log(data);
                        var def = $q.defer();
//                        delete $http.defaults.headers.common['X-Requested-With'];
                        if (!silent)
                            $rootScope.ajax_on = true;
                        var http = $http({
                            url: this.url(api),
                            method: method,
                            headers: {'Content-Type': 'application/json;charset=utf-8'},
                            cache: false,
                            data: JSON.stringify(data),
                            timeout: 60000
                        });
                        http.success(function (data) {
                            $rootScope.ajax_on = false;
                            if (data.error === 0) {
                                if (data.data) {
                                    def.resolve(data.data);
                                } else {
                                    def.resolve();
                                }
                            } else {
                                $ionicLoading.hide();
                                $ionicBackdrop.release();
                                if (data.error === 2) {
                                    $log.log('Ajax Mongo Error ' + data.message);
                                    data.message = 'Unknown! Try Again Later';
                                }
                                if (self.deviceStatus === 1)
                                    toast.showShortBottom(data.message);
                                $log.warn(data.message);
                                def.reject(data.message);
                            }
                        });
                        http.error(function () {
                            $rootScope.ajax_on = false;
                            $log.warn('500 Error');
                            $ionicLoading.hide();
                            $ionicBackdrop.release();
                            $rootScope.$broadcast('scroll.refreshComplete');
                            $rootScope.$broadcast('scroll.infiniteScrollComplete');
                            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                                if ($cordovaNetwork.isOffline()) {

                                } else {
                                    if (self.deviceStatus === 1)
                                        toast.showShortBottom('Unable to Complete Request! Check Your Network Connection Or Try Again');
                                }
                            } else {
                                if (self.deviceStatus === 1)
                                    toast.showShortBottom('Unable to Complete Request! Check Your Network Connection Or Try Again');
                            }
                            def.reject('500');
                        });
                        return def.promise;
                    }
                };
            }
        ]);
serviceMod.factory('uploader', ['$q', 'ajaxRequest',
    function ($q, ajaxRequest) {
        return {
            ft: false,
            currentFile: false,
            upload_defer: false,
            had_error: false,
            fileSize: function (fileURI) {
                var def = $q.defer();
                var promise = def.promise;
                window.resolveLocalFileSystemURL(fileURI, function (fileEntry) {
                    fileEntry.file(function (filee) {
                        var size = filee.size * 1;
                        size = Math.ceil(size / (1024 * 1024));
                        def.resolve(size);
                    }, function () {
                        def.resolve(0);
                    });
                }, function (err) {
                    def.resolve(0);
                });
                return promise;
            },
            cancelUpload: function (index) {
                if (this.ft && this.currentFile === index) {
                    this.ft.abort();
                    this.ft = false;
                    if (this.upload_defer) {
                        this.upload_defer.reject();
                    }
                    console.log('upload abored');
                } else {
                    console.log('no reason to abort upload');
                }
            },
            upload: function (files, params) {
                if (!angular.isArray(files)) {
                    files = [files];
                }
                this.had_error = false;
                var defer = $q.defer();
                var x = this.doFile(files, params, 0);
                x.then(function (data) {
                    defer.resolve(data);
                }, function (data) {
                    defer.reject(data);
                }, function (data) {
                    defer.notify(data);
                });
                return defer.promise;
            },
            doFile: function (files, params, i, defer) {
                if (i === 0) {
                    defer = $q.defer();
                }
                var promise = this.uploadFile(files[i], params);
                var context = this;
                context.currentFile = i;
                promise.then(function (data) {
                    console.log(i + '==' + (files.length - 1));
                    if (i === files.length - 1) {
                        if (context.had_error) {
                            defer.reject(data);
                        } else {
                            defer.resolve(data);
                        }
                    } else {
                        context.doFile(files, params, i + 1, defer);
                    }
                }, function (data) {
                    context.had_error = true;
                    console.log(i + '==' + (files.length - 1) + "error");
                    if (i === files.length - 1) {
                        if (context.had_error) {
                            defer.reject(data);
                        } else {
                            defer.resolve(data);
                        }
                    } else {
                        context.doFile(files, params, i + 1, defer);
                    }
                }, function (data) {
//                    console.log('at notify');
//                    console.log(data);

                    if (data.status === 'error') {
                        context.had_error = true;
                    }
                    if (data.progress) {
                        data.file = i;
                        data.status = 'progress';
                        defer.notify(data);
                    } else {
                        data.file = i;
                        defer.notify(data);
                    }
                });
                if (i === 0) {
                    return defer.promise;
                }
            },
            uploadFile: function (fileURL, params) {
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                options.params = params;
                var context = this;
                context.upload_defer = $q.defer();
                if (context.ft) {
                    console.log('another file already in progress');
                    context.notify({status: 'error', code: 'Another File Already In Progress'});
                    context.reject();
                } else {
                    console.log('starting file ' + fileURL);
                    var win = function (r) {

                        console.log("Code = " + r.responseCode);
                        console.log("Response = " + r.response);
                        var obj = JSON.parse(r.response);
                        console.log(obj);
                        console.log("Response Error = " + obj.error);
                        console.log("Sent = " + r.bytesSent);
                        if (obj.error * 1 === 0) {
                        } else {
                            if (obj.error === 2) {
                                context.upload_defer.notify({status: 'error', code: 'Unknow Error! Try Again Later'});
                            } else {
                                context.upload_defer.notify({status: 'error', code: obj.message});
                            }
                        }
                        context.upload_defer.resolve(obj);
                        context.ft = false;
                    };
                    var fail = function (error) {                     // error.code == FileTransferError.ABORT_ERR
                        context.upload_defer.reject("An error has occurred: Code = " + error.code);
                        context.ft = false;
                    };
                    context.ft = new FileTransfer();
                    context.ft.upload(fileURL, encodeURI(ajaxRequest.url('v1/picture/upload')), win, fail, options);
                    context.ft.onprogress = function (progressEvent) {
//                        console.log(progressEvent);
                        if (progressEvent.lengthComputable) {                         //loadingStatus.setPercentage();
                            var x = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                            context.upload_defer.notify({progress: x});
                        } else {
                        }
                    };
                }
                return this.upload_defer.promise;
            }
        };
    }
]);
/*
 * The whenReady directive allows you to execute the content of a when-ready
 * attribute after the element is ready (i.e. when it's done loading all sub directives and DOM
 * content). See: http://stackoverflow.com/questions/14968690/sending-event-when-angular-js-finished-loading
 *
 * Execute multiple expressions in the when-ready attribute by delimiting them
 * with a semi-colon. when-ready="doThis(); doThat()"
 *
 * Optional: If the value of a wait-for-interpolation attribute on the
 * element evaluates to true, then the expressions in when-ready will be
 * evaluated after all text nodes in the element have been interpolated (i.e.
 * {{placeholders}} have been replaced with actual values).
 *
 * Optional: Use a ready-check attribute to write an expression that
 * specifies what condition is true at any given moment in time when the
 * element is ready. The expression will be evaluated repeatedly until the
 * condition is finally true. The expression is executed with
 * requestAnimationFrame so that it fires at a moment when it is least likely
 * to block rendering of the page.
 *
 * If wait-for-interpolation and ready-check are both supplied, then the
 * when-ready expressions will fire after interpolation is done *and* after
 * the ready-check condition evaluates to true.
 *
 * Caveats: if other directives exists on the same element as this directive
 * and destroy the element thus preventing other directives from loading, using
 * this directive won't work. The optimal way to use this is to put this
 * directive on an outer element.
 */
serviceMod.directive('whenReady', ['$interpolate', function ($interpolate) {
        return {
            restrict: 'A',
            priority: Number.MIN_SAFE_INTEGER, // execute last, after all other directives if any.
            link: function ($scope, $element, $attributes) {
                var expressions = $attributes.whenReady.split(';');
                var waitForInterpolation = false;
                var hasReadyCheckExpression = false;
                function evalExpressions(expressions) {
                    expressions.forEach(function (expression) {
                        $scope.$eval(expression);
                    });
                }

                if ($attributes.whenReady.trim().length === 0) {
                    return;
                }

                if ($attributes.waitForInterpolation && $scope.$eval($attributes.waitForInterpolation)) {
                    waitForInterpolation = true;
                }

                if ($attributes.readyCheck) {
                    hasReadyCheckExpression = true;
                }

                if (waitForInterpolation || hasReadyCheckExpression) {
                    requestAnimationFrame(function checkIfReady() {
                        var isInterpolated = false;
                        var isReadyCheckTrue = false;
                        if (waitForInterpolation && $element.text().indexOf($interpolate.startSymbol()) >= 0) { // if the text still has {{placeholders}}
                            isInterpolated = false;
                        }
                        else {
                            isInterpolated = true;
                        }

                        if (hasReadyCheckExpression && !$scope.$eval($attributes.readyCheck)) { // if the ready check expression returns false
                            isReadyCheckTrue = false;
                        }
                        else {
                            isReadyCheckTrue = true;
                        }

                        if (isInterpolated && isReadyCheckTrue) {
                            evalExpressions(expressions);
                        }
                        else {
                            requestAnimationFrame(checkIfReady);
                        }

                    });
                }
                else {
                    evalExpressions(expressions);
                }
            }
        };
    }]);
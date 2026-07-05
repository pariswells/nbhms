(function ($) {
    "use strict";

    if (!$.apusThemeExtensions)
        $.apusThemeExtensions = {};
    
    function ApusThemeCore() {
        var self = this;
        // self.init();
    };

    ApusThemeCore.prototype = {
        /**
         *  Initialize
         */
        init: function() {
            var self = this;
            
            if ( self.target_html == null ) {
                self.target_html = $('#apus_login_register_form_wrapper').html();
                $('#apus_login_register_form_wrapper').html('');
            }
            
            if ( self.schedule_target_html == null ) {
                self.schedule_target_html = $('.apus-schedule-visit-wrapper').html();
                $('.apus-schedule-visit-wrapper').html('');
            }

            self.preloadSite();

            // slick init
            self.initSlick($("[data-carousel=slick]"));

            // Unveil init
            setTimeout(function(){
                self.layzyLoadImage();
            }, 200);
            
            // isoto
            self.initIsotope();

            // Sticky Header
            self.intChangeHeaderMarginTop();
            self.initHeaderSticky();

            // back to top
            self.backToTop();

            // popup image
            self.popupImage();

            $('[data-toggle="tooltip"]').tooltip();

            self.schedulePopup();

            self.userLoginRegister();

            self.initMobileMenu();

            self.mainMenuInit();

            self.loadExtension();

            $(document.body).on('click', '.nav [data-toggle="dropdown"]' ,function(){
                if ( this.href && this.href != '#'){
                    window.location.href = this.href;
                }
            });
        },
        /**
         *  Extensions: Load scripts
         */
        loadExtension: function() {
            var self = this;
            
        },
        initSlick: function(element) {
            var self = this;
            element.each( function(){
                var config = {
                    infinite: false,
                    arrows: $(this).data( 'nav' ),
                    dots: $(this).data( 'pagination' ),
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    prevArrow:"<button type='button' class='slick-arrow slick-prev'><i class='fas fa-angle-left' aria-hidden='true'></i></span><span class='textnav'>"+ rekon_ajax.previous +"</span></button>",
                    nextArrow:"<button type='button' class='slick-arrow slick-next'><span class='textnav'>"+ rekon_ajax.next +"</span><i class='fas fa-angle-right' aria-hidden='true'></i></button>",
                };
            
                var slick = $(this);
                if( $(this).data('items') ){
                    config.slidesToShow = $(this).data( 'items' );
                    config.slidesToScroll = $(this).data( 'items' );
                }
                if( $(this).data('slidesToScroll') ){
                    config.slidesToScroll = $(this).data( 'slidesToScroll' );
                }
                if( $(this).data('infinite') ){
                    config.infinite = true;
                }
                if( $(this).data('centermode') ){
                    config.centerMode = true;
                }
                if( $(this).data('vertical') ){
                    config.vertical = true;
                }
                if( $(this).data('rows') ){
                    config.rows = $(this).data( 'rows' );
                }
                if( $(this).data('asnavfor') ){
                    config.asNavFor = $(this).data( 'asnavfor' );
                }
                if( $(this).data('slidestoscroll') ){
                    config.slidesToScroll = $(this).data( 'slidestoscroll' );
                }
                if( $(this).data('focusonselect') ){
                    config.focusOnSelect = $(this).data( 'focusonselect' );
                }
                if ($(this).data('large')) {
                    var desktop = $(this).data('large');
                } else {
                    var desktop = config.items;
                }
                if ($(this).data('smalldesktop')) {
                    var smalldesktop = $(this).data('smalldesktop');
                } else {
                    if ($(this).data('large')) {
                        var smalldesktop = $(this).data('large');
                    } else{
                        var smalldesktop = config.items;
                    }
                }
                if ($(this).data('medium')) {
                    var medium = $(this).data('medium');
                } else {
                    var medium = config.items;
                }
                if ($(this).data('smallmedium')) {
                    var smallmedium = $(this).data('smallmedium');
                } else {
                    var smallmedium = 2;
                }
                if ($(this).data('extrasmall')) {
                    var extrasmall = $(this).data('extrasmall');
                } else {
                    var extrasmall = 2;
                }
                if ($(this).data('smallest')) {
                    var smallest = $(this).data('smallest');
                } else {
                    var smallest = 1;
                }
                config.responsive = [
                    {
                        breakpoint: 321,
                        settings: {
                            slidesToShow: smallest,
                            slidesToScroll: smallest,
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: extrasmall,
                            slidesToScroll: extrasmall,
                        }
                    },
                    {
                        breakpoint: 769,
                        settings: {
                            slidesToShow: smallmedium,
                            slidesToScroll: smallmedium
                        }
                    },
                    {
                        breakpoint: 981,
                        settings: {
                            slidesToShow: medium,
                            slidesToScroll: medium
                        }
                    },
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: smalldesktop,
                            slidesToScroll: smalldesktop
                        }
                    },
                    {
                        breakpoint: 1501,
                        settings: {
                            slidesToShow: desktop,
                            slidesToScroll: desktop
                        }
                    }
                ];
                if ( $('html').attr('dir') == 'rtl' ) {
                    config.rtl = true;
                }

                slick.slick( config );
            } );

            // Fix owl in bootstrap tabs
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var target = $(e.target).attr("href");
                var $slick = $(".slick-carousel", target);

                if ($slick.length > 0 && $slick.hasClass('slick-initialized')) {
                    $slick.slick('refresh');
                }
                
                self.layzyLoadImage();
            });
        },
        layzyLoadImage: function() {
            $(window).off('scroll.unveil resize.unveil lookup.unveil');
            var $images = $('.image-wrapper:not(.image-loaded) .unveil-image'); // Get un-loaded images only
            if ($images.length) {
                $images.unveil(1, function() {
                    $(this).load(function() {
                        $(this).parents('.image-wrapper').first().addClass('image-loaded');
                        $(this).removeAttr('data-src');
                        $(this).removeAttr('data-srcset');
                        $(this).removeAttr('data-sizes');
                    });
                });
            }

            var $images = $('.product-image:not(.image-loaded) .unveil-image'); // Get un-loaded images only
            if ($images.length) {
                $images.unveil(1, function() {
                    $(this).load(function() {
                        $(this).parents('.product-image').first().addClass('image-loaded');
                    });
                });
            }
        },
        initIsotope: function() {
            setTimeout(function() {
                $('.isotope-items').each(function(){  
                    var $container = $(this);
                    if ( typeof imagesLoaded !== 'undefined' ) {
                        $container.imagesLoaded( function(){
                            $container.isotope({
                                itemSelector : '.isotope-item',
                                transformsEnabled: true,         // Important for videos
                                masonry: {
                                    columnWidth: $container.data('columnwidth')
                                }
                            }); 
                        });
                    }
                });
            }, 100);
            /*---------------------------------------------- 
             *    Apply Filter        
             *----------------------------------------------*/
            $('.isotope-filter li a').on('click', function(){
               
                var parentul = $(this).parents('ul.isotope-filter').data('related-grid');
                $(this).parents('ul.isotope-filter').find('li a').removeClass('active');
                $(this).addClass('active');
                var selector = $(this).attr('data-filter'); 
                $('#'+parentul).isotope({ filter: selector }, function(){ });
                return(false);
            });
        },
        changeHeaderMarginTop: function() {
            if ($(window).width() > 991) {
                if ( $('.main-sticky-header').length > 0 ) {
                    var header_height = $('.main-sticky-header').outerHeight();
                    $('.main-sticky-header-wrapper').css({'height': header_height});
                }
                // top for cart
                if ( $('#apus-header').length > 0 ) {
                    var header_height = $('#apus-header').outerHeight();
                    $('.search-header').css({'padding-top': header_height});
                }
            }
        },
        changePaddingBreadscrumb: function() {
            if ($(window).width() > 1199) {
                if ( $('#apus-header').length > 0 ) {
                    var header_height = $('#apus-header').outerHeight();
                    $('.apus-breadscrumb.has_bg').css({'padding-top': header_height});
                }
            }else{
                if ( $('#apus-header-mobile').length > 0 ) {
                    var header_height = $('#apus-header-mobile').outerHeight();
                    $('.apus-breadscrumb.has_bg').css({'padding-top': header_height});
                }
            }
        },

        intChangeHeaderMarginTop: function() {
            var self = this;
            setTimeout(function(){
                self.changeHeaderMarginTop();
            }, 50);
            $(window).resize(function(){
                self.changeHeaderMarginTop();
            });
        },
        initHeaderSticky: function() {
            var self = this;
            var main_sticky = $('.main-sticky-header');
            setTimeout(function(){
                if ( main_sticky.length > 0 ){
                    if ($(window).width() > 991) {
                        var _menu_action = main_sticky.offset().top;
                        $(window).scroll(function(event) {
                            self.headerSticky(main_sticky, _menu_action);
                        });
                        self.headerSticky(main_sticky, _menu_action);
                    }
                }
            }, 50);
        },
        headerSticky: function(main_sticky, _menu_action) {
            if( $(document).scrollTop() > _menu_action ){
                main_sticky.addClass('sticky-header');
            }else{
                main_sticky.removeClass('sticky-header');
            }
        },
        backToTop: function () {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 400) {
                    $('#back-to-top').addClass('active');
                } else {
                    $('#back-to-top').removeClass('active');
                }
            });
            $('#back-to-top').on('click', function () {
                $('html, body').animate({scrollTop: '0px'}, 800);
                return false;
            });
        },
        popupImage: function() {
            // popup
            $(".popup-image").magnificPopup({type:'image'});
            $('.popup-video').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });

            $('.widget-gallery').each(function(){
                var tagID = $(this).attr('id');
                $('#' + tagID).magnificPopup({
                    delegate: '.popup-image-gallery',
                    type: 'image',
                    tLoading: 'Loading image #%curr%...',
                    mainClass: 'mfp-img-mobile',
                    gallery: {
                        enabled: true,
                        navigateByImgClick: true,
                        preload: [0,1] // Will preload 0 - before current, and 1 after the current image
                    }
                });
            });
        },
        preloadSite: function() {
            // preload page
            if ( $('body').hasClass('apus-body-loading') ) {
                $('body').removeClass('apus-body-loading');
                $('.apus-page-loading').fadeOut(100);
            }
        },
        schedulePopup: function() {
            var self = this;
            $('.schedule-visit-btn').on('click', function(){
                
                $.magnificPopup.open({
                    mainClass: 'apus-mfp-zoom-in schedule-mfp-wrapper',
                    items    : {
                        src : self.schedule_target_html,
                        type: 'inline'
                    }

                });
                return false;
            });

            $(document).on('click', '.team-popup-btn', function(){
                var container = $(this).closest('.widget-team');
                $.magnificPopup.open({
                    mainClass: 'apus-mfp-zoom-in team-popup-mfp-wrapper',
                    items    : {
                        src : container.find('.team-popup-wrapper').html(),
                        type: 'inline'
                    },
                    callbacks: {
                        open: function() {
                            self.layzyLoadImage();
                        }
                    }

                });

            });
        },
        loginRegisterPopup: function(target) {
            var self = this;
            $.magnificPopup.open({
                mainClass: 'apus-mfp-zoom-in',
                items    : {
                    src : self.target_html,
                    type: 'inline'
                },
                callbacks: {
                    open: function() {
                        $(target).trigger('click');
                        $('.apus_login_register_form .nav-tabs li').removeClass('active');
                        $(target).parent().addClass('active');
                        var id = $(target).attr('href');
                        $('.apus_login_register_form .tab-pane').removeClass('active');
                        $(id).addClass('active').addClass('in');

                        $('#apus_forgot_password_form').hide();
                        $('#apus_login_form').show();

                        $('.apus_login_register_form').addClass('animated fadeInDown');
                    }
                }

            });
            
        },
        userLoginRegister: function() {
            var self = this;
            // login/register
            
            $('.apus-user-login').on('click', function(){
                var target = $(this).attr('href');
                
                self.loginRegisterPopup(target);
                return false;
            });
            
            $('.apus-user-register').on('click', function(){
                var target = $(this).attr('href');
                
                self.loginRegisterPopup(target);
                return false;
            });

            $('.account-sign-in a, .must-log-in a').on('click', function(e){
                e.preventDefault();
                var target = $('.apus-user-login').attr('href');
                self.loginRegisterPopup(target);
                return false;
            });
            $('body').on('click', '.apus_login_register_form .mfp-close', function(){
                $.magnificPopup.close();
            });
            
            // sign in proccess
            $('body').on('submit', 'form.apus-login-form', function(){
                var $this = $(this);
                $this.find('.alert').remove();
                $this.addClass('loading');
                $.ajax({
                    url: rekon_opts.ajaxurl,
                    type:'POST',
                    dataType: 'json',
                    data:  $(this).serialize()+"&action=apus_ajax_login"
                }).done(function(data) {
                    $this.removeClass('loading');
                    if ( data.loggedin ) {
                        $this.prepend( '<div class="alert alert-info">' + data.msg + '</div>' );
                        location.reload(); 
                    } else {
                        $this.prepend( '<div class="alert alert-warning">' + data.msg + '</div>' );
                    }
                });
                return false; 
            } );
            $('body').on('click', '.back-link', function(e){
                e.preventDefault();
                $('.form-container').hide();
                $($(this).attr('href')).show(); 
                return false;
            } );

             // lost password in proccess
            $('body').on('submit', 'form.forgotpassword-form', function(){
                var $this= $(this);
                $this.find('.alert').remove();
                $this.addClass('loading');
                $.ajax({
                  url: rekon_opts.ajaxurl,
                  type:'POST',
                  dataType: 'json',
                  data:  $(this).serialize()+"&action=apus_ajax_forgotpass"
                }).done(function(data) {
                     $this.removeClass('loading');
                    if ( data.loggedin ) {
                        $this.prepend( '<div class="alert alert-info">'+data.msg+'</div>' );
                        location.reload(); 
                    } else {
                        $this.prepend( '<div class="alert alert-warning">'+data.msg+'</div>' );
                    }
                });
                return false; 
            } );
            $('body').on('click', '#apus_forgot_password_form form .btn-cancel', function(e){
                e.preventDefault();
                $('#apus_forgot_password_form').hide();
                $('#apus_login_form').show();
            } );

            // register
            $('body').on('submit', 'form.apus-register-form', function(){
                var $this= $(this);
                $this.find('.alert').remove();
                $this.addClass('loading');
                $.ajax({
                  url: rekon_opts.ajaxurl,
                  type:'POST',
                  dataType: 'json',
                  data:  $(this).serialize()+"&action=apus_ajax_register"
                }).done(function(data) {
                    $this.removeClass('loading');
                    if ( data.loggedin ) {
                        $this.prepend( '<div class="alert alert-info">'+data.msg+'</div>' );
                        location.reload();
                    } else {
                        $this.prepend( '<div class="alert alert-warning">'+data.msg+'</div>' );
                        grecaptcha.reset();
                    }
                });
                return false;
            } );
        },
        initMobileMenu: function() {

            // mobile menu
            $('.btn-toggle-canvas,.btn-showmenu').on('click', function (e) {
                e.stopPropagation();
                $('.apus-offcanvas').toggleClass('active');           
                $('.over-dark').toggleClass('active');        
            });
            $('body').on('click', function() {
                if ($('.apus-offcanvas').hasClass('active')) {
                    $('.apus-offcanvas').toggleClass('active');
                    $('.over-dark').toggleClass('active');
                }
            });
            $('.apus-offcanvas').on('click', function(e) {
                e.stopPropagation();
            });

            $(".main-mobile-menu .icon-toggle").on('click', function(){
                $(this).parent().find('> .sub-menu').slideToggle();
                if ( $(this).find('i').hasClass('fas fa-plus') ) {
                    $(this).find('i').removeClass('fas fa-plus').addClass('fas fa-minus');
                } else {
                    $(this).find('i').removeClass('fas fa-minus').addClass('fas fa-plus');
                }
                return false;
            } );

            // sidebar mobile

            if ($(window).width() < 1200) {
                $('.sidebar-right, .sidebar-left').perfectScrollbar();
            }
            
            $('body').on('click', '.mobile-sidebar-btn', function(){
                if ( $('.sidebar-left').length > 0 ) {
                    $('.sidebar-left').toggleClass('active');
                } else if ( $('.sidebar-right').length > 0 ) {
                    $('.sidebar-right').toggleClass('active');
                }
                $('.mobile-sidebar-panel-overlay').toggleClass('active');
            });
            $('body').on('click', '.mobile-sidebar-panel-overlay, .close-sidebar-btn', function(){
                if ( $('.sidebar-left').length > 0 ) {
                    $('.sidebar-left').removeClass('active');
                } else if ( $('.sidebar-right').length > 0 ) {
                    $('.sidebar-right').removeClass('active');
                }
                $('.mobile-sidebar-panel-overlay').removeClass('active');
            });

            $('.apus-search-form .btn-search-icon').on('click', function(e) {
                e.preventDefault();
                $('.apus-search-form-wrapper').toggleClass('active');
            });
            $('.apus-search-form-wrapper span.close').on('click', function() {
                $('.apus-search-form-wrapper').removeClass('active');
            });

            $('.contact-sidebar-element .contact-sidebar-btn').on('click', function(e) {
                e.preventDefault();
                $('.contact-sidebar-wrapper').toggleClass('active');
            });
            $('.contact-sidebar-wrapper .contact_close').on('click', function(e) {
                e.preventDefault();
                $('.contact-sidebar-wrapper').removeClass('active');
            });
        },

        mainMenuInit: function() {
            $('.apus-megamenu .megamenu .has-mega-menu.aligned-fullwidth').each(function(e){
                var $this = $(this),
                    i = $this.closest(".elementor-container"),
                    a = $this.closest('.apus-megamenu');
                $this.on('hover', function(){
                    var m = $(this).find('> .dropdown-menu .dropdown-menu-inner'),
                        w = i.width();

                    m.css({
                        width: w,
                        marginLeft: i.offset().left - a.offset().left
                    });
                });

                $this.find('.elementor-element').addClass('no-transparent');
            });
        },
        setCookie: function(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires+";path=/";
        },
        getCookie: function(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
            }
            return "";
        }
    }

    $.apusThemeCore = ApusThemeCore.prototype;
    
    
    $.fn.wrapStart = function(numWords){
        return this.each(function(){
            var $this = $(this);
            var node = $this.contents().filter(function(){
                return this.nodeType == 3;
            }).first(),
            text = node.text().trim(),
            first = text.split(' ', 1).join(" ");
            if (!node.length) return;
            node[0].nodeValue = text.slice(first.length);
            node.before('<b>' + first + '</b>');
        });
    };

    $(document).ready(function() {
        // Initialize script
        var apusthemecore_init = new ApusThemeCore();
        apusthemecore_init.init();

        $('.mod-heading .widget-title > span').wrapStart(1);
    });


    jQuery(window).on("elementor/frontend/init", function() {
        
        var apusthemecore_init = new ApusThemeCore();

        // General element
        elementorFrontend.hooks.addAction( "frontend/element_ready/apus_element_brands.default",
            function($scope) {
                apusthemecore_init.initSlick($scope.find('.slick-carousel'));
            }
        );

        elementorFrontend.hooks.addAction( "frontend/element_ready/apus_element_posts.default",
            function($scope) {
                apusthemecore_init.initSlick($scope.find('.slick-carousel'));
            }
        );

        elementorFrontend.hooks.addAction( "frontend/element_ready/apus_element_testimonials.default",
            function($scope) {
                apusthemecore_init.initSlick($scope.find('.slick-carousel'));
            }
        );

        elementorFrontend.hooks.addAction( "frontend/element_ready/apus_element_gallery.default",
            function($scope) {
                apusthemecore_init.initSlick($scope.find('.slick-carousel'));
            }
        );

        elementorFrontend.hooks.addAction( "frontend/element_ready/apus_element_teams.default",
            function($scope) {
                apusthemecore_init.initSlick($scope.find('.slick-carousel'));
            }
        );

        elementorFrontend.hooks.addAction( "frontend/element_ready/apus_element_projects.default",
            function($scope) {
                apusthemecore_init.initSlick($scope.find('.slick-carousel'));
            }
        );
        
    });

})(jQuery);


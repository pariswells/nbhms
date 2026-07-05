(function($) {
    "use strict";

    $(window).on("elementor/frontend/init", function() {
        elementorFrontend.hooks.addAction("frontend/element_ready/Osteo_Image_Compare.default", function($scope) {
            $scope.find(".twentytwenty-container").each(function() {
                var element = $(this)[0];
                var orientation = $(this).data('orientation');
                var before_label = $(this).data('before_label');
                var after_label = $(this).data('after_label');
                var no_overlay = $(this).data('no_overlay');
                var move_slider_on_hover = $(this).data('move_slider_on_hover');
                var move_with_handle_only = $(this).data('move_with_handle_only');
                var click_to_move = $(this).data('click_to_move');
                if (element) {
                    $(element).twentytwenty({
                        default_offset_pct: 0.3,
                        orientation: orientation,
                        before_label: before_label, // Set a custom before label
                        after_label: after_label, // Set a custom after label
                        no_overlay: no_overlay, //Do not show the overlay with before and after
                        move_slider_on_hover: move_slider_on_hover, // Move slider on mouse hover?
                        move_with_handle_only: move_with_handle_only, // Allow a user to swipe anywhere on the image to control slider movement. 
                        click_to_move: click_to_move,
                    })
                }
            });
        })
    });

})(jQuery)
(function ($) {
    "use strict";
    azt.open_image_select_dialog = function ($target, callback) {
        var multiple = false;
        var type = 'image';
        var azh_frame = 'azh-' + multiple + '-' + type;
        var image = this;
        multiple = (typeof multiple == 'undefined' ? false : multiple);
        type = (typeof type == 'undefined' ? 'image' : type);
        // check for media manager instance
        if (window.wp.media.frames[azh_frame]) {
            window.wp.media.frames[azh_frame].image = image;
            window.wp.media.frames[azh_frame].callback = callback;
            window.wp.media.frames[azh_frame].options.multiple = multiple;
            window.wp.media.frames[azh_frame].options.library = {type: type};
            window.wp.media.frames[azh_frame].open();
            return;
        }
        // configuration of the media manager new instance            
        window.wp.media.frames[azh_frame] = window.wp.media({
            multiple: multiple,
            library: {
                type: type
            }
        });
        window.wp.media.frames[azh_frame].image = image;
        window.wp.media.frames[azh_frame].callback = callback;
        // Function used for the image selection and media manager closing            
        var azh_media_set_image = function () {
            var selection = window.wp.media.frames[azh_frame].state().get('selection');
            // no selection
            if (!selection) {
                return;
            }
            // iterate through selected elements
            if (window.wp.media.frames[azh_frame].options.multiple) {
                window.wp.media.frames[azh_frame].callback.call(window.wp.media.frames[azh_frame].image, selection.map(function (attachment) {
                    return {url: attachment.attributes.url, id: attachment.attributes.id};
                }));
            } else {
                selection.each(function (attachment) {
                    window.wp.media.frames[azh_frame].callback.call(window.wp.media.frames[azh_frame].image, attachment.attributes.url, attachment.attributes.id);
                });
            }
        };
        // closing event for media manger
        window.wp.media.frames[azh_frame].on('close', function () {
        });
        // image selection event
        window.wp.media.frames[azh_frame].on('select', azh_media_set_image);
        // showing media manager
        window.wp.media.frames[azh_frame].open();
    };
    $(function () {
    });
})(jQuery);
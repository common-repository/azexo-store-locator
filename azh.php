<?php

add_action('init', 'azt_azh_init');

function azt_azh_init() {
    if (defined('AZH_VERSION')) {
        $settings = get_option('azh-settings');
        if (!isset($settings['templates']['enable']) || !$settings['templates']['enable']) {
            $settings['templates']['enable'] = '1';
            update_option('azh-settings', $settings);
        }
    }

    if (!defined('AZH_VERSION')) {
        register_post_type('azt_item', array(
            'labels' => array(
                'name' => __('Item', 'azt'),
                'singular_name' => __('Item', 'azt'),
                'add_new' => __('Add Item', 'azt'),
                'add_new_item' => __('Add New Item', 'azt'),
                'edit_item' => __('Edit Item', 'azt'),
                'new_item' => __('New Item', 'azt'),
                'view_item' => __('View Item', 'azt'),
                'search_items' => __('Search Items', 'azt'),
                'not_found' => __('No Item found', 'azt'),
                'not_found_in_trash' => __('No Item found in Trash', 'azt'),
                'parent_item_colon' => __('Parent Item:', 'azt'),
                'menu_name' => __('Items', 'azt'),
            ),
            'query_var' => false,
            'rewrite' => false,
            'hierarchical' => true,
            'supports' => array('thumbnail', 'title', 'custom-fields', 'author', 'comments'),
            'show_ui' => false,
            'show_in_nav_menus' => false,
            'show_in_menu' => false,
            'public' => false,
            'exclude_from_search' => true,
            'publicly_queryable' => false,
        ));
    }
}

add_action('wp_enqueue_scripts', 'azt_azh_scripts');

function azt_azh_scripts() {
    if (!defined('AZH_VERSION')) {
        wp_enqueue_script('ion-range-slider', plugins_url('js/ion.rangeSlider.js', __FILE__), array('jquery'), AZT_PLUGIN_VERSION, true);
        wp_enqueue_style('ion-range-slider', plugins_url('css/ion.rangeSlider.css', __FILE__), false, AZT_PLUGIN_VERSION);
        wp_enqueue_script('air-datepicker', plugins_url('js/air-datepicker.js', __FILE__), array('jquery'), AZT_PLUGIN_VERSION, true);
        wp_enqueue_style('air-datepicker', plugins_url('css/air-datepicker.css', __FILE__), false, AZT_PLUGIN_VERSION);
        wp_enqueue_script('azh_frontend', plugins_url('js/frontend.js', __FILE__), array('jquery', 'imagesloaded'), AZT_PLUGIN_VERSION, true);
        wp_enqueue_style('azh_frontend', plugins_url('css/frontend.css', __FILE__), false, AZT_PLUGIN_VERSION);
        wp_enqueue_script('azt_frontend', plugins_url('js/templates.js', __FILE__), array('jquery', 'ion-range-slider', 'air-datepicker', 'underscore'), AZT_PLUGIN_VERSION, true);
        wp_enqueue_style('azt_frontend', plugins_url('css/templates.css', __FILE__), array(), AZT_PLUGIN_VERSION);
        wp_localize_script('azt_frontend', 'azt', azt_azh_get_frontend_object());
    }
}

function azt_azh_get_frontend_object() {
    $azt = array(
        'fields' => array('id' => array()),
        'table' => array(),
    );
    $posts = get_posts(array(
        'post_type' => 'azt_item',
        'posts_per_page' => '-1',
    ));
    if ($posts) {
        foreach ($posts as $post) {
            $row = json_decode($post->post_content, true);
            if (!$row) {
                $row = azt_map_get_item_fields($post->ID);
            }
            foreach ($row as $key => $value) {
                if (!isset($azt['fields'][$key])) {
                    $azt['fields'][$key] = array('values' => array());
                }
                $azt['fields'][$key]['values'][] = $row[$key];
                $azt['fields'][$key]['values'] = array_values(array_unique($azt['fields'][$key]['values']));
            }
            $azt['table'][] = $row;
        }
    }
    return apply_filters('azt_get_frontend_object', $azt);
}

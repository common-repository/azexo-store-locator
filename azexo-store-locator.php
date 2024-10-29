<?php

/*
  Plugin Name: AZEXO Store Locator
  Description: Store Locator
  Author: AZEXO
  Author URI: http://azexo.com
  Version: 1.4
  Text Domain: azt
 */

define('AZT_VERSION', '1.4');
define('AZT_PLUGIN_VERSION', '1.4');
define('AZT_URL', plugins_url('', __FILE__));
define('AZT_DIR', trailingslashit(dirname(__FILE__)));
define('AZT_PLUGIN_NAME', trailingslashit(basename(dirname(__FILE__))) . 'azexo-store-locator.php');


include_once(AZT_DIR . 'azh.php' );

add_action('tgmpa_register', 'azt_tgmpa_register');

function azt_tgmpa_register() {
    tgmpa(array(
        array(
            'name' => esc_html__('Page builder by AZEXO', 'azt'),
            'slug' => 'page-builder-by-azexo',
        ),
    ));
}

add_action('wp_enqueue_scripts', 'azt_map_scripts', 11);

function azt_map_scripts() {
    $settings = get_option('azt-settings', array());
    if (!empty($settings['gmap_api_key'])) {
        wp_enqueue_script('google-maps', (is_ssl() ? 'https' : 'http') . '://maps.google.com/maps/api/js?sensor=false&libraries=places&key=' . $settings['gmap_api_key']);
    }
    wp_enqueue_script('infobox', plugins_url('js/infobox.js', __FILE__), array('google-maps'), AZT_PLUGIN_VERSION, true);
    wp_enqueue_script('markerclusterer', plugins_url('js/markerclusterer.js', __FILE__), array('google-maps'), AZT_PLUGIN_VERSION, true);
    wp_enqueue_script('richmarker', plugins_url('js/richmarker.js', __FILE__), array('google-maps'), AZT_PLUGIN_VERSION, true);
    if (apply_filters('azt_map_credits', true)) {
        wp_add_inline_style('azt_frontend', '.azt-map-credits {font-size: 11px;line-height: 1;text-align: center;padding: 0px 4px; height: 14px; display: flex; align-items: center; z-index: 1;position: absolute;bottom: 0px;right: 0px;background-color: rgba(255, 255, 255, 0.7);}');
    } else {
        wp_add_inline_style('azt_frontend', '.azt-map-credits {display: none;}');
    }
}

add_action('admin_enqueue_scripts', 'azt_map_admin_scripts');

function azt_map_admin_scripts() {
    wp_enqueue_style('azt_dashboard', plugins_url('css/dashboard.css', __FILE__), array(), AZT_PLUGIN_VERSION);
}

function azt_map_get_item_fields($post_id) {
    $row = array('id' => $post_id);
    $metadata = get_post_meta($post_id);
    if (is_array($metadata)) {
        foreach ($metadata as $key => $value) {
            if ($key[0] != '_') {
                $row[$key] = reset($value);
            }
        }
    }
    return $row;
}

add_action('admin_menu', 'azt_admin_menu');

function azt_admin_menu() {
    add_menu_page(__('Store locator', 'azt'), __('Store locator', 'azt'), 'manage_options', 'azt-dashboard', 'azt_dashboard', 'dashicons-admin-site-alt3');
}

function azt_dashboard() {
    $settings = get_option('azt-settings', array());
    if (!empty($settings['gmap_api_key'])) {
        wp_enqueue_script('google-maps', (is_ssl() ? 'https' : 'http') . '://maps.google.com/maps/api/js?sensor=false&libraries=places&key=' . $settings['gmap_api_key']);
    }
    wp_enqueue_script('air-datepicker', plugins_url('js/air-datepicker.js', __FILE__), array('jquery'), AZT_PLUGIN_VERSION, true);
    wp_enqueue_style('air-datepicker', plugins_url('css/air-datepicker.css', __FILE__), false, AZT_PLUGIN_VERSION);
    wp_enqueue_script('jquery-datatables', plugins_url('js/jquery.dataTables.js', __FILE__), array(), AZT_PLUGIN_VERSION, true);
    wp_enqueue_script('jquery-simplemodal', plugins_url('js/jquery.simplemodal.js', __FILE__), array(), AZT_PLUGIN_VERSION, true);
    wp_enqueue_script('azt_liquid', plugins_url('js/liquid.js', __FILE__), array(), AZT_PLUGIN_VERSION, true);
    wp_enqueue_script('azt_dashboard', plugins_url('js/dashboard.js', __FILE__), array('jquery', 'jquery-ui-sortable'), AZT_PLUGIN_VERSION, true);
    wp_localize_script('azt_dashboard', 'azt', azt_get_backend_object());
    wp_enqueue_script('azt_wp', plugins_url('js/wp.js', __FILE__), array('azt_dashboard'), AZT_PLUGIN_VERSION, true);
    include 'dashboard.php';
}

function azt_get_backend_object() {
    $settings = get_option('azt-settings', array());
    $azt = array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'fields' => array(),
        'gmap_api_key' => empty($settings['gmap_api_key']) ? '' : $settings['gmap_api_key'],
        'i18n' => array(
            'remove_all_items' => __('Remove all items?', 'azt'),
            'done' => __('Done', 'azt'),
            'ok' => __('OK', 'azt'),
            'cancel' => __('Cancel', 'azt'),
            "list_of_required_fields" => esc_html__('List of required fields', 'azt'),
            'select_columns' => __('Select columns', 'azt'),
            'select_available_field' => __('Select available field', 'azt'),
            'define_which_column_represents_which_field' => __('Define which column represents which field', 'azt'),
            'upload_progress' => __('Upload progress', 'azt'),
            'import_progress' => __('Import progress', 'azt'),
            'or_define_new_field_name' => __('or define new field name', 'azt'),
            'existing_items' => __('Existing items', 'azt'),
            'use_as_id' => __('Use as id', 'azt'),
            'skip' => __('skip', 'azt'),
            'import' => __('Import', 'azt'),
            'rows' => __('rows', 'azt'),
            'overwrite' => __('overwrite', 'azt'),
            'merge' => __('merge', 'azt'),
            'source_of_items' => __('Source of items', 'azt'),
            'fields' => __('Fields', 'azt'),
            'add_new_field' => __('Add a new field', 'azt'),
            'edit_field' => __('Edit field', 'azt'),
            'add_new_item' => __('Add a new item', 'azt'),
            'edit_item' => __('Edit item', 'azt'),
            'item_id' => __('Item ID', 'azt'),
            'field_id' => __('Field ID', 'azt'),
            'name' => __('Name', 'azt'),
            'type' => __('Type', 'azt'),
            'text' => __('Text', 'azt'),
            'url' => __('URL', 'azt'),
            'email' => __('Email', 'azt'),
            'phone' => __('Phone', 'azt'),
            'number' => __('Number', 'azt'),
            'bigtext' => __('Big text', 'azt'),
            'date' => __('Date', 'azt'),
            'datetime' => __('Date and time', 'azt'),
            'event' => __('Event', 'azt'),
            'all_day' => __('All day', 'azt'),
            'repeat' => __('Repeat', 'azt'),
            'no_repeat' => __('No repeat', 'azt'),
            'day' => __('Day', 'azt'),
            'week' => __('Week', 'azt'),
            'month' => __('Month', 'azt'),
            'year' => __('Year', 'azt'),
            'gallery' => __('Gallery', 'azt'),
            'checkbox' => __('Checkbox', 'azt'),
            'visible' => __('Visible', 'azt'),
            'indexing' => __('Indexing', 'azt'),
            'duplicate' => __('Duplicate', 'azt'),
            'edit' => __('Edit', 'azt'),
            'delete' => __('Delete', 'azt'),
            'actions' => __('Actions', 'azt'),
            'image' => __('Image', 'azt'),
            'working_hours' => __('Working hours', 'azt'),
            'location' => __('Location', 'azt'),
            'timezone' => __('Timezone', 'azt'),
            'group' => __('Group', 'azt'),
            'general' => __('General', 'azt'),
            'search' => __('Search', 'azt'),
            'latitude' => __('Latitude', 'azt'),
            'longitude' => __('Longitude', 'azt'),
            'closed' => __('Closed', 'azt'),
            'open_24_hour' => __('Open 24 Hour', 'azt'),
            'monday' => __('Monday', 'azt'),
            'tuesday' => __('Tuesday', 'azt'),
            'wednesday' => __('Wednesday', 'azt'),
            'thursday' => __('Thursday', 'azt'),
            'friday' => __('Friday', 'azt'),
            'saturday' => __('Saturday', 'azt'),
            'sunday' => __('Sunday', 'azt'),
            'saved' => __('Saved', 'azt'),
            'import_progress' => __('Import progress', 'azt'),
            'upload_progress' => __('Upload progress', 'azt'),
            'reserved_field_id' => __('This is reserved field id. Please choose another.', 'azt'),
            'field_id_is_required' => __('Field ID is required', 'azt'),
            'field_id_must_be_latin_lowercase_characters_without_spaces' => __('Field ID must be latin lowercase characters without spaces', 'azt'),
            'field_id_must_be_unique' => __('Field ID must be unique', 'azt'),
            'fetching_missing_coordinates' => __('Fetching missing coordinates', 'azt'),
            'dataTable' => array(
                "sEmptyTable" => __("No data available in table", 'azt'),
                "sInfo" => __("Showing _START_ to _END_ of _TOTAL_ entries", 'azt'),
                "sInfoEmpty" => __("Showing 0 to 0 of 0 entries", 'azt'),
                "sInfoFiltered" => __("(filtered from _MAX_ total entries)", 'azt'),
                "sInfoPostFix" => __("", 'azt'),
                "sInfoThousands" => __(",", 'azt'),
                "sLengthMenu" => __("Show _MENU_ entries", 'azt'),
                "sLoadingRecords" => __("Loading...", 'azt'),
                "sProcessing" => __("Processing...", 'azt'),
                "sSearch" => __("Search:", 'azt'),
                "sZeroRecords" => __("No matching records found", 'azt'),
                "oPaginate" => array(
                    "sFirst" => __("First", 'azt'),
                    "sLast" => __("Last", 'azt'),
                    "sNext" => __("Next", 'azt'),
                    "sPrevious" => __("Previous", 'azt')
                ),
                "oAria" => array(
                    "sSortAscending" => __(": activate to sort column ascending", 'azt'),
                    "sSortDescending" => __(": activate to sort column descending", 'azt')
                )
            ),
        ),
    );
    $fields = get_option('azt-item-fields');
    if (!empty($fields)) {
        $azt['fields'] = $fields;
    }
    return $azt;
}

function azt_recursive_sanitize_text_field($array) {
    foreach ($array as $key => &$value) {
        if (is_array($value)) {
            $value = azt_recursive_sanitize_text_field($value);
        } else {
            $value = sanitize_text_field($value);
        }
    }
    return $array;
}

add_action('wp_ajax_azt_save_fields', 'azt_save_fields');

function azt_save_fields() {
    if (isset($_POST['fields'])) {
        update_option('azt-item-fields', azt_recursive_sanitize_text_field($_POST['fields']));
    } else {
        update_option('azt-item-fields', array());
    }
    wp_die();
}

add_action('azt_get_frontend_object', 'azt_map_get_frontend_object');

function azt_map_get_frontend_object($azt) {
    $fields = get_option('azt-item-fields');
    if (!empty($fields)) {
        foreach ($fields as $field) {
            if (!isset($azt['fields'][$field['id']])) {
                $azt['fields'][$field['id']] = array();
            }
            $azt['fields'][$field['id']] = array_replace($azt['fields'][$field['id']], $field);
        }
    }
    $settings = get_option('azt-settings');
    if (!empty($settings)) {
        if (!empty($settings['default_zoom'])) {
            $azt['default_zoom'] = $settings['default_zoom'];
        }
    }
    return $azt;
}

add_action('wp_ajax_azt_get_items', 'azt_get_items');

function azt_get_items() {
    if (isset($_POST['draw']) && is_numeric($_POST['draw']) && isset($_POST['start']) && is_numeric($_POST['start']) && isset($_POST['length']) && is_numeric($_POST['length'])) {
        $args = array(
            'post_type' => 'azt_item',
            'post_status' => 'publish',
            'ignore_sticky_posts' => 1,
            'offset' => (int) $_POST['start'],
            'posts_per_page' => (int) $_POST['length'],
            'meta_query' => array()
        );
        if (!empty($_POST['search']['value'])) {
            global $wpdb;
            $meta_ids = $wpdb->get_col($wpdb->prepare("SELECT post_id FROM {$wpdb->postmeta} WHERE meta_value LIKE %s", sanitize_text_field($_POST['search']['value']) . '%'));
            if (empty($meta_ids)) {
                $args['post__in'] = array(0);
            } else {
                $args['post__in'] = $meta_ids;
            }
        }
        $query = new WP_Query($args);
        $items = array();
        if ($query->post_count) {
            foreach ($query->posts as $post) {
                $item = array();
                foreach ($_POST['columns'] as $column) {
                    switch ($column['name']) {
                        case 'id':
                            $item[] = $post->ID;
                            break;
                        case 'actions':
                            $item[] = '';
                            break;
                        default:
                            $item[] = get_post_meta($post->ID, sanitize_text_field($column['name']), true);
                    }
                }
                $items[] = $item;
            }
        }
        $data = array(
            'draw' => (int) $_POST['draw'],
            'recordsTotal' => $query->found_posts,
            'recordsFiltered' => $query->found_posts,
            'data' => $items,
        );
        print json_encode($data);
    }
    wp_die();
}

add_action('wp_ajax_azt_add_update_item', 'azt_add_update_item');

function azt_add_update_item() {
    if (isset($_POST['values']) && is_array($_POST['values'])) {
        $id = false;
        if (empty($_POST['values']['id'])) {
            $item_id = wp_insert_post(array(
                'post_title' => '',
                'post_type' => 'azt_item',
                'post_status' => 'publish',
                    ), true);
            if (!is_wp_error($item_id)) {
                $id = $item_id;
            }
        } else {
            $id = (int) $_POST['values']['id'];
        }
        if ($id) {
            foreach ($_POST['values'] as $name => $value) {
                if (!in_array($name, array('id', 'actions'))) {
                    update_post_meta($id, sanitize_text_field($name), sanitize_text_field($value));
                }
            }
            $fields = get_option('azt-item-fields');
            if (!empty($fields)) {
                foreach ($fields as $field) {
                    if (isset($field['type']) && $field['type'] === 'location') {
                        $location = get_post_meta($id, $field['id'], true);
                        $location = json_decode($location, true);
                        if ($location) {
                            update_post_meta($id, 'lat', $location['lat']);
                            update_post_meta($id, 'lng', $location['lng']);
                            $exists = false;
                            foreach ($fields as $field) {
                                if ($field['id'] === 'lat' || $field['id'] === 'lng') {
                                    $exists = true;
                                    break;
                                }
                            }
                            if (!$exists) {
                                $fields[] = array('id' => 'lat', 'name' => 'lat', 'visible' => false, 'auxiliary' => true);
                                $fields[] = array('id' => 'lng', 'name' => 'lng', 'visible' => false, 'auxiliary' => true);
                                update_option('azt-item-fields', $fields);
                            }
                        }
                        break;
                    }
                }
            }
            wp_update_post(array(
                'ID' => $id,
                'post_content' => wp_slash(json_encode(azt_map_get_item_fields($id))),
            ));
        }
    }
    wp_die();
}

add_action('wp_ajax_azt_duplicate_item', 'azt_duplicate_item');

function azt_duplicate_item() {
    if (isset($_POST['id'])) {
        $post = get_post((int) $_POST['id']);
        azh_clone_post($post);
    }
}

add_action('wp_ajax_azt_delete_item', 'azt_delete_item');

function azt_delete_item() {
    if (isset($_POST['id'])) {
        wp_delete_post((int) $_POST['id']);
        wp_die();
    }
}

add_action('wp_ajax_azt_save_settings', 'azt_save_settings');

function azt_save_settings() {
    if (isset($_POST['settings'])) {
        $settings = get_option('azt-settings', array());
        if (!empty($_POST['settings'])) {
            $settings = array_replace($settings, azt_recursive_sanitize_text_field($_POST['settings']));
        }
        update_option('azt-settings', $settings);
        wp_die();
    }
}

function azt_remove_utf8_bom($text) {
    $bom = pack('H*', 'EFBBBF');
    $text = preg_replace("/^$bom/", '', $text);
    return $text;
}

add_action('wp_ajax_azt_items_import', 'azt_items_import');

function azt_items_import() {
    if (isset($_POST['file_path']) && isset($_POST['options']) && isset($_POST['mapping']) && isset($_POST['position']) && is_numeric($_POST['position'])) {
        global $wpdb;
        $imported = 0;
        $position = 0;
        $id_fields = array();
        if (isset($_POST['options']['id_fields'])) {
            $id_fields = azt_recursive_sanitize_text_field($_POST['options']['id_fields']);
        }
        if (($handle = fopen(sanitize_text_field($_POST['file_path']), 'r')) !== false) {
            $header = fgetcsv($handle);
            $header = array_map("azt_remove_utf8_bom", $header);
            if ($_POST['position'] > 0) {
                fseek($handle, (int) $_POST['position']);
            }
            while (($data = fgetcsv($handle)) !== false) {
                $imported++;
                if (count($header) == count($data)) {
                    $row = array_combine($header, $data);
                    if ($row) {
                        $existing = array();
                        foreach ($_POST['mapping'] as $name => $field_name) {
                            if (isset($id_fields[$name]) && $id_fields[$name]) {
                                if (!empty($row[$name])) {
                                    $ids = $wpdb->get_col($wpdb->prepare("SELECT m.post_id FROM {$wpdb->postmeta} as m INNER JOIN {$wpdb->posts} as p ON m.post_id = p.id WHERE p.post_type = 'azt_item' AND m.meta_key = %s AND m.meta_value = %s", $field_name, sanitize_text_field($row[$name])));
                                    $existing = array_merge($existing, $ids);
                                }
                            } else {
                                
                            }
                        }
                        $existing = array_unique($existing);

                        if (empty($existing)) {
                            $item_id = wp_insert_post(array(
                                'post_title' => '',
                                'post_type' => 'azt_item',
                                'post_status' => 'publish',
                                    ), true);
                            if (!is_wp_error($item_id)) {
                                foreach ($_POST['mapping'] as $name => $field_name) {
                                    update_post_meta($item_id, sanitize_text_field($field_name), sanitize_text_field($row[$name]));
                                }
                                wp_update_post(array(
                                    'ID' => $item_id,
                                    'post_content' => wp_slash(json_encode(azt_map_get_item_fields($item_id))),
                                ));
                            }
                        } else {
                            switch ($_POST['options']['existing_items']) {
                                case 'skip':
                                    break;
                                case 'overwrite':
                                    foreach ($existing as $item_id) {
                                        foreach ($_POST['mapping'] as $name => $field_name) {
                                            update_post_meta($item_id, sanitize_text_field($field_name), sanitize_text_field($row[$name]));
                                        }
                                        wp_update_post(array(
                                            'ID' => $item_id,
                                            'post_content' => wp_slash(json_encode(azt_map_get_item_fields($item_id))),
                                        ));
                                    }
                                    break;
                                case 'merge':
                                    foreach ($existing as $item_id) {
                                        foreach ($_POST['mapping'] as $name => $field_name) {
                                            if (!get_post_meta($item_id, sanitize_text_field($field_name))) {
                                                update_post_meta($item_id, sanitize_text_field($field_name), sanitize_text_field($row[$name]));
                                            }
                                        }
                                        wp_update_post(array(
                                            'ID' => $item_id,
                                            'post_content' => wp_slash(json_encode(azt_map_get_item_fields($item_id))),
                                        ));
                                    }
                                    break;
                            }
                        }
                    }
                }
                unset($data);
                if ($imported > 10) {
                    $position = ftell($handle);
                    break;
                }
            }
            fclose($handle);
        }
        print json_encode(array(
            'position' => $position,
            'imported' => $imported
        ));
    } else {
        $file_name = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);
        if ($file_name) {
            $file_path = get_temp_dir() . $file_name;
            $hSource = fopen('php://input', 'r');
            $hDest = fopen($file_path, 'w');
            while (!feof($hSource)) {
                $chunk = fread($hSource, 1024);
                fwrite($hDest, $chunk);
            }
            fclose($hSource);
            fclose($hDest);


            $examples = array();
            $total = 0;
            if (($handle = fopen($file_path, 'r')) !== false) {
                $header = fgetcsv($handle);
                $header = array_map("azt_remove_utf8_bom", $header);
                while (($data = fgetcsv($handle)) !== false) {
                    $total++;
                    if (count($examples) < 5) {
                        $examples[] = array_combine($header, $data);
                    }
                    unset($data);
                }
                fclose($handle);
            }

            print json_encode(array(
                'examples' => $examples,
                'file_path' => $file_path,
                'total' => $total,
            ));
        }
    }
    wp_die();
}

add_action('wp_ajax_azt_geocoding', 'azt_geocoding');

function azt_geocoding() {
    if (isset($_POST['position']) && is_numeric($_POST['position'])) {
        $args = array(
            'post_type' => 'azt_item',
            'post_status' => 'publish',
            'ignore_sticky_posts' => 1,
            'offset' => (int) $_POST['position'],
            'posts_per_page' => 10,
            'meta_query' => array(
                'relation' => 'AND',
                array(
                    'key' => 'lat',
                    'compare' => 'NOT EXISTS'
                ),
                array(
                    'key' => 'lng',
                    'compare' => 'NOT EXISTS'
                ),
            )
        );
        $query = new WP_Query($args);
        $fields = get_option('azt-item-fields');
        $items = array();
        if ($query->post_count && !empty($fields)) {
            foreach ($query->posts as $post) {
                $item = array('id' => $post->ID);
                foreach ($fields as $field) {
                    $item[strtolower($field['id'])] = get_post_meta($post->ID, $field['id'], true);
                }
                $items[] = $item;
            }
        }
        print json_encode(array(
            'items' => $items,
            'found' => $query->found_posts,
        ));
    }
    wp_die();
}

add_action('wp_ajax_azt_items_remove', 'azt_items_remove');

function azt_items_remove() {
    $posts = get_posts(array(
        'post_type' => 'azt_item',
        'posts_per_page' => '-1',
    ));
    $ids = array();
    foreach ($posts as $post) {
        $ids[] = $post->ID;
    }
    global $wpdb;
    $ids = implode(',', $ids);
    $wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE post_id IN ({$ids})");
    $wpdb->query("DELETE FROM {$wpdb->posts} WHERE ID IN ({$ids})");
    wp_die();
}

function azt_filesystem() {
    static $creds = false;

    require_once ABSPATH . '/wp-admin/includes/template.php';
    require_once ABSPATH . '/wp-admin/includes/file.php';

    if ($creds === false) {
        if (false === ( $creds = request_filesystem_credentials(admin_url()) )) {
            exit();
        }
    }

    if (!WP_Filesystem($creds)) {
        request_filesystem_credentials(admin_url(), '', true);
        exit();
    }
}

add_action('init', 'azt_map_init');

function azt_map_init() {
    if (is_admin()) {
        include_once(AZT_DIR . 'tgm/class-tgm-plugin-activation.php' );
    }
    if (defined('AZH_VERSION')) {
        $post_id = get_option('azt-azh-widget');
        if (is_admin() && isset($_GET['page']) && $_GET['page'] === 'azt-dashboard') {
            if (!get_post($post_id)) {
                $post_id = false;
            }
        }
        if (!$post_id) {
            $post_id = wp_insert_post(array(
                'post_title' => 'azexo-store-locator',
                'post_type' => 'azh_widget',
                'post_status' => 'publish',
                'post_content' => file_get_contents(AZT_DIR . 'default_template.html'),
                    ), true);
            update_option('azt-azh-widget', $post_id);
        }
    }
    if (!get_option('azt-demo-imported')) {
        update_option('azt-demo-imported', true);
        azt_filesystem();
        global $wp_filesystem;
        $items = $wp_filesystem->get_contents(plugin_dir_path(__FILE__) . 'demo_items.json');
        if ($items) {
            $items = json_decode($items, true);
            if (is_array($items)) {
                foreach ($items as $item) {
                    $post_id = wp_insert_post(array(
                        'post_title' => '',
                        'post_type' => 'azt_item',
                        'post_status' => 'publish',
                        'post_author' => get_current_user_id(),
                        'post_content' => '',
                            ), true);
                    if (!is_wp_error($post_id)) {
                        $post_id = (int) $post_id;
                        global $wpdb;
                        $values = array();
                        foreach ($item as $key => $value) {
                            $values[] = "($post_id, '" . esc_sql("$key") . "', '" . esc_sql("$value") . "')";
                        }
                        $values = implode(',', $values);
                        $wpdb->query("REPLACE INTO {$wpdb->postmeta} (post_id, meta_key, meta_value) VALUES {$values}");

                        wp_update_post(array(
                            'ID' => $post_id,
                            'post_content' => wp_slash(json_encode(azt_map_get_item_fields($post_id))),
                        ));
                    }
                }
            }
        }
        $options = $wp_filesystem->get_contents(plugin_dir_path(__FILE__) . 'default_options.json');
        if ($options) {
            $options = json_decode($options, true);
            if (is_array($options)) {
                foreach ($options as $name => $option) {
                    update_option($name, $option);
                }
            }
        }
    }
}

add_shortcode('azexo-map', 'azt_map_shortcode');

function azt_map_shortcode($atts, $content = null, $tag = null) {
    if (defined('AZH_VERSION')) {
        $post_id = get_option('azt-azh-widget');
        if ($post_id) {
            $post = get_post($post_id);
            if (!$post) {
                update_option('azt-azh-widget', false);
                return file_get_contents(AZT_DIR . 'default_template.html');
            }
            $content = azh_get_post_content($post);
        } else {
            $content = file_get_contents(AZT_DIR . 'default_template.html');
        }
    } else {
        $content = file_get_contents(AZT_DIR . 'default_template.html');
    }
    include_once(AZT_DIR . 'simple_html_dom.php' );
    $html = str_get_html($content);
    foreach ($html->find('.azt-map-wrapper') as $map_wrapper) {
        $map_wrapper->innertext = $map_wrapper->innertext . '<div class="azt-map-credits"><span style="margin-right: 3px;">Powered by</span><a href="https://azexo.com/" target="_blank">AZEXO</a></div>';
    }
    $content = $html->save();
    return $content;
}

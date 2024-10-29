<?php
$settings = get_option('azt-settings');
?>

<div class="azd-wrapper">
    <div class="azd-loader"><div class="azd-status"></div></div>
    <div class="azd-process"><div class="azd-bar"><div class="azd-operation"></div><div class="azd-status"></div></div></div>
    <div class="azd-sidebar">
        <div class="azd-logo">
            <h2>Store Locator</h2>
        </div>
        <div class="azd-sidebar-menu">
            <div>
                <a class="azd-dialog-toggle" href="#azd-dashboard"><span class="dashicons dashicons-dashboard"></span><?php esc_html_e('Dashboard', 'azd'); ?></a>
            </div>
            <div>
                <a class="azd-dialog-toggle" href="#azd-items"><span class="dashicons dashicons-list-view"></span><?php esc_html_e('Items', 'azd'); ?></a>
            </div>
            <div>
                <a class="azd-dialog-toggle" href="#azd-item-fields"><span class="dashicons dashicons-admin-settings"></span><?php esc_html_e('Item fields', 'azd'); ?></a>
            </div>
            <div>
                <a class="azd-dialog-toggle" href="#azd-customize"><span class="dashicons dashicons-admin-customizer"></span><?php esc_html_e('Template customization', 'azd'); ?></a>
            </div>
            <div>
                <a class="azd-dialog-toggle" href="#azd-settings"><span class="dashicons dashicons-admin-generic"></span><?php esc_html_e('Settings', 'azd'); ?></a>
            </div>
        </div>                
    </div>
    <div class="azd-page-wrapper">
        <div class="azd-header" style="display: none">

            <div class="azd-links">
                <div class="azd-help">
                    <a href="" target="_blank">
                    </a>
                </div>
            </div>
            <div class="azd-utilites">
            </div>
        </div>
        <div class="azd-dialogs">
                <div id="azd-dashboard" class="azd-dialog">
                    <div class="azd-dialog-header">
                        <div class="azd-page-title">
                            <span><?php esc_html_e('Dashboard', 'azd'); ?></span>
                        </div>
                        <div class="azd-actions">
                        </div>
                    </div>
                    <div class="azd-content">
                        <div class="azd-panel">
                            <div class="azd-panel-header">
                                <span class="dashicons dashicons-admin-generic"></span><?php esc_html_e('Dashboard', 'azd'); ?>
                            </div>
                            <div class="azd-panel-content">
                                <p><?php esc_html_e('To use plugin you need create your own Google Map API key then set it in "Settings"', 'azd'); ?></p>
                                <p><?php printf(wp_kses(__('For insert map on page use <strong>[azexo-map]</strong> shortcode', 'azd'), array('strong' => array()))); ?></p>
                            </div>
                        </div>

                    </div>
                </div>
                <div id="azd-items" class="azd-dialog">
                    <div class="azd-dialog-header">
                        <div class="azd-page-title">
                            <span><?php esc_html_e('Items', 'azd'); ?></span>
                        </div>
                        <div class="azd-actions">
                            <a href="#" class="azd-add-item"><?php esc_html_e('Add an Item', 'azd'); ?></a>
                            <a href="#" class="azd-items-import"><?php esc_html_e('Import CSV', 'azd'); ?></a>
                            <a href="#" class="azd-geocoding"><?php esc_html_e('Fetch Missing Coordinates', 'azd'); ?></a>
                            <a href="#" class="azd-items-remove"><?php esc_html_e('Remove all items', 'azd'); ?></a>
                        </div>
                    </div>
                    <div class="azd-content">
                        <div class="azd-panel">
                            <div class="azd-panel-header">
                                <span class="dashicons dashicons-list-view"></span><?php esc_html_e('List of items', 'azd'); ?>
                            </div>
                            <div class="azd-panel-content">
                                <table class="azd-items">
                                </table>
                            </div>

                        </div>

                    </div>
                </div>
                <div id="azd-item-fields" class="azd-dialog">
                    <div class="azd-dialog-header">
                        <div class="azd-page-title">
                            <span><?php esc_html_e('Item fields', 'azd'); ?></span>
                        </div>
                        <div class="azd-actions">
                            <a href="#" class="azd-add-field"><?php esc_html_e('Add a Field', 'azd'); ?></a>
                        </div>
                    </div>
                    <div class="azd-content">
                        <div class="azd-panel">
                            <div class="azd-panel-header">
                                <span class="dashicons dashicons-admin-settings"></span><?php esc_html_e('List of fields', 'azd'); ?>
                            </div>
                            <div class="azd-panel-content">
                                <table class="azd-fields">
                                    <thead>
                                        <tr>
                                            <th><?php esc_html_e('Actions', 'azd'); ?></th>
                                            <th><?php esc_html_e('Field ID', 'azd'); ?></th>
                                            <th><?php esc_html_e('Name', 'azd'); ?></th>
                                            <th><?php esc_html_e('Type', 'azd'); ?></th>
                                            <th><?php esc_html_e('Group', 'azd'); ?></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    <script type="text/plain" data-liquid="">
                                        {% if fields %}
                                            {% for field in fields %}
                                                <tr data-id="{{ field.id }}">
                                                    <td class="azd-actions">
                                                        <a href="#" class="azd-edit" title="<?php esc_html_e('Edit', 'azd'); ?>"><span class="dashicons dashicons-edit"></span></a>
                                                        <a href="#" class="azd-duplicate" title="<?php esc_html_e('Duplicate', 'azd'); ?>"><span class="dashicons dashicons-admin-page"></span></a>
                                                        <a href="#" class="azd-delete" title="<?php esc_html_e('Delete', 'azd'); ?>"><span class="dashicons dashicons-trash"></span></a>
                                                    </td>
                                                    <td class="azd-id">                                                            
                                                        {{ field.id }}
                                                    </td>
                                                    <td class="azd-name">                                                            
                                                        {{ field.name }}
                                                    </td>
                                                    <td class="azd-type">                                                            
                                                        {{ field.type }}
                                                    </td>
                                                    <td class="azd-group">
                                                        {{ field.group }}
                                                    </td>
                                                </tr>
                                            {% endfor %}
                                        {% else %}
                                        <tr>
                                            <td colspan="2">
                                                <?php esc_html_e('No Fields', 'azd'); ?>
                                            </td>
                                        </tr>
                                        {% endif %}
                                        </script>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                <div id="azd-customize" class="azd-dialog">
                    <div class="azd-dialog-header">
                        <div class="azd-page-title">
                            <span><?php esc_html_e('Template customization', 'azd'); ?></span>
                        </div>
                        <div class="azd-actions">
                        </div>
                    </div>
                    <div class="azd-content">
                        <div class="azd-panel">
                            <div class="azd-panel-header">
                                <span class="dashicons dashicons-admin-customizer"></span><?php esc_html_e('Template customization', 'azd'); ?>
                            </div>
                            <div class="azd-panel-content">
                                <?php if (defined('AZH_VERSION')): ?>
                                    <a href="<?php print add_query_arg('azh', 'customize', get_edit_post_link(get_option('azt-azh-widget'))); ?>" class="btn" target="_blank"><?php esc_html_e('Open customizer', 'azd'); ?></a>                                    
                                <?php else: ?>
                                    <a href="<?php print admin_url('themes.php?page=tgmpa-install-plugins'); ?>" class="btn"><?php esc_html_e('Install customizer (Page builder by AZEXO)', 'azd'); ?></a>
                                <?php endif; ?>
                                    <!--<a href="<?php print get_permalink(get_option('azt-azh-widget')); ?>" class="btn" target="_blank"><?php esc_html_e('Preview', 'azd'); ?></a>-->
                            </div>
                        </div>
                    </div>
                </div>

                <div id="azd-settings" class="azd-dialog">
                    <div class="azd-dialog-header">
                        <div class="azd-page-title">
                            <span><?php esc_html_e('Settings', 'azd'); ?></span>
                        </div>
                        <div class="azd-actions">
                        </div>
                    </div>
                    <div class="azd-content">
                        <div class="azd-panel">
                            <div class="azd-panel-header">
                                <span class="dashicons dashicons-admin-generic"></span><?php esc_html_e('Settings', 'azd'); ?>
                            </div>
                            <div class="azd-panel-content">
                                <form class="azd-settings">
                                    <div class="azd-field">
                                        <?php if (empty($settings['gmap_api_key'])): ?>
                                            <div style="color: red"><?php esc_html_e('Please create your Google Map API Key and enter here', 'azd'); ?></div>
                                        <?php endif; ?>
                                        <label><?php esc_html_e('Google Map API Key', 'azd'); ?></label>
                                        <input type="text" name="gmap_api_key" value="<?php print empty($settings['gmap_api_key']) ? '' : $settings['gmap_api_key']; ?>">
                                        <div>
                                            <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank"><?php esc_html_e('How to get API key', 'azd'); ?></a>
                                        </div>
                                    </div>      
                                    <div class="azd-field">
                                        <label><?php esc_html_e('Default map zoom', 'azd'); ?></label>
                                        <input type="number" name="default_zoom" value="<?php print empty($settings['default_zoom']) ? '' : $settings['default_zoom']; ?>" min="5" step="1" max="20">
                                    </div>      
                                    <button><?php esc_html_e('Save', 'azd'); ?></button>

                                </form>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
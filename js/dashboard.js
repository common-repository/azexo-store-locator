(function ($) {
    "use strict";
    window.gm_authFailure = function () {
    }
    $(function () {
        var dateFormat = (function () {
            var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|"[^"]*"|'[^']*'/g;
            var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
            var timezoneClip = /[^-+\dA-Z]/g;

            // Regexes and supporting functions are cached through closure
            return function (date, mask, utc, gmt) {

                // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
                if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
                    mask = date;
                    date = undefined;
                }

                date = date || new Date;

                if (!(date instanceof Date)) {
                    date = new Date(date);
                }

                if (isNaN(date)) {
                    throw TypeError('Invalid date');
                }

                mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);

                // Allow setting the utc/gmt argument via the mask
                var maskSlice = mask.slice(0, 4);
                if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
                    mask = mask.slice(4);
                    utc = true;
                    if (maskSlice === 'GMT:') {
                        gmt = true;
                    }
                }

                var _ = utc ? 'getUTC' : 'get';
                var d = date[_ + 'Date']();
                var D = date[_ + 'Day']();
                var m = date[_ + 'Month']();
                var y = date[_ + 'FullYear']();
                var H = date[_ + 'Hours']();
                var M = date[_ + 'Minutes']();
                var s = date[_ + 'Seconds']();
                var L = date[_ + 'Milliseconds']();
                var o = utc ? 0 : date.getTimezoneOffset();
                var W = getWeek(date);
                var N = getDayOfWeek(date);
                var flags = {
                    d: d,
                    dd: pad(d),
                    ddd: dateFormat.i18n.dayNames[D],
                    dddd: dateFormat.i18n.dayNames[D + 7],
                    m: m + 1,
                    mm: pad(m + 1),
                    mmm: dateFormat.i18n.monthNames[m],
                    mmmm: dateFormat.i18n.monthNames[m + 12],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(Math.round(L / 10)),
                    t: H < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1],
                    tt: H < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3],
                    T: H < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5],
                    TT: H < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7],
                    Z: gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                    o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
                    W: W,
                    N: N
                };

                return mask.replace(token, function (match) {
                    if (match in flags) {
                        return flags[match];
                    }
                    return match.slice(1, match.length - 1);
                });
            };
        })();
        dateFormat.masks = {
            'default': 'ddd mmm dd yyyy HH:MM:ss',
            'shortDate': 'm/d/yy',
            'mediumDate': 'mmm d, yyyy',
            'longDate': 'mmmm d, yyyy',
            'fullDate': 'dddd, mmmm d, yyyy',
            'shortTime': 'h:MM TT',
            'mediumTime': 'h:MM:ss TT',
            'longTime': 'h:MM:ss TT Z',
            'isoDate': 'yyyy-mm-dd',
            'isoTime': 'HH:MM:ss',
            'isoDateTime': 'yyyy-mm-dd\'T\'HH:MM:sso',
            'isoUtcDateTime': 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
            'expiresHeaderFormat': 'ddd, dd mmm yyyy HH:MM:ss Z'
        };
        dateFormat.i18n = {
            dayNames: [
                'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
            ],
            monthNames: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
            ],
            timeNames: [
                'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
            ]
        };
        function pad(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) {
                val = '0' + val;
            }
            return val;
        }
        function getWeek(date) {
            // Remove time components of date
            var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            // Change date to Thursday same week
            targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

            // Take January 4th as it is always in week 1 (see ISO 8601)
            var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

            // Change date to Thursday same week
            firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

            // Check if daylight-saving-time-switch occurred and correct for it
            var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
            targetThursday.setHours(targetThursday.getHours() - ds);

            // Number of weeks between target Thursday and first Thursday
            var weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
            return 1 + Math.floor(weekDiff);
        }
        function getDayOfWeek(date) {
            var dow = date.getDay();
            if (dow === 0) {
                dow = 7;
            }
            return dow;
        }
        function kindOf(val) {
            if (val === null) {
                return 'null';
            }

            if (val === undefined) {
                return 'undefined';
            }

            if (typeof val !== 'object') {
                return typeof val;
            }

            if (Array.isArray(val)) {
                return 'array';
            }

            return {}.toString.call(val)
                    .slice(8, -1).toLowerCase();
        }
        function makeid() {
            var text = "id";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }
        function toCsvValue(theValue, sDelimiter) {
            var t = typeof (theValue), output;
            if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
                sDelimiter = '"';
            }

            if (t === "undefined" || t === null) {
                output = "";
            } else if (t === "string") {
                output = sDelimiter + theValue + sDelimiter;
            } else {
                output = String(theValue);
            }

            return output;
        }
        function toCsv(objArray, sDelimiter, cDelimiter) {
            var i, l, names = [], name, value, obj, row, output = "", n, nl;
            // Initialize default parameters.
            if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
                sDelimiter = '"';
            }
            if (typeof (cDelimiter) === "undefined" || cDelimiter === null) {
                cDelimiter = ",";
            }

            for (i = 0, l = objArray.length; i < l; i += 1) {
                // Get the names of the properties.
                obj = objArray[i];
                row = "";
                if (i === 0) {
                    // Loop through the names
                    for (name in obj) {
                        if (obj.hasOwnProperty(name)) {
                            names.push(name);
                            row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
                        }
                    }
                    row = row.substring(0, row.length - 1);
                    output += row;
                }

                output += "\n";
                row = "";
                for (n = 0, nl = names.length; n < nl; n += 1) {
                    name = names[n];
                    value = obj[name];
                    if (n > 0) {
                        row += ",";
                    }
                    row += toCsvValue(value, '"');
                }
                output += row;
            }

            return output;
        }
        function hexToRgbA(hex, alpha) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length === 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
            }
            return hex;
        }
        function dateToStr(d) {
            var day = ("0" + d.getDate()).slice(-2);
            var month = ("0" + (d.getMonth() + 1)).slice(-2);
            var date = d.getFullYear() + "-" + (month) + "-" + (day);
            return date;
        }
        function open_simple_modal(options, value, callback) {
            var $modal = $('<div class="azd-modal"></div>');
            $('<div class="azd-modal-title">' + options['title'] + '</div>').appendTo($modal);
            $('<div class="azd-modal-desc">' + options['desc'] + '</div>').appendTo($modal);
            $('<div class="azd-modal-label">' + options['label'] + '</div>').appendTo($modal);
            if ('options' in options) {
                var $select = $('<select class="azd-modal-control"></select>').appendTo($modal).on('change', function () {
                    value = $(this).find('option:selected').attr('value');
                });
                for (var v in options['options']) {
                    if (v === value) {
                        $('<option value="' + v + '" selected>' + options['options'][v] + '</option>').appendTo($select);
                    } else {
                        $('<option value="' + v + '">' + options['options'][v] + '</option>').appendTo($select);
                    }
                }
                $select.trigger('change');
            } else {
                $('<input type="text" value="' + value + '" class="azd-modal-control">').appendTo($modal).on('change', function () {
                    value = $(this).val();
                });
            }
            var $actions = $('<div class="azd-modal-actions"></div>').appendTo($modal);
            $('<div class="azd-modal-ok">' + azt.i18n.ok + '</div>').appendTo($actions).on('click', function () {
                $.simplemodal.close();
                setTimeout(function () {
                    callback(value);
                }, 0);
                return false;
            });
            $('<div class="azd-modal-cancel">' + azt.i18n.cancel + '</div>').appendTo($actions).on('click', function () {
                $.simplemodal.close();
                return false;
            });
            $modal.simplemodal({
                position: ['100px', ''],
                autoResize: true,
                overlayClose: true,
                opacity: 0,
                overlayCss: {
                    "background-color": "black"
                },
                closeClass: "azd-close",
                onClose: function () {
                    setTimeout(function () {
                        $.simplemodal.close();
                    }, 0);
                }
            });
        }
        function open_mapping_modal(examples, total, callback) {
            var $modal = $('<div class="azd-modal"></div>');
            var mapping = {};
            var options = {
                id_fields: {},
                existing_items: 'skip'
            };
            $('<div class="azd-modal-title">' + azt.i18n.select_columns + '</div>').appendTo($modal);
            $('<div class="azd-modal-desc">' + azt.i18n.define_which_column_represents_which_field + '</div>').appendTo($modal);
            var $table = $('<table></table>');
            var $head = $('<thead></thead>').appendTo($table);
            $head = $('<tr></tr>').appendTo($head);
            for (var name in examples[0]) {
                (function (name) {
                    var $select = $('<select></select>').on('change', function () {
                        if ($(this).val() === 'id') {
                            $(this).val('');
                            alert(azt.i18n.reserved_field_id);
                            return;
                        }
                        if ($(this).val() === '') {
                            $input.show();
                            $checkbox.hide();
                        } else {
                            $input.hide();
                            $checkbox.show();
                        }
                        if ($(this).val()) {
                            mapping[name] = $(this).val();
                        } else {
                            delete mapping[name];
                        }
                    });
                    $('<option value="">' + azt.i18n.select_available_field + '</option>').appendTo($select);
                    azt.fields.forEach(function (field, i) {
                        $('<option value="' + field.id + '">' + field.name + '</option>').appendTo($select);
                    });
                    var $input = $('<input type="text" placeholder="' + azt.i18n.or_define_new_field_name + '" value="">').on('change', function () {
                        var $input = $(this);
                        if ($input.val() === 'id') {
                            $input.val('');
                            alert(azt.i18n.reserved_field_id);
                            return;
                        }
                        if (!$input.val().match(/^[a-z0-9\_]+$/)) {
                            $input.select();
                            alert(azt.i18n.field_id_must_be_latin_lowercase_characters_without_spaces);
                            setTimeout(function () {
                                $input.val('');
                                $input.focus();
                            }, 1000);
                            return;
                        }
                        if ($input.val()) {
                            mapping[name] = $input.val();
                        } else {
                            delete mapping[name];
                        }
                    });
                    var $checkbox = $('<div class="azd-id-field"></div>');
                    $('<input id="azd-id-field-' + name + '" type="checkbox" value="' + name + '">').on('change', function () {
                        if ($(this).prop('checked')) {
                            options.id_fields[name] = true;
                            $existing_items.show();
                            $.simplemodal.update($('.azd-modal').outerHeight());
                        } else {
                            options.id_fields[name] = false;
                            var exists = false;
                            for (var n in options.id_fields) {
                                if (options.id_fields[n]) {
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists) {
                                $existing_items.hide();
                                $.simplemodal.update($('.azd-modal').outerHeight());
                            }
                        }
                    }).appendTo($checkbox);
                    $checkbox.append('<div class="azd-checkbox"><label for="azd-id-field-' + name + '"></label></div><span class="azd-label">' + azt.i18n.use_as_id + '</span>');
                    var $tr = $('<th><div>' + name + '</div></th>').appendTo($head);
                    $tr.find('div').after($select);
                    $select.after($input);
                    $input.after($checkbox);
                    $checkbox.hide();
                })(name);
            }
            var $body = $('<tbody></tbody>').appendTo($table);
            $(examples).each(function () {
                var $tr = $('<tr></tr>').appendTo($body);
                for (var name in this) {
                    $('<td>' + this[name] + '</td>').appendTo($tr);
                }
            });
            var $tr = $('<tr></tr>').appendTo($body);
            for (var name in examples[0]) {
                $('<td>...</td>').appendTo($tr);
            }
            var $options = $('<div class="azd-import-options"></div>');
            var $existing_items = $('<div class="azd-option"><div class="azd-option-title">' + azt.i18n.existing_items + '</div></div>').appendTo($options);
            var $radio = $('<div class="azd-radio"></div>').appendTo($existing_items);
            $('<input id="azd-skip" value="skip" checked name="azd-existing-items" type="radio">').appendTo($radio).on('change', function () {
                if ($(this).prop('checked')) {
                    options.existing_items = $(this).val();
                }
            });
            $('<label for="azd-skip">' + azt.i18n.skip + '</label>').appendTo($radio);
            $('<input id="azd-overwrite" value="overwrite" name="azd-existing-items" type="radio">').appendTo($radio).on('change', function () {
                if ($(this).prop('checked')) {
                    options.existing_items = $(this).val();
                }
            });
            $('<label for="azd-overwrite">' + azt.i18n.overwrite + '</label>').appendTo($radio);
            $('<input id="azd-merge" value="merge" name="azd-existing-items" type="radio">').appendTo($radio).on('change', function () {
                if ($(this).prop('checked')) {
                    options.existing_items = $(this).val();
                }
            });
            $('<label for="azd-merge">' + azt.i18n.merge + '</label>').appendTo($radio);
            $existing_items.hide();
            var $mapping = $('<div class="azd-mapping"></div>').appendTo($modal);
            $table.appendTo($mapping);
            $options.appendTo($modal);
            var $actions = $('<div class="azd-modal-actions"></div>').appendTo($modal);
            $('<div class="azd-modal-ok">' + azt.i18n.import + ' ' + total + ' ' + azt.i18n.rows + '</div>').appendTo($actions).on('click', function () {
                $.simplemodal.close();
                setTimeout(function () {
                    callback(options, mapping);
                }, 0);
                return false;
            });
            $('<div class="azd-modal-cancel">' + azt.i18n.cancel + '</div>').appendTo($actions).on('click', function () {
                $.simplemodal.close();
                return false;
            });
            $modal.simplemodal({
                position: ['100px', ''],
                autoResize: true,
                overlayClose: true,
                opacity: 0,
                overlayCss: {
                    "background-color": "black"
                },
                closeClass: "azd-close",
                onClose: function () {
                    $.simplemodal.close();
                }
            });
        }
        function open_alert(title, desc, callback) {
            var $modal = $('<div class="azd-modal"></div>');
            if (title) {
                $('<div class="azd-modal-title">' + title + '</div>').appendTo($modal);
            }
            if (desc) {
                desc = desc.replace(/href="\//g, 'href="https://' + azd.domain + '/');
                $('<div class="azd-modal-desc">' + desc + '</div>').appendTo($modal);
            }
            var $actions = $('<div class="azd-modal-actions"></div>').appendTo($modal);
            $('<div class="azd-modal-ok">' + azd.i18n.ok + '</div>').appendTo($actions).on('click', function () {
                $.simplemodal.close();
                setTimeout(function () {
                    callback();
                }, 0);
                return false;
            });
            $('<div class="azd-modal-cancel">' + azd.i18n.cancel + '</div>').appendTo($actions).on('click', function () {
                $.simplemodal.close();
                return false;
            });
            $modal.simplemodal({
                position: ['100px', ''],
                autoResize: true,
                overlayClose: true,
                opacity: 0,
                overlayCss: {
                    "background-color": "black"
                },
                closeClass: "azd-close",
                onClose: function () {
                    $.simplemodal.close();
                }
            });
        }
        function open_modal(options, values, validate, callback) {
            var $modal = $('<div class="azd-modal"></div>');
            $('<div class="azd-modal-title">' + options['title'] + '</div>').appendTo($modal);
            $('<div class="azd-modal-desc">' + options['desc'] + '</div>').appendTo($modal);
            var $controls = $('<div class="azd-modal-controls"></div>').appendTo($modal);
            if ('fields' in options) {
                for (var name in options['fields']) {
                    (function (name) {
                        var field = options['fields'][name];
                        if (field.auxiliary != '1') {
                            var $control = $('<div class="azd-modal-control" data-group="' + (field.group ? field.group : '') + '"></div>').appendTo($controls);
                            $('<div class="azd-modal-label">' + field['label'] + '</div>').appendTo($control);
                            if ('options' in field) {
                                var $select = $('<select ' + (('multiple' in field && field['label']) ? 'multiple' : '') + '></select>').appendTo($control).on('change', function () {
                                    if (('multiple' in field && field['label'])) {
                                        values[name] = $(this).find('option:selected').map(function () {
                                            return $(this).attr('value');
                                        }).toArray();
                                    } else {
                                        values[name] = $(this).find('option:selected').attr('value');
                                    }
                                });
                                for (var value in field['options']) {
                                    if (values[name] && (value === values[name] || ('multiple' in field && values[name].indexOf(value) >= 0))) {
                                        $('<option value="' + value + '" selected>' + field['options'][value] + '</option>').appendTo($select);
                                    } else {
                                        $('<option value="' + value + '">' + field['options'][value] + '</option>').appendTo($select);
                                    }
                                }
                                $select.trigger('change');
                            } else {
                                function fill_hours($select) {
                                    var hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
                                    hours.forEach(function (hour, i) {
                                        $('<option value="' + hour + '" ' + (i ? '' : 'selected') + '>' + hour + '</option>').appendTo($select);
                                    });
                                }
                                function fill_minutes($select) {
                                    var minutes = ['00', '15', '30', '45'];
                                    minutes.forEach(function (minute, i) {
                                        $('<option value="' + minute + '" ' + (i ? '' :
                                                'selected') + '>' + minute + '</option>').appendTo($select);
                                    });
                                }
                                function fill_timezone($select) {
                                    $select.append(
                                            '<option value="-1200">UTC-12</option>' +
                                            '<option value="-1130">UTC-11:30</option>' +
                                            '<option value="-1100">UTC-11</option>' +
                                            '<option value="-1030">UTC-10:30</option>' +
                                            '<option value="-1000">UTC-10</option>' +
                                            '<option value="-0930">UTC-9:30</option>' +
                                            '<option value="-0900">UTC-9</option>' +
                                            '<option value="-0830">UTC-8:30</option>' +
                                            '<option value="-0800">UTC-8</option>' +
                                            '<option value="-0730">UTC-7:30</option>' +
                                            '<option value="-0700">UTC-7</option>' +
                                            '<option value="-0630">UTC-6:30</option>' +
                                            '<option value="-0600">UTC-6</option>' +
                                            '<option value="-0530">UTC-5:30</option>' +
                                            '<option value="-0500">UTC-5</option>' +
                                            '<option value="-0430">UTC-4:30</option>' +
                                            '<option value="-0400">UTC-4</option>' +
                                            '<option value="-0330">UTC-3:30</option>' +
                                            '<option value="-0300">UTC-3</option>' +
                                            '<option value="-0230">UTC-2:30</option>' +
                                            '<option value="-0200">UTC-2</option>' +
                                            '<option value="-0130">UTC-1:30</option>' +
                                            '<option value="-0100">UTC-1</option>' +
                                            '<option value="-0030">UTC-0:30</option>' +
                                            '<option value="+0000" selected>UTC+0</option>' +
                                            '<option value="+0030">UTC+0:30</option>' +
                                            '<option value="+0100">UTC+1</option>' +
                                            '<option value="+0130">UTC+1:30</option>' +
                                            '<option value="+0200">UTC+2</option>' +
                                            '<option value="+0230">UTC+2:30</option>' +
                                            '<option value="+0300">UTC+3</option>' +
                                            '<option value="+0330">UTC+3:30</option>' +
                                            '<option value="+0400">UTC+4</option>' +
                                            '<option value="+0430">UTC+4:30</option>' +
                                            '<option value="+0500">UTC+5</option>' +
                                            '<option value="+0530">UTC+5:30</option>' +
                                            '<option value="+0545">UTC+5:45</option>' +
                                            '<option value="+0600">UTC+6</option>' +
                                            '<option value="+0630">UTC+6:30</option>' +
                                            '<option value="+0700">UTC+7</option>' +
                                            '<option value="+0730">UTC+7:30</option>' +
                                            '<option value="+0800">UTC+8</option>' +
                                            '<option value="+0830">UTC+8:30</option>' +
                                            '<option value="+0845">UTC+8:45</option>' +
                                            '<option value="+0900">UTC+9</option>' +
                                            '<option value="+0930">UTC+9:30</option>' +
                                            '<option value="+1000">UTC+10</option>' +
                                            '<option value="+1030">UTC+10:30</option>' +
                                            '<option value="+1100">UTC+11</option>' +
                                            '<option value="+1130">UTC+11:30</option>' +
                                            '<option value="+1200">UTC+12</option>' +
                                            '<option value="+1245">UTC+12:45</option>' +
                                            '<option value="+1300">UTC+13</option>' +
                                            '<option value="+1345">UTC+13:45</option>' +
                                            '<option value="+1400">UTC+14</option>'
                                            );
                                }
                                function timezone_fill_timezone($select) {
                                    $select.append(
                                            '<option value="-12">UTC-12</option>' +
                                            '<option value="-11.5">UTC-11:30</option>' +
                                            '<option value="-11">UTC-11</option>' +
                                            '<option value="-10.5">UTC-10:30</option>' +
                                            '<option value="-10">UTC-10</option>' +
                                            '<option value="-9.5">UTC-9:30</option>' +
                                            '<option value="-9">UTC-9</option>' +
                                            '<option value="-8.5">UTC-8:30</option>' +
                                            '<option value="-8">UTC-8</option>' +
                                            '<option value="-7.5">UTC-7:30</option>' +
                                            '<option value="-7">UTC-7</option>' +
                                            '<option value="-6.5">UTC-6:30</option>' +
                                            '<option value="-6">UTC-6</option>' +
                                            '<option value="-5.5">UTC-5:30</option>' +
                                            '<option value="-5">UTC-5</option>' +
                                            '<option value="-4.5">UTC-4:30</option>' +
                                            '<option value="-4">UTC-4</option>' +
                                            '<option value="-3.5">UTC-3:30</option>' +
                                            '<option value="-3">UTC-3</option>' +
                                            '<option value="-2.5">UTC-2:30</option>' +
                                            '<option value="-2">UTC-2</option>' +
                                            '<option value="-1.5">UTC-1:30</option>' +
                                            '<option value="-1">UTC-1</option>' +
                                            '<option value="-0.5">UTC-0:30</option>' +
                                            '<option value="+0" selected>UTC+0</option>' +
                                            '<option value="+0.5">UTC+0:30</option>' +
                                            '<option value="+1">UTC+1</option>' +
                                            '<option value="+1.5">UTC+1:30</option>' +
                                            '<option value="+2">UTC+2</option>' +
                                            '<option value="+2.5">UTC+2:30</option>' +
                                            '<option value="+3">UTC+3</option>' +
                                            '<option value="+3.5">UTC+3:30</option>' +
                                            '<option value="+4">UTC+4</option>' +
                                            '<option value="+4.5">UTC+4:30</option>' +
                                            '<option value="+5">UTC+5</option>' +
                                            '<option value="+5.5">UTC+5:30</option>' +
                                            '<option value="+5.75">UTC+5:45</option>' +
                                            '<option value="+6">UTC+6</option>' +
                                            '<option value="+6.5">UTC+6:30</option>' +
                                            '<option value="+7">UTC+7</option>' +
                                            '<option value="+7.5">UTC+7:30</option>' +
                                            '<option value="+8">UTC+8</option>' +
                                            '<option value="+8.5">UTC+8:30</option>' +
                                            '<option value="+8.75">UTC+8:45</option>' +
                                            '<option value="+9">UTC+9</option>' +
                                            '<option value="+9.5">UTC+9:30</option>' +
                                            '<option value="+10">UTC+10</option>' +
                                            '<option value="+10.5">UTC+10:30</option>' +
                                            '<option value="+11">UTC+11</option>' +
                                            '<option value="+11.5">UTC+11:30</option>' +
                                            '<option value="+12">UTC+12</option>' +
                                            '<option value="+12.75">UTC+12:45</option>' +
                                            '<option value="+13">UTC+13</option>' +
                                            '<option value="+13.75">UTC+13:45</option>' +
                                            '<option value="+14">UTC+14</option>'
                                            );
                                }
                                var no_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAB8lBMVEUAAABcXFxmZmZnZ2eZmZmampqrq6uwsLC9vb2+vr7AwMDBwcHCwsLExMTFxcXGxsbJycnS0tLT09PZ2dna2trb29vd3d3f39/g4ODl5eXp6enq6urr6+vw8PDy8vLz8/P19fX4+Pj6+vr9/f3////V1dX////////S0tLT09PT09PU1NTAwMDCwsLCwsLOzs7h4eHi4uLk5OTl5eXm5ubPz8/a2trb29ve3t6+vr7R0dHQ0NDU1NTS0tLT09PU1NTDw8PAwMDBwcHR0dHR0dHU1NSoqKjS0tLR0dHS0tLT09POzs7Pz8/Q0NDOzs7Pz8/Ozs7Pz8/Q0NDOzs7Pz8+oqKioqKjPz8+mpqanp6fOzs7Pz8/Q0NDOzs7Pz8+jo6Ojo6OioqLR0dHS0tKjo6PNzc3Ozs6hoaHOzs7Ozs6ioqLNzc3Nzc3Nzc3Nzc3Nzc3Nzc3MzMzNzc2goKDNzc2goKDNzc3Ozs7Nzc3Nzc3Nzc2enp6fn5/Nzc3MzMzNzc3Nzc2enp6enp6enp7Nzc3Nzc3Nzc2dnZ2enp6cnJycnJzMzMzMzMzMzMzNzc3MzMzNzc3Nzc2dnZ2bm5ucnJzNzc3Nzc2bm5ucnJycnJzMzMzMzMzMzMzMzMzMzMzMzMyamprMzMyYmJiZmZmamprMzMyJ6HxFAAAAonRSTlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgIDBgYLCwwMDQ4ODg4ODg8PDw8RFBUVFhYWGhsbGxwcJiYnJyc2NjY3Nzg4OTo6P0BAQkJGRkxOTlVWV1dXWFpaXmJjcHd4eXt9foODhYWGhoaeoKGoqKiqqquwsbKyubq7u8HCxs3Oz9DQ0dTh4u3v8PDy9Pb4+fr7/f5KuRpkAAAEXUlEQVR4Ae2Z6VcUVxDFr1kUYaKORjQuiQpxXDRmiUlQY3DBRaMCmowLjLssw4IiKigusqhxj9EkgCwN9X/mve4+3V1Mk65uOPOpf2c+zXnn3HNfvXqvqhp5JSYmJiYm5nMoKqprLl6sqa6w/5hZPgWOtPW/I4d3/W1H9N8zyZl75MO9M5ghvsDa1gGagoHWtWrBDHCTXN6+6uvt7Xv1llxuYrosxJVhsnjf3XAIDvvru9+TxfAVtWw6bHhKFl1VwGx4mA8c7SSLpxswDdJjpBlpKkUxcigGspbPsTQi8hmyZHID/8M1Msmq5RFYjFukebETqzAly7HjGWluYXEUH3dJ0xIU1YVoJs3dKF5MH0MnIKDK9hIaOx61kLB30IpLSNKkkaoUbDdV0ghDcuOY3ivSZEQqe8yTvDGJEJg5eLxW7gWVZlYiBJetc4WM3It1xi5DymroPH4JRRgvz/U9htUQcoMUvyShyIhVktvc20FAihTXYVEr37GrpEhBRqu+E7GGqdSi9O9xzm8fg2Pucitk6HewCTZu9FNvuMifvgk8AAmLTpMCGu5lsorx+0fggBSnF0HAff1GwUvGo2Lo31RW9Ct2HxJIUbkENhPjf6Wc6Kdun98FlJ99wCxNwGbpYVIgmJJj+j0HXJHxNyk3XwqLgWVzUfbYtmMYrohCv/vHShBIm1rXzUSUipv7J9s76rYggUZT48k33z7xinSrRW0Ipl+ta5jjFWFe1uvo92yehUYdne8SRV8brsiCBrWmH8HoWvQgc+J6cc7Y6L4P8EiJfF/4yU8eERzQFaww7mAizEvGVtlUVKa364cf//BuF2SRr9B1IhcxuQOeLz3Aw9zAQ9eWFQiiWq167SNyKQGe+1vnneNH2OS1WlCNIGrUqr5cEWP3ilPrmJe6leVGrkgfEdUgiAtqVa+PE6CdR78D8HHSS0QXpiHSwaPfLhcRb1f5yjqWL+tOrdgt3y5h4M/N28pzH4lLwsDLj/BDoIfnPu5wEX6Ewyejpqxo02hu7mvEycivlQM+Io/w4b7R3NznIgf1tSK8IOsX5IoYjZi12dyx9Z584SJz2AUZ7qq3aUQCW+o62k/y3A+46mWPloPxuAxzlwHFhWBeJj1av5YIr+HDS5mIw4Oz5cCu87dZ9B2RJZWkgLSQ6IS/iF1I8Oi7TrpYISEviSb8+ecrd8f+jVASYUDSNX3pU/M3mcWdvEwdhgBe86/BiKBMZQX3VQjgNf91ScHNW4dtSQTBav7kz7x1EDVBzxFyx17yJkjWzjVDgBv9Ft7OSRvTyjBejvPGVNxi054CuZch3mLLhwWD2wvEXjTpSGOPwb0IoZKNOMChKgg4MRR+gMNGUc3Bo6iWSKMoNlR7tgPLMSWrsPNF1KEaGw9eC7gdBONBwaBzOAv/QWdp04hg0Cke2XYeBebDw2ygqks8spUPn+v3w+FQAx8+52uMnv8PAvn/tJH/jzT5/9wkJyYmJiYm5j/qBxqDoN+AlgAAAABJRU5ErkJggg==';

                                switch (field.type) {
                                    case 'checkbox':
                                        $('<input id="azd-field-id-' + name + '" type="checkbox" ' + (values[name] && values[name] == '1' ? 'checked' : '') + '>').appendTo($control).on('change', function () {
                                            if ($(this).prop('checked')) {
                                                values[name] = 1;
                                            } else {
                                                values[name] = 0;
                                            }
                                        }).trigger('change');
                                        $control.append('<div class="azd-checkbox"><label for="azd-field-id-' + name + '"></label></div>');
                                        break;
                                    case 'bigtext':
                                        $('<textarea>' + (values[name] ? values[name] : '') + '</textarea>').appendTo($control).on('change', function () {
                                            values[name] = $(this).val();
                                        });
                                        break;
                                    case 'date':
                                        $('<input type="text" value="' + (values[name] ? values[name] : '') + '" readonly>').appendTo($control).air_datepicker({
                                            language: 'en',
                                            onSelect: function (fd, d, picker) {
                                                if (d) {
                                                    values[name] = fd;
                                                }
                                            }
                                        });
                                        break;
                                    case 'datetime':
                                        function change_date() {
                                            values[name] = $date.val() + 'T' + $hours.val() + ':' + $minutes.val();
                                        }
                                        var $row = $('<div class="azd-datetime"></div>').appendTo($control);
                                        var datetime = false;
                                        if (values[name]) {
                                            datetime = values[name];
                                        } else {
                                            var now = new Date();
                                            datetime = dateFormat(now, 'yyyy-mm-dd\'T\'HH:MM');
                                        }
                                        datetime = datetime.split('T');

                                        var $date = $('<input type="text" value="' + datetime[0] + '" readonly>').appendTo($('<div class="azd-date"></div>').appendTo($row)).on('change', change_date).air_datepicker({
                                            language: 'en',
                                            onSelect: function (fd, d, picker) {
                                                change_date();
                                            }
                                        });
                                        var $hours = $('<select></select>').appendTo($('<div class="azd-hours"></div>').appendTo($row)).on('change', change_date);
                                        fill_hours($hours);
                                        $hours.val(datetime[1].split(':')[0]);
                                        $('<div class="azd-delimiter">:</div>').appendTo($row)
                                        var $minutes = $('<select></select>').appendTo($('<div class="azd-minutes"></div>').appendTo($row)).on('change', change_date);
                                        fill_minutes($minutes);
                                        $minutes.val(datetime[1].split(':')[1]);
                                        if (!$minutes.val()) {
                                            $minutes.val('00');
                                        }
                                        change_date();
                                        break;
                                    case 'event':
                                        function change() {
                                            if (!$input.val().match(/^\d+$/)) {
                                                $input.val('1');
                                            }
                                            values[name] = JSON.stringify({
                                                d: $date.val() + 'T' + $hours.val() + ':' + $minutes.val(),
                                                t: $timezone.val(),
                                                a: $all_day.prop('checked') ? '1' : '0',
                                                n: $input.val(),
                                                p: $select.val()
                                            });
                                            if ($select.val() === 'n') {
                                                $input.hide();
                                            } else {
                                                $input.show();
                                            }
                                            if ($all_day.prop('checked')) {
                                                $hours.parent().hide();
                                                $delimiter.hide();
                                                $minutes.parent().hide();
                                            } else {
                                                $hours.parent().show();
                                                $delimiter.show();
                                                $minutes.parent().show();
                                            }
                                        }
                                        var $row1 = $('<div class="azd-event"></div>').appendTo($control);
                                        var event = false;
                                        if (values[name]) {
                                            try {
                                                event = JSON.parse(values[name]);
                                            } catch (e) {
                                            }
                                        }
                                        if (!event) {
                                            var now = new Date();
                                            event = {d: dateFormat(now, 'yyyy-mm-dd\'T\'HH:MM'), t: '+0000', a: '0', n: '1', p: 'n'};
                                        }
                                        var datetime = event.d.split('T');

                                        var $date = $('<input type="text" value="' + datetime[0] + '" readonly>').appendTo($('<div class="azd-date"></div>').appendTo($row1)).on('change', change).air_datepicker({
                                            language: 'en',
                                            onSelect: function (fd, d, picker) {
                                                change();
                                            }
                                        });
                                        var $hours = $('<select></select>').appendTo($('<div class="azd-hours"></div>').appendTo($row1)).on('change', change);
                                        fill_hours($hours);
                                        $hours.val(datetime[1].split(':')[0]);
                                        var $delimiter = $('<div class="azd-delimiter">:</div>').appendTo($row1)
                                        var $minutes = $('<select></select>').appendTo($('<div class="azd-minutes"></div>').appendTo($row1)).on('change', change);
                                        fill_minutes($minutes);
                                        $minutes.val(datetime[1].split(':')[1]);
                                        if (!$minutes.val()) {
                                            $minutes.val('00');
                                        }
                                        var $timezone = $('<select></select>').appendTo($('<div class="azd-timezone"></div>').appendTo($row1)).on('change', change);
                                        fill_timezone($timezone);
                                        if (event.t) {
                                            $timezone.val(event.t);
                                        } else {
                                            $timezone.val('+0000');
                                        }
                                        var $row2 = $('<div class="azd-event"></div>').appendTo($control);
                                        $row2.append('<div class="azd-label">' + azt.i18n.all_day + '</div>');
                                        var $all_day = $('<input id="azd-field-id-' + name + '" type="checkbox" ' + (event.a == '1' ? 'checked' : '') + '>').appendTo($row2).on('change', change);
                                        $row2.append('<div class="azd-checkbox"><label for="azd-field-id-' + name + '"></label></div>');
                                        $row2.append('<div class="azd-label">' + azt.i18n.repeat + '</div>');

                                        var $select = $('<select>' +
                                                '<option value="n">' + azt.i18n.no_repeat + '</option>' +
                                                '<option value="d">' + azt.i18n.day + '</option>' +
                                                '<option value="w">' + azt.i18n.week + '</option>' +
                                                '<option value="m">' + azt.i18n.month + '</option>' +
                                                '<option value="y">' + azt.i18n.year + '</option>' +
                                                '</select>').appendTo($('<div class="azd-period"></div>').appendTo($row2)).on('change', change);
                                        $select.val(event.p);
                                        var $input = $('<input type="number" value="" min="1" step="1">').appendTo($('<div class="azd-number"></div>').appendTo($row2)).on('change', change);
                                        $input.val(event.n);
                                        change();
                                        break;
                                    case 'gallery':
                                        function fill_images(images, $gallery) {
                                            $gallery.empty();
                                            images.forEach(function (value, index) {
                                                if (value) {
                                                    $('<img src="' + value + '">').appendTo($gallery).on('contextmenu', function () {
                                                        var images = values[name].split(',').filter(Boolean);
                                                        var i = images.indexOf($(this).attr('src'));
                                                        if (i >= 0) {
                                                            images.splice(i, 1);
                                                            values[name] = images.join(',');
                                                            fill_images(images, $gallery);
                                                        }
                                                        return false;
                                                    });
                                                }
                                            });
                                            $('<div class="azd-gallery-add"></div>').appendTo($gallery).on('click', function () {
                                                var $this = $(this);
                                                azt.open_image_select_dialog($this, function (image) {
                                                    if (image) {
                                                        var images = values[name].split(',').filter(Boolean);
                                                        var i = images.indexOf(image);
                                                        if (i < 0) {
                                                            images.push(image);
                                                            values[name] = images.join(',');
                                                            fill_images(images, $gallery);
                                                        }
                                                    }
                                                });
                                                return false;
                                            });
                                            $gallery.sortable({
                                                cancel: '.azd-gallery-add',
                                                update: function (event, ui) {
                                                    function array_move(arr, old_index, new_index) {
                                                        if (new_index >= arr.length) {
                                                            var k = new_index - arr.length + 1;
                                                            while (k--) {
                                                                arr.push(undefined);
                                                            }
                                                        }
                                                        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
                                                        return arr;
                                                    }
                                                    var images = values[name].split(',').filter(Boolean);
                                                    var i = images.indexOf(ui.item.attr('src'));
                                                    images = array_move(images, i, ui.item.index());
                                                    values[name] = images.join(',');
                                                    fill_images(images, $gallery);
                                                },
                                            });
                                        }
                                        var $gallery = $('<div class="azd-gallery"></div>').appendTo($control);
                                        fill_images(values[name].split(','), $gallery);
                                        break;
                                    case 'image':
                                        $('<img src="' + (values[name] ? values[name] : no_image) + '">').appendTo($control).on('click', function () {
                                            var $this = $(this);
                                            azt.open_image_select_dialog($this, function (image) {
                                                values[name] = image;
                                                $this.attr('src', image);
                                            });
                                            return false;
                                        }).on('contextmenu', function () {
                                            values[name] = '';
                                            $(this).attr('src', no_image);
                                            return false;
                                        });
                                        break;
                                    case 'timezone':
                                        var $select = $('<select></select>').appendTo($control).on('change', function () {
                                            values[name] = $(this).val();
                                        });
                                        timezone_fill_timezone($select);
                                        if (values[name]) {
                                            $select.val(values[name]);
                                        }
                                        break;
                                    case 'location':
                                        var $searchInput = $('<input type="text" placeholder="' + azt.i18n.search + '">').appendTo($control);
                                        var $mapCanvas = $('<div style="height: 300px; margin: 20px 0;"></div>').appendTo($control);
                                        var $row = $('<div class="azd-2-columns"></div>').appendTo($control);
                                        var $col = $('<div></div>').appendTo($row);
                                        if (typeof values[name] === 'undefined' || values[name] === '') {
                                            values[name] = JSON.stringify({lat: 'lat' in values ? values.lat : 0, lng: 'lng' in values ? values.lng : 0});
                                        }
                                        var location = false;
                                        try {
                                            location = JSON.parse(values[name]);
                                        } catch (e) {
                                            location = {lat: 'lat' in values ? values.lat : 0, lng: 'lng' in values ? values.lng : 0};
                                        }
                                        var $latitude = $('<input type="text" value="' + location.lat + '" placeholder="' + azt.i18n.latitude + '">').appendTo($col).on('change', function () {
                                            var location = false;
                                            try {
                                                location = JSON.parse(values[name]);
                                            } catch (e) {
                                                location = {lat: 'lat' in values ? values.lat : 0, lng: 'lng' in values ? values.lng : 0};
                                            }
                                            location.lat = $(this).val();
                                            values[name] = JSON.stringify(location);
                                        });
                                        var $col = $('<div></div>').appendTo($row);
                                        var $longitude = $('<input type="text" value="' + location.lng + '" placeholder="' + azt.i18n.longitude + '">').appendTo($col).on('change', function () {
                                            var location = false;
                                            try {
                                                location = JSON.parse(values[name]);
                                            } catch (e) {
                                                location = {lat: 'lat' in values ? values.lat : 0, lng: 'lng' in values ? values.lng : 0};
                                            }
                                            location.lng = $(this).val();
                                            values[name] = JSON.stringify(location);
                                        });
                                        init_location_editing($searchInput, $mapCanvas, $latitude, $longitude);
                                        break;
                                    case 'working_hours':
                                        function add_period($periods, period, change, remove) {
                                            $periods.closest('.azd-hours').addClass('azd-periods');
                                            var $period = $('<div class="azd-period"></div>').appendTo($periods);
                                            var $from = $('<div class="azd-from"></div>').appendTo($period);
                                            var $from_hours = $('<select></select>').appendTo($from).on('change', function () {
                                                period.f = $from_hours.val() + ':' + $from_minutes.val();
                                                change();
                                            });
                                            fill_hours($from_hours);
                                            var $from_minutes = $('<select></select>').appendTo($from).on('change', function () {
                                                period.f = $from_hours.val() + ':' + $from_minutes.val();
                                                change();
                                            });
                                            fill_minutes($from_minutes);
                                            var from = period.f.split(':');
                                            if (from.length === 2) {
                                                $from_hours.val(from[0]);
                                                $from_minutes.val(from[1]);
                                            }

                                            var $to = $('<div class="azd-to"></div>').appendTo($period);
                                            var $to_hours = $('<select></select>').appendTo($to).on('change', function () {
                                                period.t = $to_hours.val() + ':' + $to_minutes.val();
                                                change();
                                            });
                                            fill_hours($to_hours);
                                            var $to_minutes = $('<select></select>').appendTo($to).on('change', function () {
                                                period.t = $to_hours.val() + ':' + $to_minutes.val();
                                                change();
                                            });
                                            fill_minutes($to_minutes);
                                            var to = period.t.split(':');
                                            if (to.length === 2) {
                                                $to_hours.val(to[0]);
                                                $to_minutes.val(to[1]);
                                            }
                                            $from_hours.trigger('change');
                                            $to_hours.trigger('change');

                                            $('<div class="azd-delete"><span class="dashicons dashicons-trash"></span></div>').appendTo($period).on('click', function () {
                                                var $this = $(this);
                                                var $periods = $this.closest('.azd-periods');
                                                $this.closest('.azd-period').remove();
                                                remove();
                                                change();
                                                if (!$periods.children().length) {
                                                    $periods.closest('.azd-hours').removeClass('azd-periods');
                                                }
                                            });
                                        }
                                        function remove(days, i, period) {
                                            days[i].p.forEach(function (p, k) {
                                                if (p === period) {
                                                    days[i].p.splice(k, 1);
                                                    return;
                                                }
                                            });
                                        }
                                        if (typeof values[name] === 'undefined' || values[name] === '') {
                                            values[name] = JSON.stringify([
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                            ]);
                                        }
                                        var days = false;
                                        try {
                                            days = JSON.parse(values[name]);
                                        } catch (e) {
                                            days = [
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                                {p: [], o: true},
                                            ];
                                        }
                                        var days_names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                        var $days = $('<table class="azd-working-hours"></table>').appendTo($control);
                                        days_names.forEach(function (day, i) {
                                            var $day = $('<tr></tr>').appendTo($days);
                                            $('<td>' + azt.i18n[day] + '</td>').appendTo($day);
                                            var $hours = $('<td class="azd-hours"></td>').appendTo($day);
                                            var $open_closed = $('<div class="azd-open-closed"></div>').appendTo($hours);
                                            $('<input id="azd-open-closed-id-' + day + '" type="checkbox" ' + (days[i].o ? 'checked' : '') + '>').appendTo($open_closed).on('change', function () {
                                                if ($(this).prop('checked')) {
                                                    days[i].o = true;
                                                } else {
                                                    days[i].o = false;
                                                }
                                                values[name] = JSON.stringify(days);
                                            });
                                            $open_closed.append('<div class="azd-checkbox"><label for="azd-open-closed-id-' + day + '"></label></div>');
                                            $open_closed.append('<span class="azd-open">' + azt.i18n.open_24_hour + '</span><span class="azd-closed">' + azt.i18n.closed + '</span>');
                                            var $periods = $('<div class="azd-periods"></div>').appendTo($hours);
                                            days[i].p.forEach(function (period, j) {
                                                add_period($periods, period, function () {
                                                    values[name] = JSON.stringify(days);
                                                }, function () {
                                                    remove(days, i, period);
                                                });
                                            });

                                            var $add = $('<td class="azd-add"></td>').appendTo($day);
                                            $('<span class="dashicons dashicons-plus"></span>').appendTo($add).on('click', function () {
                                                var period = {
                                                    f: '',
                                                    t: '',
                                                };
                                                days[i].p.push(period);
                                                values[name] = JSON.stringify(days);
                                                add_period($periods, period, function () {
                                                    values[name] = JSON.stringify(days);
                                                }, function () {
                                                    remove(days, i, period);
                                                });
                                            });
                                        });
                                        break;
                                    default:
                                        $('<input type="text" value="' + (values[name] ? values[name] : '') + '">').appendTo($control).on('change', function () {
                                            values[name] = $(this).val();
                                        });
                                        break;
                                }
                            }
                        }
                    })(name);
                }
            }
            var groups = {};
            $controls.find('> [data-group]').each(function () {
                groups[$(this).data('group')] = true;
            });
            groups = Object.keys(groups);
            var $tabs = $('<div class="azd-left-tabs"></div>').appendTo($controls);
            var $tabs_buttons = $('<div></div>').appendTo($tabs);
            var $tabs_content = $('<div></div>').appendTo($tabs);
            var tabs = {};
            $(groups).each(function () {
                var id = makeid();
                $('<span><a href="#' + id + '">' + (this ? this : azt.i18n.general) + '</a></span>').appendTo($tabs_buttons);
                var $group = $controls.find('> [data-group="' + this + '"]').wrapAll('<div id="' + id + '"/>').parent();
                $group.detach().appendTo($tabs_content);
            });
            tabs_init($tabs);
            var $actions = $('<div class="azd-modal-actions"></div>').appendTo($modal);
            $('<div class="azd-modal-ok">' + azt.i18n.ok + '</div>').appendTo($actions).on('click', function () {
                var required = [];
                if ('fields' in options) {
                    for (var name in options['fields']) {
                        var field = options['fields'][name];
                        if ('required' in field && field.required && !$.trim(values[name])) {
                            required.push('<span style="color: red;">' + field['label'] + '</span>');
                        }
                    }
                }
                if (required.length) {
                    var $desc = $modal.find('.azd-modal-desc');
                    $desc.empty();
                    $desc.append('<div style="color: red; font-weight: bold;">' + azt.i18n.list_of_required_fields + '</div>');
                    $desc.append(required.join(', '));
                    return false;
                }
                if (validate && !validate(values)) {
                    return false;
                }
                $.simplemodal.close();
                if (callback) {
                    setTimeout(function () {
                        callback(values);
                    }, 0);
                }
                return false;
            });
            $('<div class="azd-modal-cancel">' + azt.i18n.cancel + '</div>').appendTo($actions).on('click', function () {
                $.simplemodal.close();
                return false;
            });
            var position = ['100px', ''];
            if (document.documentElement.clientWidth < 1000) {
                position = ['10px', ''];
            }
            $modal.simplemodal({
                position: position,
                autoResize: true,
                overlayClose: true,
                opacity: 0,
                overlayCss: {
                    "background-color": "black"
                },
                closeClass: "azd-close",
                onClose: function () {
                    $.simplemodal.close();
                }
            });
        }
        function init_location_editing($searchInput, $mapCanvas, $latitude, $longitude) {
            if (!('google' in window)) {
                return;
            }
            var latLng = new google.maps.LatLng(54.800685, -4.130859);
            var zoom = 5;

            // If we have saved values, let's set the position and zoom level
            if ($latitude.val().length > 0 && $latitude.val() && $latitude.val() !== '0' && $longitude.val().length > 0 && $longitude.val() && $longitude.val() !== '0') {
                latLng = new google.maps.LatLng($latitude.val(), $longitude.val());
                zoom = 14;
            }

            // Map
            var mapOptions = {
                center: latLng,
                zoom: zoom
            };
            var map = new google.maps.Map($mapCanvas[0], mapOptions);
            $mapCanvas.data('map', map);

            // Marker
            var markerOptions = {
                map: map,
                draggable: true,
                title: 'Drag to set the exact location'
            };
            var marker = new google.maps.Marker(markerOptions);
            marker.setPosition(latLng);

            // Search
            var autocomplete = new google.maps.places.Autocomplete($searchInput[0]);
            autocomplete.bindTo('bounds', map);

            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    return;
                }

                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(14);
                }

                marker.setPosition(place.geometry.location);

                $latitude.val(place.geometry.location.lat()).trigger('change');
                $longitude.val(place.geometry.location.lng()).trigger('change');
            });

            $searchInput.keypress(function (event) {
                if (13 === event.keyCode) {
                    event.preventDefault();
                }
            });

            // Allow marker to be repositioned
            google.maps.event.addListener(marker, 'drag', function () {
                $latitude.val(marker.getPosition().lat()).trigger('change');
                $longitude.val(marker.getPosition().lng()).trigger('change');
            });
        }
        function init_dialog($dialog) {
            $dialog.find('script[data-liquid]').each(function () {
                var $snippet = $(this);
                $snippet.parent().children().not($snippet).remove();
                var liquid_doc = Liquid.parse($snippet.html());
                var html = liquid_doc.render(azt);
                $snippet.after(html);
                $snippet.parent().find('.azd-edit').on('click', function () {
                    var $row = $(this).closest('[data-id]');
                    var id = $row.attr('data-id');
                    azt.fields.forEach(function (value, i) {
                        if (value.id == id) {
                            var values = $.extend({}, azt.fields[i]);
                            add_update_field(values);
                            return;
                        }
                    });
                    return false;
                });
                $snippet.parent().find('.azd-duplicate').on('click', function () {
                    var $row = $(this).closest('[data-id]');
                    var id = $row.attr('data-id');
                    azt.fields.forEach(function (value, i) {
                        if (value.id == id) {
                            var values = $.extend({}, azt.fields[i]);
                            values.id = makeid();
                            azt.fields.push(values);
                            return;
                        }
                    });
                    $.post(azt.ajaxurl + '?action=azt_save_fields', {
                        fields: azt.fields
                    }, function (data) {
                        init_dialog($('#azd-item-fields'));
                        azt.items_datatable = init_datatable($('table.azd-items'));
                    });
                    return false;
                });
                $snippet.parent().find('.azd-delete').on('click', function () {
                    var $row = $(this).closest('[data-id]');
                    var id = $row.attr('data-id');
                    azt.fields.forEach(function (value, i) {
                        if (value.id == id) {
                            azt.fields.splice(i, 1);
                            return;
                        }
                    });
                    $.post(azt.ajaxurl + '?action=azt_save_fields', {
                        fields: azt.fields
                    }, function (data) {
                        init_dialog($('#azd-item-fields'));
                        azt.items_datatable = init_datatable($('table.azd-items'));
                    });
                    return false;
                });
            });
        }
        function tabs_init($tabs_list) {
            $tabs_list.each(function () {
                var $tabs = $(this);
                if (!$tabs.data('azd-tabs')) {
                    $tabs.find('> div:first-child > span > a[href^="#"]').on('click', function (event) {
                        var $this = $(this);
                        event.preventDefault();
                        event.stopPropagation();
                        $this.parent().addClass("azd-active");
                        $this.parent().siblings().removeClass("azd-active");
                        var tab = $this.attr("href");
                        $tabs.find('> div:last-child > div').not(tab).css("display", "none");
                        $(tab).fadeIn();
                        $.simplemodal.update($('.azd-modal').outerHeight());
                    });
                    $tabs.find('> div:first-child > span:first-child > a[href^="#"]').trigger('click');
                    $tabs.data('azd-tabs', true);
                }
            });
        }
        function init_toggles() {
            tabs_init($('.azd-tabs'));
            $('a.azd-dialog-toggle[href^="#"]').on('click', function (event) {
                var $this = $(this);
                event.preventDefault();
                $('.azd-dialog-toggle').parent().removeClass("azd-active");
                $this.parent().addClass("azd-active");
                var dialog = $this.attr("href");
                window.location.hash = $this.attr("href");
                var $dialog = $(dialog);
                if ($('.azd-dialogs > div').filter(dialog).length > 0) {
                    $('.azd-dialogs > div').not(dialog).css("display", "none");
                    $dialog.fadeIn();
                    init_dialog($dialog);
                    $dialog.triggerHandler('azd-show', event);
                } else {
                    $('.azd-dialog-toggle').parent().removeClass("azd-active");
                    $dialog.parentsUntil('.azd-dialogs').last().siblings().css("display", "none");
                    $dialog.parentsUntil('.azd-dialogs').last().fadeIn();
                    $dialog.parentsUntil('.azd-dialogs').last().find('a[href="' + dialog + '"]').trigger('click');
                    init_dialog($dialog);
                    $dialog.triggerHandler('azd-show', event);
                }
            });
            $('.azd-dialogs > div').css("display", "none");
            if (window.location.hash && $('a[href="' + window.location.hash + '"]').length) {
                $('a[href="' + window.location.hash + '"]').trigger('click');
            } else {
                $('.azd-sidebar-menu > div:first-child > a[href^="#"]').trigger('click');
            }
        }
        function init_datatable($items_table, callback) {
            function convert_table_row(tr) {
                var item = {};
                for (var name in columns_index) {
                    item[name] = table.row(tr).data()[columns_index[name]];
                }
                return item;
            }
            if (!$items_table.length) {
                return;
            }
            var columns = [];
            columns.push({sName: "id", bVisible: false, orderable: false});
            columns.push({sName: "actions", sClass: 'azd-actions', orderable: false});
            azt.fields.forEach(function (value, i) {
                columns.push({
                    sName: value.id,
                    sClass: 'azd-' + value.type,
                    bVisible: value.visible && value.visible == '1',
                    orderable: false
                });
            });
            var columns_index = {};
            columns.map(function (column, i) {
                columns_index[column.sName] = i;
            });
            if (azt.items_datatable) {
                azt.items_datatable.destroy();
            }
            $items_table.empty();
            var $thead = $('<thead></thead>').appendTo($items_table);
            var $htr = $('<tr></tr>').appendTo($thead);
            $('<th></th>').appendTo($htr);
            $('<th>' + azt.i18n.actions + '</th>').appendTo($htr);
            azt.fields.forEach(function (value, i) {
                $('<th>' + value.name + '</th>').appendTo($htr);
            });
            var $tbody = $('<tbody></tbody>').appendTo($items_table);
            var $btr = $('<tr></tr>').appendTo($tbody);
            $('<td></td>').appendTo($btr);
            $('<td class="azd-actions"></td>').appendTo($btr);
            azt.fields.forEach(function (value, i) {
                $('<td></td>').appendTo($btr);
            });
            var table = $items_table.DataTable({
                serverSide: true,
                ajax: {
                    url: azt.ajaxurl + '?action=azt_get_items',
                    type: 'POST'
                },
                aoColumns: columns,
                fnDrawCallback: function (oSettings) {
                    $('.azd-loader').fadeOut();
                    $items_table.find('tbody tr td.azd-image').each(function () {
                        var $this = $(this);
                        var src = $this.text();
                        $this.empty();
                        $('<img src="' + src + '">').appendTo($this);
                    });
                    $items_table.find('tbody tr td.azd-location').each(function () {
                        var $this = $(this);
                        var location = $this.text();
                        try {
                            location = JSON.parse(location);
                            $this.empty();
                            $this.text(location.lat + ' : ' + location.lng);
                        } catch (e) {

                        }
                    });
                    $items_table.find('tbody tr td.azd-date').each(function () {
                        var $this = $(this);
                        $this.html(dateFormat($this.text(), 'ddd dd mmm yyyy'));
                    });
                    $items_table.find('tbody tr td.azd-datetime').each(function () {
                        var $this = $(this);
                        $this.html(dateFormat($this.text(), 'ddd dd mmm yyyy HH:MM'));
                    });
                    $items_table.find('tbody tr td.azd-event').each(function () {
                        var $this = $(this);
                        var event = $this.text();
                        try {
                            event = JSON.parse(event);
                            if (event.a == '1') {
                                $this.html(dateFormat(event.d, 'ddd dd mmm yyyy'));
                            } else {
                                $this.html(dateFormat(event.d, 'ddd dd mmm yyyy HH:MM'));
                            }
                        } catch (e) {

                        }
                    });
                    $items_table.find('tbody tr td.azd-working_hours').each(function () {
                        var $this = $(this);
                        var working_hours = $this.text();
                        try {
                            working_hours = JSON.parse(working_hours);
                            $this.empty();
                            var html = '';
                            working_hours.forEach(function (day, i) {
                                var days_names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                var d = azt.i18n[days_names[i]] + ': ';
                                if (day.p.length) {
                                    var periods = [];
                                    day.p.forEach(function (period) {
                                        periods.push(period.f + ' - ' + period.t);
                                    });
                                    d += '(' + periods.join(', ') + ')';
                                } else {
                                    d += (day.o ? azt.i18n.open_24_hour : azt.i18n.closed);
                                }
                                html += '<div>' + d + '</div>';
                            });
                            $this.html(html);
                        } catch (e) {

                        }
                    });
                    $items_table.find('tbody tr .azd-actions').each(function () {
                        var $actions = $(this);
                        $('<a href="#" class="azd-edit" target="_blank" title="' + azt.i18n.edit + '"><span class="dashicons dashicons-edit"></span></a>').appendTo($actions).on('click', function () {
                            var item = convert_table_row($(this).closest('tr')[0]);
                            add_update_item(item);
                            return false;
                        });
                        $('<a href="#" class="azd-duplicate" title="' + azt.i18n.duplicate + '"><span class="dashicons dashicons-admin-page"></span></a>').appendTo($actions).on('click', function () {
                            var item = convert_table_row($(this).closest('tr')[0]);
                            $('.azd-loader').fadeIn();
                            $.post(azt.ajaxurl + '?action=azt_duplicate_item', {
                                id: item.id
                            }, function (data) {
                                table.ajax.reload();
                            });
                            return false;
                        });
                        $('<a href="#" class="azd-delete" title="' + azt.i18n.delete + '"><span class="dashicons dashicons-trash"></span></a>').appendTo($actions).on('click', function () {
                            var item = convert_table_row($(this).closest('tr')[0]);
                            $('.azd-loader').fadeIn();
                            $.post(azt.ajaxurl + '?action=azt_delete_item', {
                                id: item.id
                            }, function (data) {
                                table.ajax.reload();
                            });
                            return false;
                        });
                    });
                    $items_table.trigger('azd-refresh');
                    if (callback) {
                        callback();
                    }
                },
                oLanguage: azt.i18n.dataTable
            });
            return table;
        }
        function upload_file($target, callback) {
            $('.azd-file-input').remove();
            $('.azd-progress').remove();
            var $input = $('<input class="azd-file-input" type="file">').insertBefore($target).css({
                position: 'fixed',
                left: '-1000px',
                top: '-1000px'
            }).on('click', function (event) {
                event.stopPropagation();
            });
            var $progress = $('<span class="azd-progress"><span class="azd-status"></span></span>');
            $progress.appendTo($target);
            $input.on('change', function () {
                var file = $input.get(0).files[0];
                var xhr = new XMLHttpRequest();
                if (xhr.upload) {
                    xhr.upload.addEventListener("progress", function (e) {
                        $progress.find('.azd-status').width((e.loaded / e.total * 100) + '%');
                    }, false);
                    xhr.onreadystatechange = function (e) {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                $progress.remove();
                                $input.remove;
                                if (xhr.response) {
                                    callback(xhr.response);
                                }
                            }
                        }
                    };
                    xhr.open("POST", azt.ajaxurl + '?action=upload_file', true);
                    xhr.setRequestHeader("X-FILENAME", file.name);
                    xhr.send(file);
                    $progress.find('.azd-status').width('0%');
                    $progress.fadeIn("slow");
                }
            });
            $input.trigger('click');
        }
        function add_update_field(values, update) {
            if (!update) {
                update = (typeof values !== 'undefined') && (typeof values.id !== 'undefined');
            }
            if (!update) {
                values = {};
            }
            open_modal({
                title: update ? azt.i18n.edit_field : azt.i18n.add_new_field,
                desc: '',
                fields: {
                    id: {
                        label: azt.i18n.field_id,
                        required: true
                    },
                    name: {
                        label: azt.i18n.name,
                        required: true
                    },
                    type: {
                        label: azt.i18n.type,
                        options: {
                            text: azt.i18n.text,
                            url: azt.i18n.url,
                            email: azt.i18n.email,
                            phone: azt.i18n.phone,
                            number: azt.i18n.number,
                            checkbox: azt.i18n.checkbox,
                            bigtext: azt.i18n.bigtext,
                            date: azt.i18n.date,
                            datetime: azt.i18n.datetime,
                            event: azt.i18n.event,
                            image: azt.i18n.image,
                            gallery: azt.i18n.gallery,
                            timezone: azt.i18n.timezone,
                            location: azt.i18n.location,
                            working_hours: azt.i18n.working_hours,
                        }
                    },
                    group: {
                        label: azt.i18n.group
                    },
                    visible: {
                        label: azt.i18n.visible,
                        type: 'checkbox'
                    },
                    indexing: {
                        label: azt.i18n.indexing,
                        type: 'checkbox'
                    },
                }
            }, $.extend({}, values), function (new_values) {
                if (new_values.id === 'id') {
                    alert(azt.i18n.reserved_field_id);
                    return false;
                }
                if (!new_values.id) {
                    alert(azt.i18n.field_id_is_required);
                    return false;
                }
                if (!new_values.id.match(/^[a-z0-9\_]+$/)) {
                    alert(azt.i18n.field_id_must_be_latin_lowercase_characters_without_spaces);
                    return false;
                }
                if (!update || values.id != new_values.id) {
                    var exists = false;
                    azt.fields.forEach(function (value, i) {
                        if (value.id == new_values.id) {
                            exists = true;
                        }
                    });
                    if (exists) {
                        alert(azt.i18n.field_id_must_be_unique);
                        return false;
                    }
                }
                return true;
            }, function (new_values) {
                if (update) {
                    azt.fields.forEach(function (value, i) {
                        if (value.id == values.id) {
                            azt.fields[i] = new_values;
                        }
                    });
                } else {
                    azt.fields.push(new_values);
                }
                $.post(azt.ajaxurl + '?action=azt_save_fields', {
                    fields: azt.fields
                }, function (data) {
                    init_dialog($('#azd-item-fields'));
                    azt.items_datatable = init_datatable($('table.azd-items'));
                });
            });
        }
        function add_update_item(values) {
            var update = typeof values !== 'undefined';
            if (!update) {
                values = {};
            }
            var fields = {};
            azt.fields.forEach(function (value, i) {
                fields[value.id] = {
                    label: value.name
                };
                if ('type' in value) {
                    fields[value.id].type = value.type;
                }
                if ('group' in value) {
                    fields[value.id].group = value.group;
                }
                if ('auxiliary' in value) {
                    fields[value.id].auxiliary = value.auxiliary;
                }
            });
            open_modal({
                title: update ? azt.i18n.edit_item : azt.i18n.add_new_item,
                desc: '',
                fields: fields
            }, values, function (new_values) {
                return true;
            }, function (new_values) {
                $.post(azt.ajaxurl + '?action=azt_add_update_item', {
                    values: new_values
                }, function (data) {
                    azt.items_datatable = init_datatable($('table.azd-items'));
                });
            });
        }
        if (!('open_image_select_dialog' in azt)) {
            azt.open_image_select_dialog = function ($target, callback) {
                var image = this;
                $('.azd-file-input').remove();
                $('.azd-progress').remove();
                var $input = $('<input class="azd-file-input" type="file">').insertBefore(event.target).css({
                    position: 'fixed',
                    left: '-1000px',
                    top: '-1000px'
                }).on('click', function (event) {
                    event.stopPropagation();
                });
                var $progress = $('<span class="azd-progress"><span class="azd-status"></span></span>');
                if ($target.is('img')) {
                    $progress.appendTo($target.parent());
                } else {
                    $progress.appendTo($target);
                }
                $input.on('change', function () {
                    var file = $input.get(0).files[0];
                    var xhr = new XMLHttpRequest();
                    if (xhr.upload) {
                        xhr.upload.addEventListener("progress", function (e) {
                            $progress.find('.azd-status').width((e.loaded / e.total * 100) + '%');
                        }, false);
                        xhr.onreadystatechange = function (e) {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200) {
                                    $progress.remove();
                                    $input.remove;
                                    if (xhr.response) {
                                        callback.call(image, xhr.response, false);
                                    }
                                }
                            }
                        };
                        xhr.open("POST", azt.ajaxurl + '?action=upload_file', true);
                        xhr.setRequestHeader("X-FILENAME", file.name);
                        xhr.send(file);
                        $progress.find('.azd-status').width('0%');
                        $progress.fadeIn("slow");
                    }
                });
                $input.trigger('click');
            };
        }
        $.fn.air_datepicker.language['en'] = {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            today: 'Today',
            clear: 'Clear',
            dateFormat: 'yyyy-mm-dd',
            timeFormat: 'hh:ii',
            firstDay: 0
        };
        $('.azd-items-import').on('click', function (e) {
            $('.azd-file-input').remove();
            var $input = $('<input class="azd-file-input" type="file" accept=".csv">').insertBefore(e.target).css({
                position: 'fixed',
                left: '-1000px',
                top: '-1000px'
            }).on('click', function (event) {
                event.stopPropagation();
            });
            $input.off('change').on('change', function () {
                var file = $input.get(0).files[0];
                var xhr = new XMLHttpRequest();
                if (xhr.upload) {
                    xhr.upload.addEventListener("progress", function (e) {
                        $('.azd-process .azd-status').width((e.loaded / e.total * 100) + '%');
                    }, false);
                    xhr.onreadystatechange = function (e) {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                $('.azd-process .azd-status').width('100%');
                                $('.azd-process').fadeOut("slow");
                                $input.off('change');
                                $input.val('');
                                var data = JSON.parse(xhr.response);
                                if (data && 'examples' in data && 'total' in data && data.examples.length > 0) {
                                    open_mapping_modal(data.examples, data.total, function (options, mapping) {
                                        function processing(position) {
                                            if (current < data.total) {
                                                $('.azd-process .azd-status').width((current / data.total * 100) + '%');
                                                $.post(azt.ajaxurl + '?action=azt_items_import', {
                                                    file_path: data.file_path,
                                                    options: options,
                                                    mapping: mapping,
                                                    position: position
                                                }, function (response) {
                                                    if (response) {
                                                        response = JSON.parse(response);
                                                        current += response.imported;
                                                        processing(response.position);
                                                    } else {
                                                        $('.azd-process').fadeOut("slow");
                                                    }
                                                });
                                            } else {
                                                init_dialog($('#azd-item-fields'));
                                                azt.items_datatable = init_datatable($('table.azd-items'));
                                                $('.azd-process .azd-status').width('100%');
                                                $('.azd-process').fadeOut("slow");
                                            }
                                        }
                                        $('.azd-process .azd-operation').text(azt.i18n.import_progress);
                                        $('.azd-process .azd-status').width('0%');
                                        $('.azd-process').fadeIn("slow");
                                        var current = 0;
                                        for (var name in mapping) {
                                            var exists = false;
                                            azt.fields.forEach(function (value, i) {
                                                if (value.id == mapping[name]) {
                                                    exists = true;
                                                }
                                            });
                                            if (!exists) {
                                                azt.fields.push({
                                                    id: mapping[name],
                                                    name: mapping[name],
                                                    visible: true
                                                });
                                            }
                                        }
                                        $.post(azt.ajaxurl + '?action=azt_save_fields', {
                                            fields: azt.fields
                                        }, function (data) {
                                            processing(0);
                                        });
                                    });
                                }
                            }
                        }
                    };
                    xhr.open("POST", azt.ajaxurl + '?action=azt_items_import', true);
                    xhr.setRequestHeader("X-FILENAME", file.name);
                    xhr.send(file);
                    $('.azd-process .azd-status').width('0%');
                    $('.azd-process .azd-operation').text(azt.i18n.upload_progress);
                    $('.azd-process').fadeIn("slow");
                }
            });
            $input.trigger('click');
            e.preventDefault();
        });
        $('.azd-geocoding').on('click', function () {
            function processing(position) {
                $.post(azt.ajaxurl + '?action=azt_geocoding', {
                    position: position
                }, function (response) {
                    response = JSON.parse(response);
                    if (!total) {
                        total = response.found;
                    }
                    response.items.forEach(function (item, i) {
                        var values = {id: item.id};
                        var address = [];
                        if ('street' in item) {
                            address.push(item.street);
                        }
                        if ('city' in item) {
                            address.push(item.city);
                        }
                        if ('country' in item) {
                            address.push(item.country);
                        }
                        if ('zip' in item) {
                            address.push(item.zip);
                        }
                        if ('postcode' in item) {
                            address.push(item.postcode);
                        }
                        if (address.length) {
                            address = address.join(', ');
                            $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&key=' + azt.gmap_api_key, function (data) {
                                if (data && data.results && data.results.length) {
                                    values.lat = data.results[0].geometry.location.lat;
                                    values.lng = data.results[0].geometry.location.lng;
                                    $.post(azt.ajaxurl + '?action=azt_add_update_item', {
                                        values: values
                                    }, function (data) {
                                    });
                                }
                            });
                        }
                    });
                    position += response.items.length;
                    $('.azd-process .azd-status').width((position / total * 100) + '%');
                    if (position < total) {
                        processing(position);
                    } else {
                        $('.azd-process .azd-status').width('100%');
                        $('.azd-process').fadeOut("slow");
                    }
                });
            }
            $('.azd-process .azd-status').width('0%');
            $('.azd-process .azd-operation').text(azt.i18n.fetching_missing_coordinates);
            $('.azd-process').fadeIn("slow");
            var total = false;
            if (azt.gmap_api_key) {
                var lat_exists = false;
                var lng_exists = false;
                azt.fields.forEach(function (value, i) {
                    if (value.id == 'lat') {
                        lat_exists = true;
                    }
                    if (value.id == 'lng') {
                        lng_exists = true;
                    }
                });
                if (!lat_exists) {
                    azt.fields.push({
                        id: 'lat',
                        name: 'lat',
                        visible: false
                    });
                }
                if (!lng_exists) {
                    azt.fields.push({
                        id: 'lng',
                        name: 'lng',
                        visible: false
                    });
                }
                if (!lat_exists || !lat_exists) {
                    $.post(azt.ajaxurl + '?action=azt_save_fields', {
                        fields: azt.fields
                    }, function (data) {
                    });
                }
                processing(0);
            }
            return false;
        });
        $('.azd-add-field').on('click', function (e) {
            add_update_field({visible: true});
            return false;
        });
        $('.azd-add-item').on('click', function (e) {
            add_update_item();
            return false;
        });
        $('.azd-items-remove').on('click', function (e) {
            if (confirm(azt.i18n.remove_all_items)) {
                $('.azd-loader').fadeIn();
                $.post(azt.ajaxurl + '?action=azt_items_remove', {
                }, function (data) {
                    azt.items_datatable = init_datatable($('table.azd-items'));
                    $('.azd-loader').fadeOut();
                });
            }
            return false;
        });
        azt.items_datatable = init_datatable($('table.azd-items'));
        $('#azd-item-fields').on('azd-show', function (event, data) {
            var $dialog = $(this);
            var $table = $dialog.find('table.azd-fields');
            $table.children('tbody').sortable({
                update: function (event, ui) {
                    function array_move(arr, old_index, new_index) {
                        if (new_index >= arr.length) {
                            var k = new_index - arr.length + 1;
                            while (k--) {
                                arr.push(undefined);
                            }
                        }
                        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
                        return arr; // for testing
                    }
                    azt.fields.forEach(function (value, i) {
                        if (value.id == ui.item.attr('data-id')) {
                            azt.fields = array_move(azt.fields, i, ui.item.index() - 1);
                            return;
                        }
                    });
                    $.post(azt.ajaxurl + '?action=azt_save_fields', {
                        fields: azt.fields
                    }, function (data) {
                        azt.items_datatable = init_datatable($('table.azd-items'));
                    });
                },
            });
        });
        $('form.azd-settings > button').on('click', function () {
            function report_validity(form) {
                var valid = true;
                if ('reportValidity' in form) {
                    valid = form.reportValidity();
                } else {
                    $(form).find('[name]').each(function () {
                        var $this = $(this);
                        $this.off('change.az-report-validity').on('change.az-report-validity', function () {
                            $(this).removeClass('az-not-valid');
                        });
                        $this.removeClass('az-not-valid');
                        if (!this.checkValidity()) {
                            valid = false;
                            $this.addClass('az-not-valid');
                        }
                    });
                }
                return valid;
            }
            var $form = $(this).closest('form');
            if (report_validity($form.get(0))) {
                var data = {};
                $.map($form.serializeArray(), function (n, i) {
                    if (n['name']) {
                        if (data[n['name']]) {
                            if (!$.isArray(data[n['name']])) {
                                data[n['name']] = [data[n['name']]];
                            }
                            data[n['name']].push(n['value']);
                        } else {
                            data[n['name']] = n['value'];
                        }
                    }
                });
                $('.azd-loader').fadeIn();
                $.post(azt.ajaxurl + '?action=azt_save_settings', {
                    settings: data
                }, function (data) {
                    $('.azd-loader').fadeOut();
                });
            }
            return false;
        });

        init_toggles();
        if (!$('#azd-settings [name="gmap_api_key"]').val()) {
            $('[href="#azd-settings"]').trigger('click');
        }
        setTimeout(function () {
            $(window).scrollTop(0);
        });
        Liquid.Template.registerFilter({
            t: function (input) {
                var path = input.split('.');
                var current = azh.translations;
                for (var i in path) {
                    if (path[i] in current) {
                        current = current[path[i]];
                    } else {
                        return input;
                    }
                }
                if (typeof current === 'string') {
                    return current;
                } else {
                    return input;
                }
            },
            md5: function (input) {
                return hashCode(input);
            },
            slice: function (input, begin, end) {
                return input.slice(begin, end);
            },
            round: function (input, precision) {
                return Math.round(input).toFixed(precision);
            },
            json: function (a) {
                return JSON.stringify(a);
            },
        });
    });
})(jQuery);
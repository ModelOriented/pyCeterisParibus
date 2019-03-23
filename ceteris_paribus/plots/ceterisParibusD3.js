(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.ceterisParibusD3 = global.ceterisParibusD3 || {})));
}(this, (function (exports) {
    'use strict';


    ceterisParibusD3.version = "1.0.0";


    var createPlot = function (div, data, dataObs, options) {
        return new CeterisParibusPlot(div, data, dataObs, options);
    };


    var CeterisParibusPlot = function (div, data, dataObs, options) {
        this.__init__(div, data, dataObs, options);
    };


    CeterisParibusPlot.prototype.__init__ = function (div, data, dataObs, options) {

        this.default_height = 400;
        this.default_width = 600;
        this.default_margins = {top: 10, right: 10, bottom: 40, left: 50};
        this.default_margin_yaxis_title = 5;
        this.default_tickPadding = 4;

        this.default_size_rugs = 1;
        this.default_alpha_rugs = 0.9;

        this.default_size_residuals = 2;
        this.default_alpha_residuals = 0.9;

        this.default_size_points = 3;
        this.default_alpha_points = 0.9;

        this.default_size_ices = 2;
        this.default_size_pdps = 3.5;
        this.default_alpha_ices = 0.4;
        this.default_alpha_pdps = 0.4;

        this.default_color = '#3F547F';
        this.default_color_pdps = 'grey';
        this.default_no_colors = 3;

        this.default_font_size_plot_title = 16;
        this.default_font_size_titles = 14;
        this.default_font_size_legend = 12;
        this.default_font_size_axes = 12;
        this.default_font_size_tootlips = 10;
        this.default_font_size_table = 12;

        this.default_max_legend_key_size = 15;

        this.default_font_color = '#444444';

        this.default_add_table = true;
        this.default_plot_title = 'Ceteris Paribus plots per variable - predictions vs. variable values';
        this.default_yaxis_title = 'y';

        function isObject(obj) {
            return obj === Object(obj);
        }

        /*
            this.default_legend_keys_size = 7;

            if (options.hasOwnProperty('legend_keys_size') && options.legend_keys_size !== null){
                this.legend_keys_size_ = options.legend_keys_size;
            } else {
                this.legend_keys_size_ = this.default_legend_keys_size;
            }
            */
        this.last_error_message_ = '';


        // handling user div
        if (typeof(div) == 'string') {
            div = document.getElementById(div);
        }

        try {
            if (!div) {
                throw new Error('Container div for CeterisParibusPlot does not exist! Stopping execution.');
            }
        } catch (e) {
            console.log(e.message)
            this.last_error_message_ = e.message;
            //alert(e.message)
            return;
        }


        // take d3.selection, not pure html selection
        this.userDiv_ = d3.select('#' + div.id);


        try {
            if (this.userDiv_.node().tagName != 'DIV') {
                throw new Error('Given container is not a div! Stopping execution.');
            }
        } catch (e) {
            console.log(e.message)
            this.last_error_message_ = e.message;
            //alert(e.message)
            return;
        }


        // handling data

        // data

        try {

            if (data === null || data === undefined || data.length == 0) {
                var msg = 'There are no CP profiles in dataset! Stopping execution.';
                throw new Error(msg);
            } else if (!jQuery.isArray(data)) {
                var msg = '`data` is not an array! Stopping execution';
                throw new Error(msg);
            } else if (!isObject(data[0])) {
                var msg = '`data` is not an array of objects! Stopping execution';
                throw new Error(msg);
            } else {
                var hasAllRequiredKeys = data[0].hasOwnProperty('_ids_') && data[0].hasOwnProperty('_label_') && data[0].hasOwnProperty('_vname_') && data[0].hasOwnProperty('_yhat_');
                if (!hasAllRequiredKeys) {
                    var msg = '`data` does not have all required keys (_ids_, _label_, _vname_, _yhat_)! Stopping execution';
                    throw new Error(msg);
                }
            }

        } catch (e) {
            console.log(e.message)
            this.last_error_message_ = e.message;
            return;
        }

        // dataObs

        try {

            if (dataObs === null || dataObs === undefined || dataObs.length == 0) {
                var msg = 'There are no observations in dataset dataObs! Stopping execution.';
                throw new Error(msg);
            } else if (!jQuery.isArray(dataObs)) {
                var msg = '`dataObs` is not an array! Stopping execution';
                throw new Error(msg);
            } else if (!isObject(dataObs[0])) {
                var msg = '`dataObs` is not an array of objects! Stopping execution';
                throw new Error(msg);
            } else {
                var hasAllRequiredKeys = dataObs[0].hasOwnProperty('_ids_') && dataObs[0].hasOwnProperty('_label_') && dataObs[0].hasOwnProperty('_y_') && dataObs[0].hasOwnProperty('_yhat_');
                if (!hasAllRequiredKeys) {
                    var msg = '`dataObs` does not have all required keys (_ids_, _label_, _y_, _yhat_)! Stopping execution';
                    throw new Error(msg);
                }
            }

        } catch (e) {
            console.log(e.message)
            this.last_error_message_ = e.message;
            return;
        }


        // handling nulls
        var to_remove_data = {},
            to_remove_dataObs = {},
            data_length = data.length,
            dataObs_length = dataObs.length,
            has_empty_values = false;

        data.forEach(function (el) {

            for (var key in el) {
                if (el[key] === null && el.hasOwnProperty(key)) {
                    to_remove_data[el['_ids_'] + "||" + el['_label_'] + "||" + el['_vname_']] = 1
                    to_remove_dataObs[el['_ids_'] + "||" + el['_label_']] = 1;
                    has_empty_values = true;
                }
            }

        });

        try {

            if (has_empty_values) {
                data = data.filter(function (el) {
                    return !to_remove_data.hasOwnProperty(el['_ids_'] + "||" + el['_label_'] + "||" + el['_vname_']);
                });
                console.log('Removed ' + (data_length - data.length) + ' rows with nulls from profiles data.');
                dataObs = dataObs.filter(function (el) {
                    return !to_remove_dataObs.hasOwnProperty(el['_ids_'] + "||" + el['_label_']);
                });
                console.log('Removed ' + (dataObs_length - dataObs.length) + ' rows with nulls from observation data.');

                if (data.length == 0) {
                    var msg = 'There are no CP profiles in dataset due to null values removing.';
                    throw new Error(msg);
                }
            }

        } catch (e) {
            console.log(e.message)
            this.last_error_message_ = e.message;
            return;
        }


        // changing boolean column to numeric column - profiles data
        var last_error_message;

        var boolean_variables = [];
        for (var key in data[0]) {
            if (typeof data[0][key] == 'boolean') {
                boolean_variables.push(key)
            }
        }

        data = data.map(function (x) {
            for (var i = 0; i < boolean_variables.length; i++) {
                key = boolean_variables[i];
                x[key] = x[key] ? 1 : 0;
                last_error_message = 'Changed ' + key + ' to numeric'
            }
            return x;
        })

        // changing boolean column to numeric column - observation data
        boolean_variables = [];
        for (var key in dataObs[0]) {
            if (typeof dataObs[0][key] == 'boolean') {
                boolean_variables.push(key)
            }
        }

        dataObs = dataObs.map(function (x) {
            for (var i = 0; i < boolean_variables.length; i++) {
                key = boolean_variables[i];
                x[key] = x[key] ? 1 : 0;
                last_error_message = 'Changed ' + key + ' to numeric'
            }
            return x;
        })

        this.last_error_message_ = last_error_message;

        this.data_ = data;
        this.dataObs_ = dataObs;


        //handling options

        try {

            if (!isObject(options)) {
                var msg = '`options` is not an object! Stopping execution.';
                throw new Error(msg);
            }

        } catch (e) {
            console.log(e.message)
            this.last_error_message_ = e.message;
            return;
        }


        var all_variables = d3.map(data, function (x) {
            return x._vname_
        }).keys();

        if (options.hasOwnProperty('variables') && options.variables != null) {

            try {

                if (options.variables === undefined || options.variables.length == 0) {
                    var msg = 'There are no variables given in `variables`! Stopping execution.';
                    throw new Error(msg);
                } else if (!jQuery.isArray(options.variables)) {
                    var msg = '`variables` is not an array! Stopping execution';
                    throw new Error(msg);
                } else {

                    var not_found_var = options.variables.filter(function (d) {
                        return all_variables.indexOf(d) === -1
                    });

                    if (not_found_var.length > 0) {
                        var msg = 'There are no CP profiles calculated for selected variables: ' + not_found_var.toString();
                        throw new Error(msg);
                    }
                }

            } catch (e) {
                console.log(e.message)
                this.last_error_message_ = e.message;
                return;
            }

            this.variables_ = options.variables;
        } else {
            this.variables_ = all_variables;
        }


        // case variables name has improper characters like
        //  !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, `, {, |, }, and ~.
        this.variablesDict_ = {};
        for (var i = 0; i < this.variables_.length; ++i) {
            this.variablesDict_[this.variables_[i]] = this.variables_[i].split('.').join('_')
                .split('-').join('_').split('#').join('_').split('$').join('_').split('~').join('_')

                .split('@').join('_').split('[').join('_').split(']').join('_').split('^').join('_')
                .split('`').join('_').split('{').join('_').split('|').join('_').split('}').join('_')

                .split(',').join('_').split('/').join('_').split(':').join('_').split(';').join('_')
                .split('<').join('_').split('=').join('_').split('>').join('_').split('?').join('_')

                .split('!').join('_').split('"').join('_').split('%').join('_').split('&').join('_')
                .split('(').join('_').split(')').join('_').split('*').join('_').split('+').join('_')
                .split(' ').join('_')
        }

        this.is_color_variable_ = false;


        function isColor(strColor) {
            if (strColor)
                var s = new Option().style;
            s.color = strColor;
            return s.color != "" // if given color doesn't exist it set color to "",
            // changed from s.color == strColor; because of cases like rgba(255,0,0,1), opacity parameter were autom. changed
        };


        if (options.hasOwnProperty('color') && options.color !== null) {

            if (isColor(options.color)) {
                this.color_ = options.color;
            } else if (dataObs[0].hasOwnProperty(options.color)) { // it includes case _label_
                this.is_color_variable_ = true;
                this.color_ = options.color;
            } else {
                try {
                    var msg = "'color' = " + options.color + " is not a variable from given dataset nor a correct color name.";
                    throw new Error(msg);
                } catch (e) {
                    console.log(e.message)
                    this.last_error_message_ = e.message;
                    return;
                }

            }

        } else {
            this.color_ = this.default_color;
        }

        if (options.hasOwnProperty('no_colors') && options.no_colors != null) {
            this.no_colors_ = options.no_colors;
        } else {
            this.no_colors_ = this.default_no_colors;
        }

        this.add_table_ = this.default_add_table;

        if (options.hasOwnProperty('add_table') && options.add_table !== null) {
            this.add_table_ = options.add_table;
        }


        this.categorical_order_ = options.categorical_order;


        //handling graphical options
        if (options.hasOwnProperty('size_rugs') && options.size_rugs !== null) {
            this.size_rugs_ = options.size_rugs;
        } else {
            this.size_rugs_ = this.default_size_rugs;
        }

        if (options.hasOwnProperty('alpha_rugs') && options.alpha_rugs !== null) {
            this.alpha_rugs_ = options.alpha_rugs;
        } else {
            this.alpha_rugs_ = this.default_alpha_rugs;
        }

        this.color_rugs_ = options.color_rugs;
        this.color_points_ = options.color_points;
        this.color_residuals_ = options.color_residuals;

        if (options.hasOwnProperty('color_pdps') && options.color_pdps !== null) {
            this.color_pdps_ = options.color_pdps;
        } else {
            this.color_pdps_ = this.default_color_pdps;
        }


        if (options.hasOwnProperty('alpha_residuals') && options.alpha_residuals !== null) {
            this.alpha_residuals_ = options.alpha_residuals;
        } else {
            this.alpha_residuals_ = this.default_alpha_residuals;
        }

        if (options.hasOwnProperty('alpha_points') && options.alpha_points !== null) {
            this.alpha_points_ = options.alpha_points;
        } else {
            this.alpha_points_ = this.default_alpha_points;
        }

        if (options.hasOwnProperty('alpha_ices') && options.alpha_ices !== null) {
            this.alpha_ices_ = options.alpha_ices;
        } else {
            this.alpha_ices_ = this.default_alpha_ices;
        }

        if (options.hasOwnProperty('alpha_pdps') && options.alpha_pdps !== null) {
            this.alpha_pdps_ = options.alpha_pdps;
        } else {
            this.alpha_pdps_ = this.default_alpha_pdps;
        }

        if (options.hasOwnProperty('size_points') && options.size_points !== null) {
            this.size_points_ = options.size_points;
        } else {
            this.size_points_ = this.default_size_points;
        }

        if (options.hasOwnProperty('size_residuals') && options.size_residuals !== null) {
            this.size_residuals_ = options.size_residuals;
        } else {
            this.size_residuals_ = this.default_size_residuals;
        }

        if (options.hasOwnProperty('size_ices') && options.size_ices !== null) {
            this.size_ices_ = options.size_ices;
        } else {
            this.size_ices_ = this.default_size_ices;
        }

        if (options.hasOwnProperty('size_pdps') && options.size_pdps !== null) {
            this.size_pdps_ = options.size_pdps;
        } else {
            this.size_pdps_ = this.default_size_pdps;
        }


        if (options.hasOwnProperty('font_size_plot_title') && options.font_size_plot_title !== null) {
            this.font_size_plot_title_ = options.font_size_plot_title;
            this.is_set_font_size_plot_title_ = true;
        } else {
            this.font_size_plot_title_ = this.default_font_size_plot_title;
            this.is_set_font_size_plot_title__ = false;
        }

        if (options.hasOwnProperty('font_size_titles') && options.font_size_titles !== null) {
            this.font_size_titles_ = options.font_size_titles;
            this.is_set_font_size_titles_ = true;
        } else {
            this.font_size_titles_ = this.default_font_size_titles;
            this.is_set_font_size_titles_ = false;
        }

        if (options.hasOwnProperty('font_size_legend') && options.font_size_legend !== null) {
            this.font_size_legend_ = options.font_size_legend;
            this.is_set_font_size_legend_ = true;
        } else {
            this.font_size_legend_ = this.default_font_size_legend;
            this.is_set_font_size_legend_ = false;
        }

        if (options.hasOwnProperty('font_size_axes') && options.font_size_axes !== null) {
            this.font_size_axes_ = options.font_size_axes;
            this.is_set_font_size_axes_ = true;
        } else {
            this.font_size_axes_ = this.default_font_size_axes;
            this.is_set_font_size_axes_ = false;
        }

        if (options.hasOwnProperty('font_size_tootlips') && options.font_size_tootlips !== null) {
            this.font_size_tootlips_ = options.font_size_tootlips;
            this.is_set_font_size_tootlips_ = true;
        } else {
            this.font_size_tootlips_ = this.default_font_size_tootlips;
            this.is_set_font_size_tootlips_ = false;
        }

        if (options.hasOwnProperty('font_size_table') && options.font_size_table !== null) {
            this.font_size_table_ = options.font_size_table;
            this.is_set_font_size_table_ = true;
        } else {
            this.font_size_table_ = this.default_font_size_table;
            this.is_set_font_size_table_ = false;
        }


        var min_yhat = d3.min(this.data_, function (d) {
                return d['_yhat_'];
            }),
            max_yhat = d3.max(this.data_, function (d) {
                return d['_yhat_'];
            });

        if (min_yhat >= 0 & max_yhat <= 1) {
            this.formatPredTooltip_ = '.2f';
        } else if (isFinite(((this.dataObs_[0]['_y_'] + '').split('.')[1]))) {
            this.formatPredTooltip_ = '.' + ((this.dataObs_[0]['_y_'] + '').split('.')[1]).length + 'f';
        } else {
            this.formatPredTooltip_ = '.0f'
        }


        if (options.hasOwnProperty('plot_title') && options.plot_title !== null) {
            this.plot_title_ = options.plot_title;
        } else {
            this.plot_title_ = this.default_plot_title;
        }

        if (options.hasOwnProperty('yaxis_title') && options.yaxis_title !== null) {
            this.yaxis_title_ = options.yaxis_title;
        } else {
            this.yaxis_title_ = this.default_yaxis_title;
        }

        if (options.hasOwnProperty('show_profiles') && options.show_profiles !== null) {
            this.show_profiles_ = options.show_profiles;
        } else {
            this.show_profiles_ = true;
        }

        if (options.hasOwnProperty('show_observations') && options.show_observations !== null) {
            this.show_observations_ = options.show_observations;
        } else {
            this.show_observations_ = true;
        }

        if (options.hasOwnProperty('show_rugs') && options.show_rugs !== null) {
            this.show_rugs_ = options.show_rugs;
        } else {
            this.show_rugs_ = true;
        }

        if (options.hasOwnProperty('show_residuals') && options.show_residuals !== null) {
            this.show_residuals_ = options.show_residuals;
        } else {
            this.show_residuals_ = true;
        }

        if (options.hasOwnProperty('aggregate_profiles') && options.aggregate_profiles !== null) {

            try {
                if (options.aggregate_profiles == 'mean' || options.aggregate_profiles == 'median') {
                    this.aggregate_profiles_ = options.aggregate_profiles;
                } else {
                    var msg = options.aggregate_profiles + ' is not allowed aggregation function, available: "mean" and "median"! Stopping execution.';
                    throw new Error(msg);
                }

            } catch (e) {
                console.log(e.message)
                this.last_error_message_ = e.message;
                return;
            }

        } else {
            this.aggregate_profiles_ = null;
        }


        try {
            this.scaleColorPrepare_();
        } catch (e) {
            console.log(e.message)
            this.last_error_message_ = e.message;
            //alert(e.message)
            return;
        }

        var scaleColor = this.scaleColor_;


        this.init_size_calculations_ = true;

        this.default_auto_resize = true;

        if (options.hasOwnProperty('auto_resize') && options.auto_resize !== null) {
            this.auto_resize_ = options.auto_resize;
        } else {
            this.auto_resize_ = this.default_auto_resize;
        }


        this.calculateSizeParameters_();


        // handling own CP div
        var titleDivCP = this.userDiv_.append('div')
            .attr('class', 'ceterisParibusD3 titleDivCP')
            .style('height', this.titleDivHeight_ + 'px')
            .style('width', this.visWidth_ + 'px')
            .style('display', "table")
            .style('text-align', 'left')
            .style('font', 'bold ' + this.font_size_plot_title_ + 'px sans-serif')
            .text(this.plot_title_);

        titleDivCP.style('color', this.default_font_color);

        if (this.userDiv_.select('.mainDivCP')) {
            this.userDiv_.select('.mainDivCP').remove();
        }


        var mainDivCP = this.userDiv_.append('div')
            .attr('class', 'ceterisParibusD3 mainDivCP')
            .style('height', this.chartHeight_ + 'px')
            .style('width', this.visWidth_ + 'px')
            .style('display', "table")
            .append('table').attr('cellspacing', 0).attr('cellpadding', 0).style('border-collapse', 'collapse')
            .style('padding', 0 + 'px').style('border-spacing', 0 + 'px')
            .append('tbody').append('tr');


        var plotDivCP = mainDivCP.append('td').style('border-spacing', '0px').append('div').attr('class', 'divTable plotDivCP')
            .style('display', 'table')
            .append('div').attr('class', 'divTableBody plotDivTableBody').style('display', 'table-row-group')
            .style('height', this.chartHeight_ + 'px').style('width', this.plotWidth_ + 'px');


        if (this.is_color_variable_) {

            var legendDivCP = mainDivCP.append('td')
                .attr('cellspacing', 0).attr('cellpadding', 0).style('border-collapse', 'collapse')
                .append('div').attr('class', 'divTable legendDivCP')
                .style('display', 'table')
                .append('div').attr('class', 'divTableBody').style('display', 'table-row-group')
                .style('height', this.chartHeight_ + 'px').style('width', this.legendWidth_ + 'px');

            var legendAreaCP = legendDivCP.append('svg').attr('height', this.chartHeight_).attr('width', this.legendWidth_)
                .append('g').attr('transform', 'translate(10,0)').attr('class', 'legendAreaCP');

            var legend_part_size = this.legend_part_size_,
                legend_keys_size = this.legend_keys_size_;

            var no_legend_elements = 1 + this.scaleColor_.domain().length;
            var legend_shift = Math.floor((13 - no_legend_elements) / 2);
            this.legend_shift_ = legend_shift;

            legendAreaCP.append("text").attr('class', 'legendTitle')
                .attr('y', (1 + legend_shift) * legend_part_size).style('font', this.font_size_legend_ + 'px sans-serif').text(this.color_ + ":");


            var legendKeys = legendAreaCP.append("g").attr('class', 'legendKeysGroup')
                .attr("text-anchor", "start").attr("transform", "translate(" + (this.legendWidth_ * 0.1) + "," + 0 + ")") //this.chartHeight_*0.2
                .selectAll("g").data(this.scaleColor_.domain()).enter().append("g").attr('class', 'keyGroup')
                .attr("transform", function (d, i) {
                    return "translate(0," + (i + 2 + legend_shift) * legend_part_size + ")";
                }); //20  +2 - one to start not with 0 and one because of legend title


            legendKeys.append("rect").attr("x", -legend_keys_size).attr("width", legend_keys_size).attr("height", legend_keys_size)
                .attr('y', -legend_keys_size)
                .style('stroke', 'grey').style('stroke-width', '0.5px')
                .attr("fill", function (d) {
                    return scaleColor(d)
                });

            legendKeys.append("text").attr("x", 5)
            //.attr("dy", "0.3em")
                .style('font', this.font_size_legend_ + 'px sans-serif').text(function (d) {
                return d;
            });

            this.legendDivCP_ = legendDivCP;

            d3.select('.legendDivCP').style('overflow', 'scroll')

        }


        this.mainDivCP_ = mainDivCP;
        this.mainDivCP_.style('color', this.default_font_color);
        this.mainDivCP_.selectAll('svg text').style('color', this.default_font_color);

        this.plotDivCP_ = plotDivCP;

        //tooltips
        var tooltipDiv = plotDivCP.append("div").attr("class", "tooltip").style("opacity", 0).style("position", 'absolute')
            .style("height", 'auto').style("width", 'auto')
            .style("padding", '5px').style("text-align", 'left').style("background", 'white').style("border", '1px solid #BFBFBF')
            .style("border-radius", '1px').style("box-shadow", '2px 2px 1px rgba(0,0,0,0.5)')
            .style("pointer-events", 'none').style('font', this.font_size_tootlips_ + 'px sans-serif');

        this.tooltipDiv_ = tooltipDiv;

        this.createCells_();

        // if introducing layers here should be loop over them to evoke function with different parameters
        this.addingLayer_(this.data_, this.dataObs_, this.show_profiles_, this.show_observations_, this.show_rugs_,
            this.show_residuals_, this.aggregate_profiles_);

        var self = this;


        if (this.auto_resize_) {

            // addEventListener in addEventListenerResize_ needs function for which first argument is event e,
            // we don't need e so we just wrap our function resizePlot_() with function capturing e but not passing it further
            // also we need here to evoke resizePlot_() on self, otherwise 'this' inside resizePlot() will change context
            // 'if' needed to not add this listener every time we evoke __init__
            if (!this.resizePlotHandler_) {
                this.resizePlotHandler_ = function (e) {
                    self.resizePlot_();
                };

                this.addEventListenerResize_(this.resizePlotHandler_);
            }

            //TODO
        }


        this.CP_id_ = 'CP' + this.generateUniqueId_();

        // adding table with observations
        if (this.add_table_) {
            this.createTable_();
        }


    };

    CeterisParibusPlot.prototype.createCells_ = function () {

        var nCells = this.nCells_,
            cellIterator = 0,
            rows = this.rows_,
            cols = this.cols_,
            cellsHeight = this.cellsHeight_,
            cellsWidth = this.cellsWidth_,
            plotDivCP = this.plotDivCP_,
            variables = this.variables_,
            categorical_order = this.categorical_order_,
            scalesX = {},
            data = this.data_,
            dataObs = this.dataObs_,
            margins = this.default_margins,
            size_rugs = this.size_rugs_,
            font_size_titles = this.font_size_titles_,
            font_size_axes = this.font_size_axes_,
            variablesDict = this.variablesDict_,
            yaxis_title = this.yaxis_title_,
            margin_yaxis_title = this.default_margin_yaxis_title,
            tickPaddingSize = this.default_tickPadding,
            yAxisTitleSize = this.yAxisTitleSize_,
            svgHeight = this.svgHeight_,
            length_rugs = this.length_rugs_,
            widthAvail = this.widthAvail_,
            heightAvail = this.heightAvail_,
            halfStepCategorical = 0;


        var cells = plotDivCP.selectAll('.cellRow').data(d3.range(1, rows + 1)).enter().append('div')
            .attr('class', 'divTableRow cellRow').style('display', 'table-row')
            .style('width', '100%').style('height', cellsHeight + 'px')
            .selectAll('.cell').data(d3.range(1, cols + 1)).enter().append('div')
            .attr('class', function (d, i) {
                cellIterator = cellIterator + 1;
                if (variables[cellIterator - 1]) {
                    return 'divTableCell cell ' + variablesDict[variables[cellIterator - 1]] + "_cell";
                } else {
                    return 'divTableCell cell ' + 'extra_cell';
                }
            })
            .style('display', 'table-cell')
            //.style('border-right', 'solid #c4c4c4 1px')
            //.style('border-bottom', 'solid #c4c4c4 1px')
            .style('width', cellsWidth + 'px').style('height', cellsHeight + 'px')
            .append('div').attr('class', 'divTable').style('display', 'table')
            .append('div').attr('class', 'divTableBody cellBody').style('display', 'table-row-group')
            .style('width', cellsWidth + 'px').style('height', cellsHeight + 'px');

        cells = this.userDiv_.selectAll('.cellBody');

        var scaleY = d3.scaleLinear().rangeRound([this.heightAvail_ - this.length_rugs_ - 5, 0]);

        var minScaleY = d3.min([d3.min(data, function (d) {
                return d["_yhat_"];
            }), d3.min(dataObs, function (d) {
                return d["_y_"];
            })]),
            maxScaleY = d3.max([d3.max(data, function (d) {
                return d["_yhat_"];
            }), d3.max(dataObs, function (d) {
                return d["_y_"];
            })]);

        scaleY.domain([minScaleY, maxScaleY]).nice();

        this.scaleY_ = scaleY;

        cells.each(
            function (d, i) {

                if (variables[i]) { // do not plot chart for empty cell

                    // cell title
                    d3.select(this).append('div').style('background-color', '#f6f6f6')
                        .attr('class', 'divTableRow titleRow').style('display', 'table-row')
                        .append('div').attr('class', 'divTableCell titleCell').style('display', 'table-cell').style('border', '1px solid #DDDDDD')
                        .style('text-align', 'center').style('font', font_size_titles + 'px sans-serif').text(variables[i])

                    // cell chart area
                    var chartArea = d3.select(this).append('div').attr('class', 'divTableRow').style('display', 'table-row')
                    //.style('max-height', svgHeight +'px').style('height', svgHeight+'px')
                        .append('div').attr('class', 'divTableCell').style('display', 'table-cell')
                        //.style('max-height', svgHeight+'px')
                        //.style('height', svgHeight+'px')
                        .append('svg').attr('height', svgHeight).attr('width', cellsWidth).attr('class', 'cellSvg')
                        .append("g").attr("transform", "translate(" + margins.left + "," + margins.top + ")")
                        .attr('class', 'cellMainG cellMainG-' + variablesDict[variables[i]]); //.replace(".","_")

                    chartArea.append("g").attr('class', 'yaxis_title_g').attr("transform", "translate(" + (-margins.left + yAxisTitleSize) + "," + heightAvail / 2 + ")" +
                        ' rotate(-90)')
                        .append('text').text(yaxis_title).style('text-anchor', 'middle').style('font', font_size_axes + 'px sans-serif');

                    chartArea.append("g").attr("class", "axisY").style('font', font_size_axes + 'px sans-serif')
                        .call(d3.axisLeft(scaleY).tickSizeOuter(0).tickSizeInner(-widthAvail).tickPadding(tickPaddingSize).ticks(5).tickFormat(d3.format(""))); //there was a problem with extra thousand seperator


                    // getting only data prepared for given variable as x variable
                    var dataVar = data.filter(function (d) {
                        return (d["_vname_"] == variables[i])
                    });

                    if (typeof dataVar.map(function (x) {
                        return x[variables[i]];
                    })[0] == 'number') {

                        var scaleX = d3.scaleLinear().rangeRound([0 + length_rugs + 5, widthAvail]);

                        scaleX.domain(d3.extent(dataVar, function (d) {
                            return d[variables[i]];
                        })).nice();

                        chartArea.append("g").attr("transform", "translate(0," + heightAvail + ")").style('font', font_size_axes + 'px sans-serif')
                            .attr("class", "axisX")
                            .call(d3.axisBottom(scaleX).tickSizeOuter(0).tickSizeInner(-heightAvail).tickPadding(tickPaddingSize).ticks(5).tickFormat(d3.format(""))); //tickFormat(d3.format("d"))


                    }
                    else if (typeof dataVar.map(function (x) {
                        return x[variables[i]]
                    })[0] == 'string') {


                        if (categorical_order) {

                            if (categorical_order.filter(function (x) {
                                return (x.variable == variables[i])
                            })[0]) {

                                var order = categorical_order.filter(function (x) {
                                    return (x.variable == variables[i])
                                })[0]

                                var domain = [];
                                domain.push(''); //artificial just to add extra space at the beginning
                                for (var key in order) {
                                    if (order.hasOwnProperty(key) && key != 'variable' && order[key] != null) {
                                        domain.push(order[key]);
                                    }
                                }
                                domain.push(' '); //artificial just to add extra space at the end

                                var scaleX = d3.scalePoint().rangeRound([0 + length_rugs, widthAvail]); //CAT-CHANGE
                                scaleX.domain(domain);

                            } else {
                                var scaleX = d3.scalePoint().rangeRound([0 + length_rugs, widthAvail]); //CAT-CHANGE
                                var domain = d3.nest().key(function (d) {
                                    return d[variables[i]]
                                }).entries(dataVar).map(function (x) {
                                    return x.key
                                });
                                domain.unshift(''); //artificial just to add extra space at the beginning
                                domain.push(' '); //artificial just to add extra space at the end
                                scaleX.domain(domain);
                            }

                        }
                        else {

                            var scaleX = d3.scalePoint().rangeRound([0 + length_rugs, widthAvail]); //CAT-CHANGE
                            var domain = d3.nest().key(function (d) {
                                return d[variables[i]]
                            }).entries(dataVar).map(function (x) {
                                return x.key
                            });
                            domain.unshift('');
                            domain.push(' ');
                            scaleX.domain(domain);

                        }

                        // needed to add ends to first and last step in curveStep later
                        halfStepCategorical = scaleX.step() / 2;

                        chartArea.append("g").attr("transform", "translate(0," + heightAvail + ")")
                            .attr("class", "axisX").style('font', font_size_axes + 'px sans-serif')
                            .call(d3.axisBottom(scaleX).tickSizeOuter(0).tickSizeInner(-heightAvail).tickPadding(tickPaddingSize).ticks(5)) //.tickFormat(d3.format("")))
                            .selectAll('text').attr('transform', 'rotate(-20)')
                            .style("text-anchor", "end");
                        //.attr("dy", "-.10em");
                        //.attr("x", 9).attr('y',0)


                    }
                    else {
                        var msg = 'Unable to identify type of variable: ' + variables[i] + ' (not a number or a string).';
                        throw new Error(msg);
                    }

                    scalesX[variables[i]] = scaleX;

                    // artificial beginning of the axes
                    chartArea.append("g").attr('class', 'axis_start')
                        .attr("transform", "translate(0," + heightAvail + ")")
                        .append("line")
                        .attr('class', 'axis_start_line_x')
                        .attr('stroke', 'grey')
                        .attr('stroke-width', '1px')
                        .style('stroke-opacity', 0.5)
                        .style("stroke-linecap", 'round')
                        .attr('y1', 0 + 0.5)  //0.5 is artificial, related to automatic axis shift about 0.5 (look at d attr for axis path)
                        .attr('y2', 0 + 0.5)
                        .attr('x1', 0 + 0.5)
                        .attr('x2', length_rugs + 5 + 0.5)

                    chartArea.append("g").attr('class', 'axis_start')
                        .attr("transform", "translate(0," + heightAvail + ")")
                        .append("line")
                        .attr('class', 'axis_start_line_y')
                        .attr('stroke', 'grey')
                        .style("stroke-linecap", 'round')
                        .style('stroke-width', '1px')
                        .style('stroke-opacity', 0.5)
                        .attr('y1', 0)
                        .attr('y2', -length_rugs - 5)
                        .attr('x1', 0 + 0.5)
                        .attr('x2', 0 + 0.5)


                }
            });

        // customizing axes
        this.userDiv_.selectAll('.domain')
            .style('stroke', 'grey')
            .style('stroke-width', '1px')
            .style('stroke-opacity', 0.5)

        this.userDiv_.selectAll('.tick line')
            .style('stroke', 'grey')
            .style('stroke-width', '1px')
            .style('stroke-opacity', 0.2)

        this.cellsG_ = this.userDiv_.selectAll(".cellMainG") //unnecessary?
        this.scalesX_ = scalesX;
        this.halfStepCategorical_ = halfStepCategorical;
    };


    CeterisParibusPlot.prototype.addingLayer_ = function (data, dataObs, show_profiles, show_observations, show_rugs, show_residuals, aggregate_profiles) {

        var self = this,
            variablesDict = this.variablesDict_;

        this.userDiv_.selectAll(".cellMainG").each(
            function (d, i) {

                var variableCorrected = d3.select(this).attr('class').split('-')[1]; // extracting name of variable for which given cell was created
                var variable = '';
                for (var prop in variablesDict) {
                    if (variablesDict.hasOwnProperty(prop)) {
                        if (variablesDict[prop] === variableCorrected)
                            variable = prop;
                    }
                }

                var dataVar = data.filter(function (d) {
                    return (d["_vname_"] == variable)
                });

                if (variable) {


                    if (show_profiles) {
                        self.icePlot_(d3.select(this), dataVar, dataObs, variable);
                    }
                    if (show_observations) {
                        self.pointPlot_(d3.select(this), dataVar, dataObs, variable);
                    }
                    if (show_rugs) {
                        self.rugPlot_(d3.select(this), dataVar, dataObs, variable);
                    }
                    if (show_residuals) {
                        self.residualPlot_(d3.select(this), dataVar, dataObs, variable);
                    }
                    if (aggregate_profiles) {
                        self.pdpPlot_(d3.select(this), dataVar, dataObs, variable, aggregate_profiles);
                    }
                }
            }
        )

    };


    CeterisParibusPlot.prototype.icePlot_ = function (mainG, dataVar, dataObs, variable) {


        var g = mainG.append("g").attr("class", 'icePlot'),
            scaleY = this.scaleY_,
            scaleColor = this.scaleColor_,
            scaleX = this.scalesX_[variable],
            color = this.color_,
            tooltipDiv = this.tooltipDiv_,
            alpha_ices = this.alpha_ices_,
            size_ices = this.size_ices_,
            self = this,
            is_color_variable = this.is_color_variable_,
            formatPredTooltip = this.formatPredTooltip_,
            halfStepCategorical = this.halfStepCategorical_;

        var per_id_model = d3.nest()
            .key(function (d) {
                return d['_ids_'] + '|' + d['_label_']
            })
            .sortValues(function (a, b) {
                var temp;
                if (typeof scaleX.domain()[0] == 'number') {
                    temp = d3.ascending(scaleX(parseFloat(a[variable])), scaleX(parseFloat(b[variable])));
                } else {
                    temp = d3.ascending(scaleX(a[variable]), scaleX(b[variable]));
                }
                return temp;
            })
            .entries(dataVar);

        if (typeof scaleX.domain()[0] == 'number') {
            var line = d3.line()
                .x(function (d) {
                    return scaleX(d[variable]);
                })
                .y(function (d) {
                    return scaleY(d["_yhat_"]);
                });
        } else {
            var line = d3.line()
                .x(function (d) {
                    return scaleX(d[variable]);
                })
                .y(function (d) {
                    return scaleY(d["_yhat_"]);
                })
                .curve(d3.curveStep);
        }

        var iceplotegroups = g.selectAll('g.iceplotgroup').data(per_id_model).enter().append('g').attr('class', 'iceplotgroup');

        var iceplotlines = iceplotegroups.append("path").attr('class', 'iceplotline')
        //.attr('id', function(x) {return 'iceplotline-' + x.key})
            .attr("fill", "none")                                                         //[0] to get array inside structure {{sth}}
            .attr("stroke", function (x) {
                if (!is_color_variable) {
                    return color;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x.key;
                    })[0][color])
                }
            })
            .attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", size_ices)
            .attr('opacity', alpha_ices)
            .attr("d", function (x) {

                var path;

                if (typeof scaleX.domain()[0] == 'number') {
                    path = line(x.values);
                } else {
                    //adding extra start and end of step curve
                    var path = line(x.values.slice(0, 1)).split('Z')[0] + 'l-' + halfStepCategorical + ',0' + line(x.values) + 'l' + halfStepCategorical + ',0';
                }

                return path;
            });

        var iceplotpoints = iceplotegroups.append('g').attr('class', 'iceplotpointgroup').selectAll('circle.iceplotpoint').data(function (d) {
            return d.values
        }).enter()
            .append("circle").attr('class', 'iceplotpoint')
            //.attr('id', function(x) {return 'iceplotpoint-' + x.key})
            .attr("fill", 'black') //function(x) { return scaleColor(dataObs.filter(function(d) {return (d['_ids_']+ '|' + d['_label_']) == x.key; })[0][color])})               }
            .attr("stroke", 'black') // function(x) { return scaleColor(dataObs.filter(function(d) {return (d['_ids_']+ '|' + d['_label_']) == x.key; })[0][color])})
            .attr('stroke-opacity', '0.2')
            .attr('stroke-width', size_ices)
            .attr('r', size_ices)
            .attr('opacity', 0)
            .attr('cx', function (d) {
                return scaleX(d[variable]);
            })
            .attr('cy', function (d) {
                return scaleY(d['_yhat_']);
            });


        iceplotpoints
            .on("mouseover", function (d) {

                tooltipDiv.html("<b> ICE line </b> <br/>" +
                    "obs. id: " + d['_ids_'] + "<br/>" +
                    "model: " + d['_label_'] + "<br/>" +
                    "y_pred: " + d3.format(formatPredTooltip)(d['_yhat_']) + "<br/>" +
                    variable + ": " + d[variable] + "<br/>"
                )
                    .style("left", (d3.event.pageX + 15) + "px") // we set tooltip position to be there were cursor + 15 px so tooltip's not overlapped by cursor
                    .style("top", (d3.event.pageY) + "px")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_ices + 2)
                    .attr('opacity', 1);

                var id = d['_ids_'],
                    model = d['_label_'];

                self.userDiv_.selectAll(".iceplotline").filter(function (d) {
                    return (id + '|' + model) == d.key;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_ices + 2)
                    .attr('opacity', 1);
                ;


            });

        iceplotpoints
            .on("mouseout", function (d) {

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_ices)
                    .attr('opacity', 0);


                var id = d['_ids_'],
                    model = d['_label_'];

                self.userDiv_.selectAll(".iceplotline").filter(function (d) {
                    return (id + '|' + model) == d.key;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_ices)
                    .attr('opacity', alpha_ices);

                tooltipDiv
                    .transition()
                    .duration(300)
                    .style("opacity", 0);
            });

    };

    CeterisParibusPlot.prototype.pointPlot_ = function (mainG, dataVar, dataObs, variable) {

        var g = mainG.append("g").attr("class", 'pointPlot'),//.attr('id', 'pointPlot'+no_instances)
            per_id_model = d3.nest().key(function (d) {
                return d['_ids_'] + '|' + d['_label_']
            }).entries(dataVar),
            scaleY = this.scaleY_,
            scaleColor = this.scaleColor_,
            scaleX = this.scalesX_[variable],
            color = this.color_,
            tooltipDiv = this.tooltipDiv_,
            alpha_points = this.alpha_points_,
            size_points = this.size_points_,
            color_points = this.color_points_,
            self = this,
            formatPredTooltip = this.formatPredTooltip_;

        var pointplots = g.selectAll('circle.point').data(per_id_model).enter().append("circle").attr('class', 'point')
        //.attr('id', function(x) {return 'linechart-' + x.key})
            .attr("fill", function (x) {
                if (color_points) {
                    return color_points;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x.key;
                    })[0][color])
                }
                ;
                }
            )                                         //[0] to get array inside structure {{cos}}
            .attr("stroke", function (x) {
                if (color_points) {
                    return color_points;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x.key;
                    })[0][color])
                }
                ;
                }
            )
            .attr("stroke-width", '1px')
            .attr("opacity", alpha_points)
            .attr('r', size_points)
            .attr('cx', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0][variable]);
            })
            .attr('cy', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0]['_yhat_']);
            })

        pointplots
            .on("mouseover", function (d) {

                var dataPoint = dataObs.filter(function (x) {
                    return (x['_ids_'] + '|' + x['_label_']) == d.key;
                })[0];

                tooltipDiv.html("<b> Predicted point </b> <br/>" +
                    "obs. id: " + dataPoint['_ids_'] + "<br/>" +
                    "model: " + dataPoint['_label_'] + "<br/>" +
                    "y_pred: " + d3.format(formatPredTooltip)(dataPoint['_yhat_']) + "<br/>" +
                    variable + ": " + dataPoint[variable] + "<br/>"
                )
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY) + "px")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", "4px");

                self.userDiv_.selectAll(".point").filter(function (x) {
                    return (dataPoint['_ids_'] + '|' + dataPoint['_label_']) == x.key;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", "4px");


            });

        pointplots
            .on("mouseout", function (d) {

                var dataPoint = dataObs.filter(function (x) {
                    return (x['_ids_'] + '|' + x['_label_']) == d.key;
                })[0];

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", "1px");

                self.userDiv_.selectAll(".point").filter(function (x) {
                    return (dataPoint['_ids_'] + '|' + dataPoint['_label_']) == x.key;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", "1px");

                tooltipDiv
                    .transition()
                    .duration(300)
                    .style("opacity", 0);
            });

    };

    CeterisParibusPlot.prototype.rugPlot_ = function (mainG, dataVar, dataObs, variable) {

        var g = mainG.append("g").attr("class", 'rugPlot'),//.attr('id', 'rugPlot'+no_instances)
            per_id_model = d3.nest().key(function (d) {
                return d['_ids_'] + '|' + d['_label_']
            }).entries(dataVar),
            scaleY = this.scaleY_,
            scaleColor = this.scaleColor_,
            scaleX = this.scalesX_[variable],
            color = this.color_,
            heightAvail = this.heightAvail_,
            length_rugs = this.length_rugs_,
            alpha_rugs = this.alpha_rugs_,
            color_rugs = this.color_rugs_;

        // rugs for x axis
        g.selectAll('line.rugx').data(per_id_model).enter().append("line").attr('class', 'rugx')
        //.attr('id', function(x) {return 'rugxchart-' + x.key})
            .attr("fill", function (x) {
                if (color_rugs) {
                    return color_rugs;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x.key;
                    })[0][color])
                }
                ;
                }
            )                                         //[0] to get array inside structure {{sth}}
            .attr("stroke", function (x) {
                if (color_rugs) {
                    return color_rugs;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x.key;
                    })[0][color])
                }
                ;
                }
            )
            .attr("opacity", alpha_rugs)
            .attr('y1', heightAvail)
            .attr('y2', heightAvail - length_rugs)      //-length_rugs
            .attr('x1', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0][variable]);
            })
            .attr('x2', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0][variable]);
            })

        // rugs for y axis
        g.selectAll('line.rugy').data(per_id_model).enter().append("line").attr('class', 'rugy')
        //.attr('id', function(x) {return 'rugychart-' + x.key})
            .attr("fill", function (x) {
                if (color_rugs) {
                    return color_rugs;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x.key;
                    })[0][color])
                }
                ;
                }
            )                                         //[0] to get array inside structure {{cos}}
            .attr("stroke", function (x) {
                if (color_rugs) {
                    return color_rugs;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x.key;
                    })[0][color])
                }
                ;
                }
            )
            .attr("opacity", alpha_rugs)
            .attr('x1', 0)
            .attr('x2', 0 + length_rugs)//     +length_rugs
            .attr('y1', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0]['_yhat_']);
            })
            .attr('y2', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0]['_yhat_']);
            })

    };

    CeterisParibusPlot.prototype.residualPlot_ = function (mainG, dataVar, dataObs, variable) {

        var g = mainG.append("g").attr("class", 'residualPlot'),//.attr('id', 'residualPlot'+no_instances)
            id_model = d3.nest().key(function (d) {
                return d['_ids_'] + '|' + d['_label_']
            }).entries(dataVar).map(function (x) {
                return x.key
            }),
            scaleY = this.scaleY_,
            scaleColor = this.scaleColor_,
            scaleX = this.scalesX_[variable],
            color = this.color_,
            tooltipDiv = this.tooltipDiv_,
            alpha_residuals = this.alpha_residuals_,
            size_residuals = this.size_residuals_,
            color_residuals = this.color_residuals_,
            self = this,
            formatPredTooltip = this.formatPredTooltip_;

        // residual lines
        var residuallines = g.selectAll('line.residualline').data(id_model).enter().append("line").attr('class', 'residualline')
        //.attr('id', function(x) {return 'residuallinechart-' + x})
            .attr("fill", function (x) {
                if (color_residuals) {
                    return color_residuals;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x;
                    })[0][color])
                }
                ;
                }
            )                                         //[0] to get array inside structure {{cos}}
            .attr("stroke", function (x) {
                if (color_residuals) {
                    return color_residuals;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x;
                    })[0][color])
                }
                ;
                }
            )
            .attr("opacity", alpha_residuals)
            .attr("stroke-width", '2px') //2px
            .attr("stroke-linecap", "round")
            .attr('x1', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0][variable]);
            })
            .attr('x2', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0][variable]);
            })
            .attr('y1', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0]['_yhat_']);
            })
            .attr('y2', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0]['_y_']);
            });

        // residaul points
        var residualpoints = g.selectAll('circle.residualpoint').data(id_model).enter().append("circle").attr('class', 'residualpoint')
        //.attr('id', function(x) {return 'residualpointchart-' + x})
            .attr("fill", function (x) {
                if (color_residuals) {
                    return color_residuals;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x;
                    })[0][color])
                }
                ;
                }
            )                                         //[0] to get array inside structure {{cos}}
            .attr("stroke", function (x) {
                if (color_residuals) {
                    return color_residuals;
                } else {
                    return scaleColor(dataObs.filter(function (d) {
                        return (d['_ids_'] + '|' + d['_label_']) == x;
                    })[0][color])
                }
                ;
                }
            )
            .attr("stroke-width", '1px')
            .attr("opacity", alpha_residuals)
            .attr('r', size_residuals) // uzaleznic to od czegos
            .attr('cx', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0][variable]);
            })
            .attr('cy', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0]['_y_']);
            });

        residualpoints
            .on("mouseover", function (d) {

                var dataPoint = dataObs.filter(function (x) {
                    return (x['_ids_'] + '|' + x['_label_']) == d;
                })[0];

                tooltipDiv.html("<b> Data point </b> <br/>" +
                    "obs. id: " + dataPoint['_ids_'] + "<br/>" +
                    "y: " + dataPoint['_y_'] + "<br/>" +
                    "y_pred: " + d3.format(formatPredTooltip)(dataPoint['_yhat_']) + "<br/>" +
                    "<b> residual: " + d3.format(formatPredTooltip)(dataPoint['_y_'] - dataPoint['_yhat_']) + "</b> <br/>" +
                    variable + ": " + dataPoint[variable] + "<br/>"
                )
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY) + "px")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", "4px");

                self.userDiv_.selectAll(".residualpoint").filter(function (x) {
                    return (dataPoint['_ids_'] + '|' + dataPoint['_label_']) == x;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", "4px");

                self.userDiv_.selectAll(".residualline").filter(function (x) {
                    return (dataPoint['_ids_'] + '|' + dataPoint['_label_']) == x;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", "4px");

            });


        residualpoints
            .on("mouseout", function (d) {

                var dataPoint = dataObs.filter(function (x) {
                    return (x['_ids_'] + '|' + x['_label_']) == d;
                })[0];

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", "1px");

                self.userDiv_.selectAll(".residualpoint").filter(function (x) {
                    return (dataPoint['_ids_'] + '|' + dataPoint['_label_']) == x;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", "1px");

                self.userDiv_.selectAll(".residualline").filter(function (x) {
                    return (dataPoint['_ids_'] + '|' + dataPoint['_label_']) == x;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", "2px");

                tooltipDiv
                    .transition()
                    .duration(300)
                    .style("opacity", 0);

            });

    };


    CeterisParibusPlot.prototype.pdpPlot_ = function (mainG, dataVar, dataObs, variable, aggregate_profiles) {

        var g = mainG.append("g").attr("class", 'pdpPlot'),//.attr('id', 'pdpPlot'+no_instances)
            scaleY = this.scaleY_,
            scaleColor = this.scaleColor_,
            scaleX = this.scalesX_[variable],
            color = this.color_,
            tooltipDiv = this.tooltipDiv_,
            alpha_pdps = this.alpha_pdps_,
            size_pdps = this.size_pdps_,
            color_pdps = this.color_pdps_,
            self = this,
            formatPredTooltip = this.formatPredTooltip_,
            halfStepCategorical = this.halfStepCategorical_;

        if (aggregate_profiles == 'mean') {
            var nested_data = d3.nest()
                .key(function (d) {
                    return d['_label_'];
                })
                .key(function (d) {
                    return d[variable];
                })
                .sortKeys(function (a, b) {
                    var temp;
                    if (typeof scaleX.domain()[0] == 'number') {
                        temp = d3.ascending(scaleX(parseFloat(a)), scaleX(parseFloat(b)));
                    } else {
                        temp = d3.ascending(scaleX(a), scaleX(b));
                    }
                    return temp;
                })
                .rollup(function (leaves) {
                    return d3.mean(leaves, function (d) {
                        return d['_yhat_'];
                    });
                })
                .entries(dataVar);
        }
        if (aggregate_profiles == 'median') {
            var nested_data = d3.nest()
                .key(function (d) {
                    return d['_label_'];
                })
                .key(function (d) {
                    return d[variable];
                })
                .sortKeys(function (a, b) {
                    var temp;
                    if (typeof scaleX.domain()[0] == 'number') {
                        temp = d3.ascending(scaleX(parseFloat(a)), scaleX(parseFloat(b)));
                    } else {
                        temp = d3.ascending(scaleX(a), scaleX(b));
                    }
                    return temp;
                })
                .rollup(function (leaves) {
                    return d3.median(leaves, function (d) {
                        return d['_yhat_'];
                    });
                })
                .entries(dataVar);
        }


        if (typeof scaleX.domain()[0] == 'number') {
            var line = d3.line()
                .x(function (d) {
                    if (typeof scaleX.domain()[0] == 'number') {
                        return scaleX(parseFloat(d.key));
                    } else {
                        return scaleX(d.key);
                    }
                    ;
                })
                .y(function (d) {
                    return scaleY(d.value);
                });
        } else {
            var line = d3.line()
                .x(function (d) {
                    if (typeof scaleX.domain()[0] == 'number') {
                        return scaleX(parseFloat(d.key));
                    } else {
                        return scaleX(d.key);
                    }
                    ;
                })
                .y(function (d) {
                    return scaleY(d.value);
                })
                .curve(d3.curveStep);
        }

        var pdpgroups = g.selectAll('g.pdpgroup').data(nested_data).enter().append('g').attr('class', 'pdpgroup');

        var pdplines = pdpgroups.append("path").attr('class', 'pdpline')
        //.attr('id', function(x) {return 'pdpchart-' + x.key})
            .attr("fill", "none")
            .attr("stroke", function (x) {
                if (color == '_label_') {
                    return scaleColor(x.key);
                } else {
                    return color_pdps;
                }
                ;
            })
            .attr("stroke-linejoin", "round").attr("stroke-linecap", "round")
            .attr("stroke-width", size_pdps)
            .attr('opacity', alpha_pdps)
            .attr("d", function (x) {

                var path;

                if (typeof scaleX.domain()[0] == 'number') {
                    path = line(x.values);
                } else {
                    //adding extra start and end of step curve
                    var path = line(x.values.slice(0, 1)).split('Z')[0] + 'l-' + halfStepCategorical + ',0' + line(x.values) + 'l' + halfStepCategorical + ',0';
                }

                return path;
            });


        var pdppoints = pdpgroups.append('g').attr('class', 'pdppointgroup').selectAll('circle.pdpplotpoint').data(function (d) {
            return d.values
        }).enter()
            .append("circle").attr('class', 'pdpplotpoint')
            //.attr('id', function(x) {return 'pdpplotpoint-' + x.key})
            .attr("fill", 'black')
            .attr("stroke", 'black')
            .attr('stroke-opacity', '0.2')
            .attr('stroke-width', size_pdps)
            .attr('r', size_pdps)
            .attr('opacity', 0)
            .attr('cx', function (d) {
                return scaleX(d.key);
            })
            .attr('cy', function (d) {
                return scaleY(d.value);
            });

        pdppoints
            .on("mouseover", function (d) {

                var model = d3.select(this.parentNode.parentNode).datum().key;

                tooltipDiv.html("<b> PDP line </b> <br/>" +
                    "model: " + model + "<br/>" +
                    "y_pred: " + d3.format(formatPredTooltip)(d.value) + "<br/>" +
                    variable + ": " + d.key + "<br/>"
                )
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY) + "px")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_pdps + 2)
                    .attr('opacity', 1);


                self.userDiv_.selectAll(".pdpline").filter(function (d) {
                    return model == d.key;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_pdps + 2)
                    .attr('opacity', 1);

            });

        pdppoints
            .on("mouseout", function (d) {

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_pdps)
                    .attr('opacity', 0);


                var model = d3.select(this.parentNode.parentNode).datum().key;

                self.userDiv_.selectAll(".pdpline").filter(function (d) {
                    return model == d.key;
                })
                    .transition()
                    .duration(300)
                    .style("stroke-width", size_pdps)
                    .attr('opacity', alpha_pdps);

                tooltipDiv
                    .transition()
                    .duration(300)
                    .style("opacity", 0);
            });


    };

    CeterisParibusPlot.prototype.scaleColorPrepare_ = function () {

        var no_colors = this.no_colors_,
            default_color = this.default_color,
            defaultPaletteCat = d3.schemeCategory10, //d3.schemePaired,
            defaultPaletteNum = d3.schemeOrRd,
            color = this.color_,
            dataObs = this.dataObs_;

        // adding colors option for no_colors = 2 and no_colors = 1
        defaultPaletteNum[1] = [d3.schemeOrRd[3][1]];
        defaultPaletteNum[2] = [d3.schemeOrRd[3][1], d3.schemeOrRd[3][2]];

        this.scaleColor_ = {};

        if (typeof dataObs.map(function (x) {
            return x[color];
        })[0] == 'string') {

            var domainCat = d3.nest().key(function (d) {
                return d[color]
            }).entries(dataObs).map(function (x) {
                return x.key
            });

            if (defaultPaletteCat.length < domainCat.length) {
                throw new Error('Color variable has too many categories. Currently available: ' + defaultPaletteCat.length + ', given: ' + domainCat.length + '. Reduce no of categories.');
            } else {
                this.scaleColor_ = d3.scaleOrdinal(defaultPaletteCat);
                this.scaleColor_.domain(domainCat);
            }

        }
        else if (typeof dataObs.map(function (x) {
            return x[color];
        })[0] == 'number') {


            var nocolorsAvailable = d3.extent(defaultPaletteNum.map(function (x) {
                return x.length;
            }));

            if (no_colors > nocolorsAvailable[1] || no_colors < nocolorsAvailable[0]) {
                throw new Error('Argument no_colors has an inproper value. Currently available: between ' + nocolorsAvailable[0] + ' and ' + nocolorsAvailable[1] + ', given: ' + no_colors + '. Change no of colors.');
            } else {

                var scale = d3.scaleOrdinal(defaultPaletteNum[no_colors]),
                    scaleMin = d3.min(dataObs.map(function (x) {
                        return x[color]
                    })),
                    scaleMax = d3.max(dataObs.map(function (x) {
                        return x[color]
                    })),
                    scaleDivisions,
                    format,
                    scaleDomain = [];


                // nice() from d3 is making floor and ceil of domain start/end in smart way (attention it matters what we give as a second argument
                // so if we want floor of scaleMin we give it as a first argument, and as a second we can't put anything bigger, cause it changes scaling)
                scaleMin = d3.scaleLinear().domain([scaleMin, scaleMax]).nice().domain()[0]
                scaleMax = d3.scaleLinear().domain([scaleMin, scaleMax]).nice().domain()[1]

                // to have also nice rounded difference we use nice also here
                var diff = d3.scaleLinear().domain([0, (scaleMax - scaleMin) / no_colors]).nice().domain()[1]

                // we create proper divisions
                scaleDivisions = d3.range(scaleMin, scaleMax, diff);
                scaleDivisions.push(scaleMax);
                // making sure scaleMax is not duplicated
                scaleDivisions = scaleDivisions.filter(function (item, pos) {
                    return scaleDivisions.indexOf(item) == pos;
                })


                // changing format to be sure that we have 0.7 when we add 0.3 + 0.4 not 0.699999999999

                if (isFinite(((diff + '').split('.')[1]))) {
                    format = '.' + ((diff + '').split('.')[1]).length + 'f';
                } else {
                    format = '.0f'
                }
                ;

                scaleDivisions = scaleDivisions.map(function (x) {
                    return +d3.format(format)(x)
                });


                if (scaleDivisions.length > 1) {



                    // creating labels for legend keys
                    scaleDivisions.forEach(function (d, i) {
                        if (i < scaleDivisions.length - 1) {
                            scaleDomain.push('[' + d + ';')
                        }
                    }); //d3.format("~s")(d)
                    scaleDivisions.forEach(function (d, i) {
                        if (i > 0) {
                            if (i == scaleDivisions.length - 1) {
                                scaleDomain[i - 1] = scaleDomain[i - 1] + d + ']';
                            } else {
                                scaleDomain[i - 1] = scaleDomain[i - 1] + d + ')';
                            }
                        }
                    });


                } else {

                    scaleDomain = [scaleDivisions[0].toString()];

                }

                scale.domain(scaleDomain);


                // IE 9 > not supporting .indexOf, needed below
                var getPosition = function (elementToFind, arrayElements) {
                    var i;
                    for (i = 0; i < arrayElements.length; i += 1) {
                        if (arrayElements[i] === elementToFind) {
                            return i;
                        }
                    }
                    return null; //not found
                };

                var scaleNew = function (x) {
                    // if we give scale argument from its domain it also should work"
                    if (getPosition(x, scale.domain())) {
                        var position = getPosition(x, scale.domain());
                        return scale.range()[position]
                    } else {
                        var whichRange = [];
                        scaleDivisions.forEach(function (d, i) {

                            if (i > 0) {
                                if (i < scaleDivisions.length - 1) {
                                    if (x < d) {
                                        whichRange.push(i)
                                    }
                                } else {
                                    if (x <= d) {
                                        whichRange.push(i)
                                    }
                                }
                            }
                        });

                        return scale(scaleDomain[d3.min(whichRange) - 1]);
                    }

                };


                scaleNew.domain = scale.domain;
                scaleNew.range = scale.range;
                scaleNew.unknown = scale.unknown;
                scaleNew.copy = scale.copy;

                this.scaleColor_ = scaleNew;

            }

        }


        else {
            this.scaleColor_ = d3.scaleOrdinal();
            this.scaleColor_.range([default_color]);
            this.scaleColor_.domain(['default']);
        }
    };


    CeterisParibusPlot.prototype.createTable_ = function (fn) {

        var headers = Object.keys(this.dataObs_[0]),
            self = this;

        if (!headers) {
            console.warn('no data for table!');
            return;
        }

        if (this.userDiv_.select('.tableDivCP')) {
            this.userDiv_.select('.tableDivCP').remove();
        }

        var tableDivCP = this.userDiv_.append('div')
            .attr('class', 'ceterisParibusD3 tableDivCP')
            .style('max-height', this.chartHeight_ + 'px')
            .style('width', this.visWidth_ + 'px')
            .style('height', this.chartHeight_ + 'px')
            .style('font', this.font_size_table_ + 'px sans-serif');

        var tableCP = tableDivCP.append('table').attr('class', 'tableCP compact hover row-border nowrap') //display - css class from DataTable, nowrap - proper sizing of rows when little space
            .attr('id', 'tableCP_' + this.CP_id_)
            .attr('width', '100%')
            .attr('cellspacing', 0)
            .style('max-height', this.chartHeight_ + 'px')
            .attr('heigth', '100%')

        var tableHead = tableCP.append('thead').append('tr')
            .selectAll('th').data(headers).enter().append("th").text(function (d) {
                return d;
            });


        var tableRows = tableCP.append('tbody')
            .selectAll('tr').data(this.dataObs_).enter().append("tr")
            .attr("bgcolor", "white")
            .style("cursor", "default");

        var tableCells = tableRows.selectAll('td')
            .data(function (d) {
                var val;

                if (!Object.values) {
                    val = Object.keys(d).map(function (e) {
                        return d[e];
                    });
                }
                else {
                    val = Object.values(d);
                }

                return val;
                ;
            }).enter().append("td").text(function (d) {
                return d;
            });

        //adding events for rows
        tableRows.on("mouseover", function (d) {

            /* d3.select(this)
                        .attr("bgcolor", "#eee");
                      */ //not needed datatable hover class is doing it

            // highlight iceline
            var id = d['_ids_'],
                model = d['_label_'];

            self.userDiv_.selectAll(".iceplotline").filter(function (d) {
                return (id + '|' + model) == d.key;
            })
            //             .transition()
            //             .duration(100)
                .style("stroke-width", self.size_ices_ + 2)
                .attr('opacity', 1);

            self.userDiv_.selectAll(".iceplotline").filter(function (d) {
                return (id + '|' + model) != d.key;
            })
            //           .transition()
            //         .duration(100)
                .attr('opacity', 0);


            // highlight point
            self.userDiv_.selectAll(".point").filter(function (x) {
                return (id + '|' + model) == x.key;
            })
            //     .transition()
            //    .duration(100)
                .style("stroke-width", "4px");

            self.userDiv_.selectAll(".point").filter(function (x) {
                return (id + '|' + model) != x.key;
            })
            //   .transition()
            //     .duration(100)
                .attr("opacity", 0);


            // highlight residual
            self.userDiv_.selectAll(".residualpoint").filter(function (x) {
                return (id + '|' + model) == x;
            })
            //       .transition()
            //     .duration(100)
                .style("stroke-width", "4px");

            self.userDiv_.selectAll(".residualpoint").filter(function (x) {
                return (id + '|' + model) != x;
            })
            //     .transition()
            //       .duration(100)
                .attr("opacity", 0);

            self.userDiv_.selectAll(".residualline").filter(function (x) {
                return (id + '|' + model) == x;
            })
            //         .transition()
            //           .duration(100)
                .style("stroke-width", "4px");

            self.userDiv_.selectAll(".residualline").filter(function (x) {
                return (id + '|' + model) != x;
            })
            //               .transition()
            //             .duration(100)
                .attr("opacity", 0);

        });


        tableRows.on("mouseout", function (d) {

            /*
                        d3.select(this)
                        .attr("bgcolor", "white");
                        */ //not needed datatable hover class is doing it

            var id = d['_ids_'],
                model = d['_label_'];

            // highlight iceline
            self.userDiv_.selectAll(".iceplotline").filter(function (d) {
                return (id + '|' + model) == d.key;
            })
            //                   .transition()
            //                   .duration(100)
                .style("stroke-width", self.size_ices_)
                .attr('opacity', self.alpha_ices_);

            self.userDiv_.selectAll(".iceplotline").filter(function (d) {
                return (id + '|' + model) != d.key;
            })
            //                   .transition()
            //                   .duration(100)
                .attr('opacity', self.alpha_ices_);

            // highlight point
            self.userDiv_.selectAll(".point").filter(function (x) {
                return (id + '|' + model) == x.key;
            })
            //               .transition()
            //                 .duration(100)
                .style("stroke-width", "1px");

            self.userDiv_.selectAll(".point").filter(function (x) {
                return (id + '|' + model) != x.key;
            })
            //             .transition()
            //           .duration(100)
                .attr("opacity", self.alpha_points_);


            // highlight residual
            self.userDiv_.selectAll(".residualpoint").filter(function (x) {
                return (id + '|' + model) == x;
            })
            //         .transition()
            //       .duration(100)
                .style("stroke-width", "1px");

            self.userDiv_.selectAll(".residualpoint").filter(function (x) {
                return (id + '|' + model) != x;
            })
            //     .transition()
            //   .duration(100)
                .attr("opacity", self.alpha_residuals_);

            self.userDiv_.selectAll(".residualline").filter(function (x) {
                return (id + '|' + model) == x;
            })
            //             .transition()
            //               .duration(100)
                .style("stroke-width", "2px");

            self.userDiv_.selectAll(".residualline").filter(function (x) {
                return (id + '|' + model) != x;
            })
            //           .transition()
            //         .duration(100)
                .attr("opacity", self.alpha_residuals_);

        });

        this.tableDivCP_ = tableDivCP;

        // to use scrollX nicely https://datatables.net/examples/basic_init/scroll_x.html
        tableDivCP.selectAll('th').style('white-space', 'nowrap');
        tableDivCP.selectAll('td').style('white-space', 'nowrap');

        var tableId = '#' + 'tableCP_' + this.CP_id_;

        var dt_options = {
            "scrollX": true,
            "paging": false,
            "scrollY": 200,
            "pageResize": true,
            "scrollCollapse": true,
            //"info": true,
            //"lengthChange": false, //removing Showing 1 of 15 entries
            "dom": '<"toolbar">frtip' // for title of the table
            //"retrieve": true // to be able to ca,, DT multiple times,
        }

        dt_options.scrollY = this.chartHeight_ - 4 * 20; //scrollY parameter sets only table height without header, 4 elementy kolo 20 pikseli maja (header, footer, search, name)

        $(document).ready(function () {

            $(tableId).DataTable(dt_options);
            $("div.toolbar").html('<b>Dataset:</b> '); // for title of the table

        });


        this.tableDivCP_.style('color', this.default_font_color);

        // attention: i don't have to create proper html table to do this, i can make it from JS object using DT options
        // look here https://datatables.net/examples/data_sources/js_array.html
        // tableDivCP.selectAll('.dataTables_wrapper').style('max-width', '100%')//
        //$(".dataTables_wrapper").css("width", '600px')
    };


    CeterisParibusPlot.prototype.addEventListenerResize_ = function (fn) {

        if (window.attachEvent) { //for IE < 9
            window.attachEvent('onresize', fn);
        }
        else if (window.addEventListener) { // for the rest
            window.addEventListener('resize', fn, true);
        }
        else {
            //The browser does not support Javascript event binding
        }

    };


    CeterisParibusPlot.prototype.updateXYScalesAndAxes_ = function () {

        // assuming all parameters was updated earlier

        // y axes

        this.scaleY_ = this.scaleY_.rangeRound([this.heightAvail_ - this.length_rugs_ - 5, 0]);
        this.cellsG_.selectAll('.axisY').nodes().map(function (d) {
            d.innerHTML = '';
            return;
        })
        this.cellsG_.selectAll('.axisY').call(d3.axisLeft(this.scaleY_).tickSizeOuter(0)
            .tickSizeInner(-this.widthAvail_).tickPadding(this.default_tickPadding).ticks(5).tickFormat(d3.format("")));

        // x axes

        // removing old x axis
        this.cellsG_.selectAll('.axisX').nodes().map(function (d) {
            d.innerHTML = '';
            return;
        })

        // updating x scales and adding new x axes
        for (var i = 0; i < this.variables_.length; ++i) {

            var classToTake = '.cellMainG-' + this.variablesDict_[this.variables_[i]];

            if (typeof this.scalesX_[this.variables_[i]].domain()[0] == 'number') {
                this.scalesX_[this.variables_[i]] = this.scalesX_[this.variables_[i]].rangeRound([0 + this.length_rugs_ + 5, this.widthAvail_]);
                this.mainDivCP_.select(classToTake).select('.axisX')
                    .attr("transform", "translate(0," + this.heightAvail_ + ")")
                    .call(d3.axisBottom(this.scalesX_[this.variables_[i]]).tickSizeOuter(0).tickSizeInner(-this.heightAvail_)
                        .tickPadding(this.default_tickPadding).ticks(5).tickFormat(d3.format("")));
            }
            else if (typeof this.scalesX_[this.variables_[i]].domain()[0] == 'string') {
                this.scalesX_[this.variables_[i]] = this.scalesX_[this.variables_[i]].rangeRound([0 + this.length_rugs_, this.widthAvail_]);
                this.mainDivCP_.select(classToTake).select('.axisX')
                    .attr("transform", "translate(0," + this.heightAvail_ + ")")
                    .call(d3.axisBottom(this.scalesX_[this.variables_[i]]).tickSizeOuter(0).tickSizeInner(-this.heightAvail_).tickPadding(this.default_tickPadding).ticks(5))
                    .selectAll('text').attr('transform', 'rotate(-20)')
                    .style("text-anchor", "end");
                this.halfStepCategorical_ = this.scalesX_[this.variables_[i]].step() / 2;
            }

        }

        // axes artificial beginning

        this.plotDivCP_.selectAll('.axis_start').attr("transform", "translate(0," + this.heightAvail_ + ")");
        this.plotDivCP_.selectAll('.axis_start_line_x').attr('x2', this.length_rugs_ + 5 + 0.5);
        this.plotDivCP_.selectAll('.axis_start_line_y').attr('y2', -this.length_rugs_ - 5);


        // customizing axes
        this.userDiv_.selectAll('.domain')
            .style('stroke', 'grey')
            .style('stroke-width', '1px')
            .style('stroke-opacity', 0.5)

        this.userDiv_.selectAll('.tick line')
            .style('stroke', 'grey')
            .style('stroke-width', '1px')
            .style('stroke-opacity', 0.2)


    };


    CeterisParibusPlot.prototype.updateCellsStructure_ = function () {


        this.userDiv_.select('.titleDivCP')
            .style('height', this.titleDivHeight_ + 'px')
            .style('width', this.visWidth_ + 'px');

        this.userDiv_.select('.mainDivCP')
            .style('height', this.chartHeight_ + 'px')
            .style('width', this.visWidth_ + 'px')


        if (this.add_table_) {

            var tableId = '#' + 'tableCP_' + this.CP_id_;

            var dt_options = {
                "scrollX": true,
                "paging": false,
                "scrollY": 200,
                "pageResize": true,
                "scrollCollapse": true,
                //"info": true,
                //"lengthChange": false, //removing Showing 1 of 15 entries
                "dom": '<"toolbar">frtip', // for title of the table
                //"retrieve": true // to be able to ca,, DT multiple times,
                'destroy': true
            }

            dt_options.scrollY = this.chartHeight_ - 4 * 20; //scrollY parameter sets only table height without header, 4 elementy kolo 20 pikseli maja (header, footer, search, name)

            $(tableId).DataTable(dt_options);
            $("div.toolbar").html('<b>Dataset:</b> '); // for title of the table


            //$(tableId).DataTable.destroy();

            this.userDiv_.select('.tableDivCP')
                .style('max-height', this.chartHeight_ + 'px')
                .style('width', this.visWidth_ + 'px')
                .style('height', this.chartHeight_ + 'px') // must have for scrollResize working
                .style('font', this.font_size_table_ + 'px sans-serif');


            this.userDiv_.select('.tableCP')
                .style('max-height', this.chartHeight_ + 'px');

        }


        this.userDiv_.selectAll('.yaxis_title_g').attr("transform", "translate(" + (-this.default_margins.left + this.yAxisTitleSize_) + "," + this.heightAvail_ / 2 + ")" +
            ' rotate(-90)')

        this.userDiv_.selectAll('.cellMainG').attr("transform", "translate(" + this.default_margins.left + "," + this.default_margins.top + ")")

        this.userDiv_.selectAll('.cellSvg')
            .attr('height', this.svgHeight_).attr('width', this.cellsWidth_);

        this.plotDivCP_.selectAll('.cellRow')
            .style('height', this.cellsHeight_ + 'px');

        this.plotDivCP_.selectAll('.cell')
            .style('height', this.cellsHeight_ + 'px').style('width', this.cellsWidth_ + 'px');

        this.plotDivCP_.selectAll('.cellBody')
            .style('height', this.cellsHeight_ + 'px').style('width', this.cellsWidth_ + 'px');

        this.userDiv_.select('.plotDivTableBody')
            .style('height', this.chartHeight_ + 'px')
            .style('width', this.plotWidth_ + 'px');


    };


    CeterisParibusPlot.prototype.updateLegend_ = function () {

        if (this.is_color_variable_) {

            var legend_part_size = this.legend_part_size_,
                legend_keys_size = this.legend_keys_size_,
                legend_shift = this.legend_shift_;

            this.legendDivCP_.select('.divTableBody')
                .style('height', this.chartHeight_ + 'px').style('width', this.legendWidth_ + 'px');

            this.legendDivCP_.select('svg')
                .attr('height', this.chartHeight_).attr('width', this.legendWidth_);

            this.legendDivCP_.select('text.legendTitle')
                .attr('y', (1 + legend_shift) * legend_part_size);

            this.legendDivCP_.select('g.legendKeysGroup')
                .attr("transform", "translate(" + (this.legendWidth_ * 0.1) + "," + 0 + ")");

            this.legendDivCP_.selectAll('.keyGroup')
                .attr("transform", function (d, i) {
                    return "translate(0," + (i + 2 + legend_shift) * legend_part_size + ")";
                });

            this.legendDivCP_.selectAll('.keyGroup').selectAll('rect')
                .attr("x", -legend_keys_size).attr("width", legend_keys_size).attr("height", legend_keys_size)
                .attr('y', -legend_keys_size)

        }

    };


    CeterisParibusPlot.prototype.updateIcePlot_ = function (mainG, variable) {

        var scaleY = this.scaleY_,
            scaleX = this.scalesX_[variable],
            dataObs = this.dataObs_,
            halfStepCategorical = this.halfStepCategorical_;

        if (typeof scaleX.domain()[0] == 'number') {
            var line = d3.line()
                .x(function (d) {
                    return scaleX(d[variable]);
                })
                .y(function (d) {
                    return scaleY(d["_yhat_"]);
                });
        } else {
            var line = d3.line()
                .x(function (d) {
                    return scaleX(d[variable]);
                })
                .y(function (d) {
                    return scaleY(d["_yhat_"]);
                })
                .curve(d3.curveStep);
        }


        mainG.selectAll('.iceplotline').attr("d", function (x) {

            var path;

            if (typeof scaleX.domain()[0] == 'number') {
                path = line(x.values);
            } else {
                //adding extra start and end of step curve
                var path = line(x.values.slice(0, 1)).split('Z')[0] + 'l-' + halfStepCategorical + ',0' + line(x.values) + 'l' + halfStepCategorical + ',0';
            }

            return path;
        });

        mainG.selectAll('.iceplotpoint')
            .attr('cx', function (d) {
                return scaleX(d[variable]);
            })
            .attr('cy', function (d) {
                return scaleY(d['_yhat_']);
            });


    };

    CeterisParibusPlot.prototype.updatePointPlot_ = function (mainG, variable) {

        var scaleY = this.scaleY_,
            scaleX = this.scalesX_[variable],
            dataObs = this.dataObs_;

        var line = d3.line()
            .x(function (d) {
                return scaleX(d[variable]);
            })
            .y(function (d) {
                return scaleY(d["_yhat_"]);
            });

        mainG.selectAll('circle.point')
            .attr('cx', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0][variable]);
            })
            .attr('cy', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0]['_yhat_']);
            })

    };


    CeterisParibusPlot.prototype.updateRugPlot_ = function (mainG, variable) {

        var scaleY = this.scaleY_,
            scaleX = this.scalesX_[variable],
            heightAvail = this.heightAvail_,
            length_rugs = this.length_rugs_,
            dataObs = this.dataObs_;


        // rugs for x axis
        mainG.selectAll('line.rugx')
            .attr('y1', heightAvail)
            .attr('y2', heightAvail - length_rugs)
            .attr('x1', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0][variable]);
            })
            .attr('x2', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0][variable]);
            })

        // rugs for y axis
        mainG.selectAll('line.rugy')
            .attr('x1', 0)
            .attr('x2', 0 + length_rugs)
            .attr('y1', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0]['_yhat_']);
            })
            .attr('y2', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x.key;
                })[0]['_yhat_']);
            })

    };


    CeterisParibusPlot.prototype.updateResidualPlot_ = function (mainG, variable) {

        var scaleY = this.scaleY_,
            scaleX = this.scalesX_[variable],
            dataObs = this.dataObs_;

        // residaul lines
        mainG.selectAll('line.residualline')
            .attr('x1', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0][variable]);
            })
            .attr('x2', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0][variable]);
            })
            .attr('y1', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0]['_yhat_']);
            })
            .attr('y2', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0]['_y_']);
            });

        // residaul points
        mainG.selectAll('circle.residualpoint')
            .attr('cx', function (x) {
                return scaleX(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0][variable]);
            })
            .attr('cy', function (x) {
                return scaleY(dataObs.filter(function (d) {
                    return (d['_ids_'] + '|' + d['_label_']) == x;
                })[0]['_y_']);
            });

    };


    CeterisParibusPlot.prototype.updatePdpPlot_ = function (mainG, variable) {

        var scaleY = this.scaleY_,
            scaleX = this.scalesX_[variable],
            halfStepCategorical = this.halfStepCategorical_;

        if (typeof scaleX.domain()[0] == 'number') {
            var line = d3.line()
                .x(function (d) {
                    if (typeof scaleX.domain()[0] == 'number') {
                        return scaleX(parseFloat(d.key));
                    } else {
                        return scaleX(d.key);
                    }
                    ;
                })
                .y(function (d) {
                    return scaleY(d.value);
                });
        } else {
            var line = d3.line()
                .x(function (d) {
                    if (typeof scaleX.domain()[0] == 'number') {
                        return scaleX(parseFloat(d.key));
                    } else {
                        return scaleX(d.key);
                    }
                    ;
                })
                .y(function (d) {
                    return scaleY(d.value);
                })
                .curve(d3.curveStep);
        }

        mainG.selectAll('path.pdpline')
            .attr("d", function (x) {

                var path;

                if (typeof scaleX.domain()[0] == 'number') {
                    path = line(x.values);
                } else {
                    //adding extra start and end of step curve
                    var path = line(x.values.slice(0, 1)).split('Z')[0] + 'l-' + halfStepCategorical + ',0' + line(x.values) + 'l' + halfStepCategorical + ',0';
                }

                return path;
            });

        mainG.selectAll('circle.pdpplotpoint')
            .attr('cx', function (d) {
                return scaleX(d.key);
            })
            .attr('cy', function (d) {
                return scaleY(d.value);
            });

    };


    CeterisParibusPlot.prototype.updatePlots_ = function () {

        var self = this,
            variablesDict = this.variablesDict_;

        this.userDiv_.selectAll(".cellMainG").each(
            function (d, i) {

                var variableCorrected = d3.select(this).attr('class').split('-')[1]; // extracting name of variable for which given cell was created
                var variable = '';
                for (var prop in variablesDict) {
                    if (variablesDict.hasOwnProperty(prop)) {
                        if (variablesDict[prop] === variableCorrected)
                            variable = prop;
                    }
                }

                if (variable) {

                    if (self.show_profiles_) {
                        self.updateIcePlot_(d3.select(this), variable);
                    }
                    if (self.show_observations_) {
                        self.updatePointPlot_(d3.select(this), variable);
                    }
                    if (self.show_rugs_) {
                        self.updateRugPlot_(d3.select(this), variable);
                    }
                    if (self.show_residuals_) {
                        self.updateResidualPlot_(d3.select(this), variable);
                    }
                    if (self.aggregate_profiles_) {
                        self.updatePdpPlot_(d3.select(this), variable);
                    }
                }
            }
        )


    };

    CeterisParibusPlot.prototype.resizeFonts = function () {

        var getAdjustmentPct = function (visWidth) {

            var adjustment = 1;

            if (visWidth > 400 && visWidth < 600) {
                adjustment = 0.8;
            } else if (visWidth > 200 && visWidth <= 400) {
                adjustment = 0.6;
            } else if (visWidth <= 200) {
                adjustment = 0.4;
            } else {
                adjustment = 1;
            }

            return adjustment;
        }

        var getAdjustmentPctForLegendHeight = function (chartHeight) {

            var adjustment = 1;

            if (chartHeight > 100 && chartHeight < 200) {
                adjustment = 0.8;
            } else if (chartHeight > 50 && chartHeight <= 100) {
                adjustment = 0.6;
            } else if (chartHeight <= 50) {
                adjustment = 0.4;
            } else {
                adjustment = 1;
            }

            return adjustment;
        }


        // fonts won't be resized if user give some values for these parameters
        if (!this.is_set_font_size_plot_title_) {
            this.font_size_plot_title_ = Math.round(this.default_font_size_plot_title * getAdjustmentPct(this.visWidth_));
            if (!this.init_size_calculations_) {
                this.userDiv_.selectAll('.titleDivCP').style('font', 'bold ' + this.font_size_plot_title_ + 'px sans-serif')
            }
        }

        if (!this.is_set_font_size_titles_) {
            this.font_size_titles_ = Math.round(this.default_font_size_titles * getAdjustmentPct(this.visWidth_));
            if (!this.init_size_calculations_) {
                this.plotDivCP_.selectAll('.titleCell').style('font', this.font_size_titles_ + 'px sans-serif')
            }
            ;
            }


        if (!this.is_set_font_size_axes_) {
            this.font_size_axes_ = Math.round(this.default_font_size_axes * getAdjustmentPct(this.visWidth_));
            // moved to calculateSizeParameter()
            //this.plotDivCP_.selectAll('.axisY').style('font', this.font_size_axes_ + 'px sans-serif');
            //this.plotDivCP_.selectAll('.axisX').style('font', this.font_size_axes_ + 'px sans-serif');
        }

        if (!this.is_set_font_size_tootlips_) {
            this.font_size_tootlips_ = Math.round(this.default_font_size_tootlips * getAdjustmentPct(this.visWidth_));
            if (!this.init_size_calculations_) {
                this.plotDivCP_.select('.tooltip').style('font', this.font_size_tootlips_ + 'px sans-serif')
            }
            ;
        }


        if (this.is_color_variable_ & !this.is_set_font_size_legend_) {
            // for legend height is also important, so I take min oft w and h (perfect: check max possible height by legend height and set it here)
            this.font_size_legend_ = Math.round(this.default_font_size_legend * d3.min([getAdjustmentPct(this.visWidth_), getAdjustmentPctForLegendHeight(this.chartHeight_)]));
            if (!this.init_size_calculations_) {
                this.legendDivCP_.selectAll('text').style('font', this.font_size_legend_ + 'px sans-serif')
            }
            ;
        }

        if (!this.is_set_font_size_table_ & this.add_table_) {
            this.font_size_table_ = Math.round(this.default_font_size_table * getAdjustmentPct(this.visWidth_));
            if (!this.init_size_calculations_) {
                this.tableDivCP_.style('font', this.font_size_table_ + 'px sans-serif')
            }
            ;
        }

    };


    CeterisParibusPlot.prototype.resizePlot_ = function (width, height) {

        var w = 0,
            h = 0;

        if ((width === null) != (height === null)) {
            console.warn("resizePlot_() should be called with no arguments or with 2 non-NULL arguments. Pretending there were no arguments passed.");
            width = height = null;
        }

        if (width) {
            w = width;
            h = height;
        } else {

            w = this.userDiv_.property('clientWidth');
            h = this.userDiv_.property('clientHeight');

        }

        if (Math.abs(w - this.visWidth_) <= 5 && Math.abs(h - this.visHeight_) <= 5) {
            return;
        } else {

            this.visHeight_ = h;
            this.visWidth_ = w;

            this.resizeFonts();

            this.calculateSizeParameters_();


            this.updateXYScalesAndAxes_();
            this.updateCellsStructure_();
            this.updateLegend_();
            this.updatePlots_();

        }

    };

    CeterisParibusPlot.prototype.generateUniqueId_ = function () {

        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal. - https://gist.github.com/gordonbrander/2230317

        var unique_id = '_' + Math.random().toString(36).substr(2, 10);
        /* do {
                var unique_id = '_' + Math.random().toString(36).substr(2, 10);
            }
            while (!d3.select('#chartDiv')["_groups"][0][0])

            */

        return unique_id;
    }


    CeterisParibusPlot.prototype.getSize_ = function (d3_selection) {

        return d3_selection.node().getBoundingClientRect();
    }

    CeterisParibusPlot.prototype.calculateAxesFontandMargins_ = function () {

        var maxMargin = Math.round(0.3 * d3.min([this.svgHeight_, this.cellsWidth_])); // setting margins to be at most 30% of min(height, width)

        var calculateMargins = function (self, font_size) {

            // to be evoked after init()
            var temporaryTextField = self.userDiv_.append('div').attr('id', 'temporary_text_div')
                .style('opacity', 0).style("position", 'absolute')
                .style("height", 'auto').style("width", 'auto')
                .style('font', font_size + 'px sans-serif');

            // yaxis title width
            temporaryTextField.text(self.yaxis_title_);
            var yAxisTitleSize = self.getSize_(temporaryTextField).height; //height, not width because I didn't rotate it yet

            // yaxis ticks width (only one per all variables, we create artificial axis to get all ticks values)

            var minTempScaleY = d3.min([d3.min(self.data_, function (d) {
                    return d["_yhat_"];
                }),
                    d3.min(self.dataObs_, function (d) {
                        return d["_y_"];
                    })]),
                maxTempScaleY = d3.max([d3.max(self.data_, function (d) {
                    return d["_yhat_"];
                }),
                    d3.max(self.dataObs_, function (d) {
                        return d["_y_"];
                    })]);

            var tempScaleY = d3.scaleLinear().rangeRound([self.svgHeight_, 0]);

            tempScaleY.domain([minTempScaleY, maxTempScaleY]).nice();
            var aa = d3.axisLeft(tempScaleY).ticks(5).tickFormat(d3.format(""))

            var tempTicks = aa.scale().ticks();

            var tempTicksSize = tempTicks.map(function (d) {
                temporaryTextField.text(d);
                return self.getSize_(temporaryTextField).width;
            })

            var yAxisSize = d3.max(tempTicksSize);

            // xaxis (max per each variable)

            var xAxisSize = 0;
            var tempXAxisSize = 0;

            var variables = self.variables_;

            for (var i = 0; i < variables.length; ++i) {

                // getting only data prepared for given variable as x variable
                var dataVar = self.data_.filter(function (d) {
                    return (d["_vname_"] == variables[i])
                });

                // for numeric variable getting height of min value only
                if (typeof dataVar.map(function (x) {
                    return x[variables[i]];
                })[0] == 'number') {

                    temporaryTextField.text(d3.format('d')(d3.min(dataVar, function (d) {
                        return d[variables[i]];
                    })));
                    tempXAxisSize = self.getSize_(temporaryTextField).height;
                    xAxisSize = d3.max([xAxisSize, tempXAxisSize]);

                }
                // for categorical variable getting height of the longest word only (rotated)
                else if (typeof dataVar.map(function (x) {
                    return x[variables[i]]
                })[0] == 'string') {

                    var domain = d3.nest().key(function (d) {
                        return d[variables[i]]
                    }).entries(dataVar).map(function (x) {
                        return x.key
                    });
                    var domainLength = domain.map(function (x) {
                        return x.length
                    });
                    var getIndex = 0;
                    for (var j = 0; j < domainLength.length; ++j) {
                        if (d3.max(domainLength) === domainLength[j]) {
                            getIndex = j;
                        }
                    }

                    temporaryTextField.text(domain[getIndex]);
                    temporaryTextField.style('transform', 'rotate(-20deg)')
                    tempXAxisSize = self.getSize_(temporaryTextField).height;
                    xAxisSize = d3.max([xAxisSize, tempXAxisSize]);

                    temporaryTextField.style('transform', 'rotate(0deg)')
                }

            }

            var margin = Math.ceil(d3.max([yAxisTitleSize + yAxisSize + self.default_margin_yaxis_title + self.default_tickPadding,
                xAxisSize + self.default_tickPadding]));

            temporaryTextField.remove();

            return {margin: margin, yAxisTitleSize: yAxisTitleSize};
        };

        if (this.is_set_font_size_axes_) {

            var results = calculateMargins(this, this.font_size_axes_);

            if (results.margin <= maxMargin) {

                this.default_margins.left = results.margin;
                this.default_margins.bottom = results.margin;
            } else {

                this.default_margins.left = maxMargin;
                this.default_margins.bottom = maxMargin;
            }

            this.yAxisTitleSize_ = results.yAxisTitleSize;

        } else {

            var tempFontSize = this.font_size_axes_ + 1;

            do {
                tempFontSize = tempFontSize - 1; // we can change to -2 to faster change
                var results = calculateMargins(this, tempFontSize);
            }
            while (results.margin > maxMargin & tempFontSize > 1) //results.margin > maxMargin) attention! while loop here

            this.default_margins.left = results.margin;
            this.default_margins.bottom = results.margin;
            this.font_size_axes_ = tempFontSize;
            this.yAxisTitleSize_ = results.yAxisTitleSize;
        }

    };

    CeterisParibusPlot.prototype.calculateSizeParameters_ = function () {


        if (this.init_size_calculations_) {

            // whole visualization parameters
            if (options.hasOwnProperty('width') && options.width !== null) {
                this.visWidth_ = options.width;
            } else {
                this.visWidth_ = this.default_width;
            }

            if (options.hasOwnProperty('height') && options.height !== null) {
                this.visHeight_ = options.height;
            } else {
                this.visHeight_ = this.default_height;
            }

            // title part
            var temporaryTextField = this.userDiv_.append('div').attr('id', 'temporary_text_div')
                .style('opacity', 0).style("position", 'absolute')
                .style("height", 'auto').style("width", 'auto');

            temporaryTextField.style('font', 'bold ' + this.font_size_plot_title_ + 'px sans-serif');
            temporaryTextField.text(this.plot_title_);

            this.titleDivHeight_ = this.getSize_(temporaryTextField).height;

            // chart - part with plots and legend (= not table) visualization parameters
            if (this.add_table_) {
                this.chartHeight_ = (this.visHeight_ - this.titleDivHeight_) / 2;
            } else {
                this.chartHeight_ = (this.visHeight_ - this.titleDivHeight_);
            }

            this.resizeFonts();
            // plot part (1/2)
            this.plotWidth_ = this.is_color_variable_ ? this.visWidth_ * 0.8 : this.visWidth_;

            // legend part
            this.legendWidth_ = this.visWidth_ - this.plotWidth_;


            // plot part (2/2)

            this.nCells_ = this.variables_.length;
            this.rows_ = Math.floor(Math.sqrt(this.nCells_));
            this.cols_ = Math.floor(Math.ceil(this.nCells_ / this.rows_));
            this.cellsHeight_ = Math.floor(this.chartHeight_ / this.rows_);
            this.cellsWidth_ = Math.floor(this.plotWidth_ / this.cols_);


            // checking cell title height
            temporaryTextField.style('font', this.font_size_titles_ + 'px sans-serif')
            temporaryTextField.text(this.variables_[1]);

            this.titleCellHeight_ = this.getSize_(temporaryTextField).height;

            temporaryTextField.remove();

            this.svgHeight_ = this.cellsHeight_ - this.titleCellHeight_;

            // calculate proper mergins
            this.calculateAxesFontandMargins_();
            this.widthAvail_ = this.cellsWidth_ - this.default_margins.left - this.default_margins.right,
                this.heightAvail_ = this.cellsHeight_ - this.titleCellHeight_ - this.default_margins.top - this.default_margins.bottom;

            this.length_rugs_ = this.size_rugs_ * d3.min([this.heightAvail_, this.widthAvail_]) * 0.1; // 0.1 - maximum length of rugs is 10% of Y/X axis height/width


            // calculate legend elements
            this.legend_part_size_ = Math.floor(this.chartHeight_ / 11); // 11 = 1 for legend title and 10 because of max color available

            this.legend_keys_size_ = d3.min([this.default_max_legend_key_size, Math.round(this.legend_part_size_ * 0.5)]); //(0.5 of legendPartSize will do as gapsize)

            this.default_legend_keys_size_ = this.legend_keys_size_;

            this.init_size_calculations_ = false;
        } else { //when resize was evoked resizePlot_() - it sets visHeight and visWidth


            // title part
            var temporaryTextField = this.userDiv_.append('div').attr('id', 'temporary_text_div')
                .style('opacity', 0).style("position", 'absolute')
                .style("height", 'auto').style("width", 'auto');

            temporaryTextField.style('font', 'bold ' + this.font_size_plot_title_ + 'px sans-serif');
            temporaryTextField.text(this.plot_title_);

            this.titleDivHeight_ = this.getSize_(temporaryTextField).height;


            if (this.add_table_) {
                this.chartHeight_ = (this.visHeight_ - this.titleDivHeight_) / 2;
            } else {
                this.chartHeight_ = (this.visHeight_ - this.titleDivHeight_);
            }


            // plot part (1/2)
            this.plotWidth_ = this.is_color_variable_ ? this.visWidth_ * 0.8 : this.visWidth_;

            // legend part
            this.legendWidth_ = this.visWidth_ - this.plotWidth_;


            // plot part (2/2)
            this.cellsHeight_ = Math.floor(this.chartHeight_ / this.rows_);
            this.cellsWidth_ = Math.floor(this.plotWidth_ / this.cols_);

            // checking cell title height
            temporaryTextField.style('font', this.font_size_titles_ + 'px sans-serif')
            temporaryTextField.text(this.variables_[1]);

            this.titleCellHeight_ = this.getSize_(temporaryTextField).height;

            temporaryTextField.remove();

            this.svgHeight_ = this.cellsHeight_ - this.titleCellHeight_;

            // calculate proper mergins
            this.calculateAxesFontandMargins_();
            this.plotDivCP_.selectAll('.axisY').style('font', this.font_size_axes_ + 'px sans-serif');
            this.plotDivCP_.selectAll('.axisX').style('font', this.font_size_axes_ + 'px sans-serif');
            this.plotDivCP_.selectAll('.yaxis_title_g').style('font', this.font_size_axes_ + 'px sans-serif'); ///NEW


            this.widthAvail_ = this.cellsWidth_ - this.default_margins.left - this.default_margins.right,
                this.heightAvail_ = this.cellsHeight_ - this.titleCellHeight_ - this.default_margins.top - this.default_margins.bottom;

            this.length_rugs_ = this.size_rugs_ * d3.min([this.heightAvail_, this.widthAvail_]) * 0.1; // 0.1 - maximum length of rugs is 10% of Y/X axis height/width

            // calculate legend elements
            this.legend_part_size_ = Math.floor(this.chartHeight_ / 11); // 11 = 1 for legend title and 10 because of max color available

            this.legend_keys_size_ = Math.round(this.legend_part_size_ * 0.5); //(0.5 of legendPartSize will do as gapsize)

            if (this.legend_keys_size_ > this.default_legend_keys_size_) { // do not increase size keys more then default one (just to not overreact, might be changed later), only decrease if it's needed
                this.legend_keys_size_ = this.default_legend_keys_size_;
            }

        }

    };

    // only main function will be exported
    exports.createPlot = createPlot;
    //exports.resizePlot = resizePlot;

    Object.defineProperty(exports, '__esModule', {value: true});

})));



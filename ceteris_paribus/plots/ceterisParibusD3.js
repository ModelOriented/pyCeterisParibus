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
        this.default_margins = {top: 10, right: 10, bottom: 40, left: 40};

        this.default_size_rugs = 1;
        this.default_alpha_rugs = 0.9;

        this.default_size_residuals = 2;
        this.default_alpha_residuals = 0.9;

        this.default_size_points = 3;
        this.default_alpha_points = 0.9;

        this.default_size_ices = 2.5;
        this.default_size_pdps = 6.5;
        this.default_alpha_ices = 0.4;
        this.default_alpha_pdps = 0.4;

        this.default_color = 'MidnightBlue';
        this.default_color_pdps = 'red';
        this.default_no_colors = 3;

        this.default_font_size_titles = 14;
        this.default_font_size_legend = 12;
        this.default_font_size_axes = 12;
        this.default_font_size_tootlips = 10;
        this.default_font_size_table = 12;

        this.default_add_table = true;

        // handling user div
        if (typeof(div) == 'string') {
            div = d3.select('#' + div);
        }

        if (!div) {
            throw new Error('Container for CeterisParibusPlot do not exist! Stopping execution.');
        }

        this.userDiv_ = div;


        // handling data
        this.data_ = data;
        this.dataObs_ = dataObs;

        //handling options
        this.variables_ = options.variables;
        // case variables name has improper characters like
        //  !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, `, {, |, }, and ~.
        this.variablesDict_ = {};
        for (var i = 0; i < this.variables_.length; ++i) {
            this.variablesDict_[this.variables_[i]] = this.variables_[i].split('.').join('_')
                .split('-').join('_').split('#').join('_').split('$').join('_').split('~').join('_'); //only few cases added
        }

        this.is_color_variable_ = false;

        if (options.hasOwnProperty('color') && options.color !== null) {
            this.color_ = options.color;
            if (dataObs[0].hasOwnProperty(options.color)) {
                this.is_color_variable_ = true;
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

        if (options.hasOwnProperty('height') && options.height !== null) {
            this.chartHeight_ = options.height;
        } else {
            this.chartHeight_ = this.default_height;
        }

        if (options.hasOwnProperty('width') && options.width !== null) {
            this.chartWidth_ = options.width;
        } else {
            this.chartWidth_ = this.default_width;
        }

        this.visWidth_ = this.chartWidth_;
        this.visHeight_ = this.chartHeight_;

        if (this.add_table_) {
            this.chartHeight_ = this.chartHeight_ / 2;
        }


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
            this.font_size_axes_ = options.font_size_legend;
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


        if (isFinite(((this.dataObs_[0]['_y_'] + '').split('.')[1]))) {
            this.formatPredTooltip_ = '.' + ((this.dataObs_[0]['_y_'] + '').split('.')[1]).length + 'f';
        } else {
            this.formatPredTooltip_ = '.0f'
        }


        this.show_profiles_ = options.show_profiles;
        this.show_observations_ = options.show_observations;
        this.show_rugs_ = options.show_rugs;
        this.show_residuals_ = options.show_residuals;
        this.aggregate_profiles_ = options.aggregate_profiles;

        // handling own CP div

        if (this.userDiv_.select('.mainDivCP')) {
            this.userDiv_.select('.mainDivCP').remove();
        }


        var mainDivCP = this.userDiv_.append('div')
            .attr('class', 'ceterisParibusD3 mainDivCP')
            .style('height', this.chartHeight_ + 'px')
            .style('width', this.chartWidth_ + 'px')
            .style('display', "table")
            .append('table').append('tbody').append('tr');

        this.plotWidth_ = this.is_color_variable_ ? this.chartWidth_ * 0.8 : this.chartWidth_;

        var plotDivCP = mainDivCP.append('td').append('div').attr('class', 'divTable plotDivCP')
            .style('display', 'table')
            .append('div').attr('class', 'divTableBody plotDivTableBody').style('display', 'table-row-group')
            .style('height', this.chartHeight_ + 'px').style('width', this.plotWidth_ + 'px');


        this.scaleColorPrepare_();

        var scaleColor = this.scaleColor_;

        if (this.is_color_variable_) {

            var legendDivCP = mainDivCP.append('td').append('div').attr('class', 'divTable legendDivCP')
                .style('display', 'table')
                .append('div').attr('class', 'divTableBody').style('display', 'table-row-group')
                .style('height', this.chartHeight_ + 'px').style('width', (this.chartWidth_ - this.plotWidth_) + 'px');

            var legendAreaCP = legendDivCP.append('svg').attr('height', this.chartHeight_).attr('width', (this.chartWidth_ - this.plotWidth_))
                .append('g').attr('class', 'legendAreaCP');

            legendAreaCP.append("text").attr('class', 'legendTitle')
                .attr('y', this.chartHeight_ * 0.1).style('font', this.font_size_legend_ + 'px sans-serif').text(this.color_ + ":");//this.chartHeight_/2*0.9

            var legendKeys = legendAreaCP.append("g").attr('class', 'legendKeysGroup')
                .attr("text-anchor", "start").attr("transform", "translate(" + ((this.chartWidth_ - this.plotWidth_) * 0.1) + "," + this.chartHeight_ * 0.2 + ")")
                .selectAll("g").data(this.scaleColor_.domain()).enter().append("g")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            var rectSize = 10;
            legendKeys.append("rect").attr("x", -rectSize).attr("width", rectSize).attr("height", rectSize).attr("fill", function (d) {
                return scaleColor(d)
            });

            legendKeys.append("text").attr("x", 5).attr("y", rectSize / 2).attr("dy", "0.32em").style('font', this.font_size_legend_ + 'px sans-serif').text(function (d) {
                return d;
            });

            this.legendDivCP_ = legendDivCP;

        }


        this.mainDivCP_ = mainDivCP;
        this.plotDivCP_ = plotDivCP;

        //tooltips
        //jakby cos nie dzialalo to sprawdzic czy dobrze ustawione sa te style css dla div
        var tooltipDiv = plotDivCP.append("div").attr("class", "tooltip").style("opacity", 0).style("position", 'absolute').style("height", 'auto').style("width", 'auto')
            .style("padding", '5px').style("text-align", 'left').style("background", 'white').style("border", '3px').style("border-radius", '2px').style("box-shadow", '0px 0px 10px 3px rgba(0,0,0,0.5)')
            .style("pointer-events", 'none').style('font', this.font_size_tootlips_ + 'px sans-serif');

        this.tooltipDiv_ = tooltipDiv;

        this.createCells_();

        // jesli wprowadzimy warstwy to tu petla po warstwach powinna byc i w petli wywolywac ta funkcje z roznymi parametrami
        this.addingLayer_(this.data_, this.dataObs_, this.show_profiles_, this.show_observations_, this.show_rugs_,
            this.show_residuals_, this.aggregate_profiles_);

        var self = this;

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

        // adding table with observations

        if (this.add_table_) {
            this.createTable_();
        }

    };

    CeterisParibusPlot.prototype.createCells_ = function () {

        var nCells = this.variables_.length,
            cellIterator = 0,
            rows = Math.floor(Math.sqrt(nCells)),
            cols = Math.floor(Math.ceil(nCells / rows)),
            cellsHeight = Math.floor(this.chartHeight_ / rows),
            cellsWidth = Math.floor(this.plotWidth_ / cols),
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
            variablesDict = this.variablesDict_;

        this.rows_ = rows;
        this.cols_ = cols;

        var cells = plotDivCP.selectAll('.cellRow').data(d3.range(1, rows + 1)).enter().append('div')
            .attr('class', 'divTableRow cellRow').style('display', 'table-row')
            .style('height', cellsHeight + 'px').style('width', '100%')
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
            .style('height', cellsHeight + 'px').style('width', cellsWidth + 'px')
            .append('div').attr('class', 'divTable').style('display', 'table')
            .append('div').attr('class', 'divTableBody cellBody').style('display', 'table-row-group')
            .style('height', cellsHeight + 'px').style('width', cellsWidth + 'px');

        //cells = this.userDiv_.selectAll(".cell");

        this.cellsHeight_ = cellsHeight;
        this.cellsWidth_ = cellsWidth;

        // scale Y
        var widthAvail = this.cellsWidth_ - this.default_margins.left - this.default_margins.right,
            heightAvail = this.cellsHeight_ * 0.95 - this.default_margins.top - this.default_margins.bottom; // 0.95 because of svg height attr, should be in var later

        this.widthAvail_ = widthAvail;
        this.heightAvail_ = heightAvail;

        var length_rugs = size_rugs * d3.min([this.heightAvail_, this.widthAvail_]) * 0.1; // 0.1 - maximum length of rugs is 10% of Y/X axis height/width
        this.length_rugs_ = length_rugs;
        var scaleY = d3.scaleLinear().rangeRound([heightAvail - length_rugs - 5, 0]);             //this.length_rugs_


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

        scaleY.domain([minScaleY, maxScaleY]);


        // updating scale domain to shift y doamin upwards
        //var scaleYshift =  Math.abs(scaleY.domain()[1] - scaleY.invert(size_rugs));
        //scaleY.domain([d3.min(data, function(d) { return d["_yhat_"]; }) - scaleYshift, d3.max(data, function(d) { return d["_yhat_"]; })]);


        this.scaleY_ = scaleY;

        cells.each(
            function (d, i) {

                if (variables[i]) { // do not plot chart for empty cell

                    // cell title
                    d3.select(this).append('div').style('background-color', '#c4c4c4').attr('class', 'divTableRow').style('display', 'table-row')
                        .append('div').attr('class', 'divTableCell titleCell').style('display', 'table-cell')
                        .style('text-align', 'center').style('font', font_size_titles + 'px sans-serif').text(variables[i]);
                    //TU .attr('height', cellsHeight*0.05), ale lepiej w sumie jak jest, ze im mniejsza/wieksza czcionka tym wiekszy/mniejszy div

                    // cell chart area
                    var chartArea = d3.select(this).append('div').attr('class', 'divTableRow').style('display', 'table-row')
                        .append('div').attr('class', 'divTableCell').style('display', 'table-cell')
                        .append('svg').attr('height', cellsHeight * 0.95).attr('width', cellsWidth).attr('class', 'cellSvg')
                        .append("g").attr("transform", "translate(" + margins.left + "," + margins.top + ")")
                        .attr('class', 'cellMainG cellMainG-' + variablesDict[variables[i]]); //.replace(".","_")


                    chartArea.append("g").attr("class", "axisY").style('font', font_size_axes + 'px sans-serif')
                        .call(d3.axisLeft(scaleY).tickSizeOuter(0).tickSizeInner(-widthAvail).tickPadding(10).ticks(5).tickFormat(d3.format("d")));


                    // getting only data prepared for given variable as x variable
                    var dataVar = data.filter(function (d) {
                        return (d["_vname_"] == variables[i])
                    });

                    if (typeof dataVar.map(function (x) {
                        return x[variables[i]];
                    }).filter(function (obj) {
                        return obj;
                    })[0] == 'number') {

                        var scaleX = d3.scaleLinear().rangeRound([0 + length_rugs + 5, widthAvail]);

                        scaleX.domain(d3.extent(dataVar, function (d) {
                            return d[variables[i]];
                        }));

                        chartArea.append("g").attr("transform", "translate(0," + heightAvail + ")").style('font', font_size_axes + 'px sans-serif')
                            .attr("class", "axisX")
                            .call(d3.axisBottom(scaleX).tickSizeOuter(0).tickSizeInner(-heightAvail).tickPadding(10).ticks(3).tickFormat(d3.format("d")));


                    }
                    else if (typeof dataVar.map(function (x) {
                        return x[variables[i]]
                    }).filter(function (obj) {
                        return obj;
                    })[0] == 'string') {

                        if (categorical_order) {

                            if (categorical_order.filter(function (x) {
                                return (x.variable == variables[i])
                            })[0]) {

                                var order = categorical_order.filter(function (x) {
                                    return (x.variable == variables[i])
                                })[0]

                                var domain = [];
                                for (var key in order) {
                                    if (order.hasOwnProperty(key) && key != 'variable' && order[key] != null) {
                                        domain.push(order[key]);
                                    }
                                }
                                var scaleX = d3.scalePoint().rangeRound([0 + length_rugs, widthAvail]);
                                scaleX.domain(domain);
                            } else {
                                var scaleX = d3.scalePoint().rangeRound([0 + length_rugs, widthAvail]);
                                var domain = d3.nest().key(function (d) {
                                    return d[variables[i]]
                                }).entries(dataVar).map(function (x) {
                                    return x.key
                                });
                                scaleX.domain(domain);
                            }

                        }
                        else {

                            var scaleX = d3.scalePoint().rangeRound([0 + length_rugs, widthAvail]);
                            var domain = d3.nest().key(function (d) {
                                return d[variables[i]]
                            }).entries(dataVar).map(function (x) {
                                return x.key
                            });
                            scaleX.domain(domain);
                        }

                        chartArea.append("g").attr("transform", "translate(0," + heightAvail + ")")
                            .attr("class", "axisX").style('font', font_size_axes + 'px sans-serif')
                            .call(d3.axisBottom(scaleX).tickSizeOuter(0).tickSizeInner(-heightAvail).tickPadding(2).ticks(3))
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
                        .attr('stroke', 'black')
                        .attr('stroke-width', '1.5px')
                        .style("stroke-linecap", 'round')
                        .attr('y1', 0 + 0.5)  //0.5 is artificial, related to automatic axis shift about 0.5 (look at d attr for axis path)
                        .attr('y2', 0 + 0.5)
                        .attr('x1', 0 + 0.5)
                        .attr('x2', length_rugs + 5 + 0.5)

                    chartArea.append("g").attr('class', 'axis_start')
                        .attr("transform", "translate(0," + heightAvail + ")")
                        .append("line")
                        .attr('class', 'axis_start_line_y')
                        .attr('stroke', 'black')
                        .style("stroke-linecap", 'round')
                        .style('stroke-width', '1.5px')
                        .attr('y1', 0)
                        .attr('y2', -length_rugs - 5)
                        .attr('x1', 0 + 0.5)
                        .attr('x2', 0 + 0.5)


                }
            });

        // customizing axes
        this.userDiv_.selectAll('.domain')
            .style('stroke', 'black')
            .style('stroke-width', '1.5px')

        this.userDiv_.selectAll('.tick line')
            .style('stroke', 'grey')
            .style('stroke-width', '1px')
            .style('stroke-opacity', 0.2)

        this.cellsG_ = this.userDiv_.selectAll(".cellMainG") //unnecessary?
        this.scalesX_ = scalesX;

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

        //var no_instances; //this.no_instances or whatever
        //if(!no_instances){ no_instances = 1;}else{no_instances = no_instances + 1;}
        //.attr('id', 'icePlot'+no_instances) remember that class will be overwrite if you do attr(class,).attr(class,)

        var g = mainG.append("g").attr("class", 'icePlot'),
            per_id_model = d3.nest().key(function (d) {
                return d['_ids_'] + '|' + d['_label_']
            }).entries(dataVar),
            scaleY = this.scaleY_,
            scaleColor = this.scaleColor_,
            scaleX = this.scalesX_[variable],
            color = this.color_,
            tooltipDiv = this.tooltipDiv_,
            alpha_ices = this.alpha_ices_,
            size_ices = this.size_ices_,
            self = this,
            is_color_variable = this.is_color_variable_,
            formatPredTooltip = this.formatPredTooltip_;

        var line = d3.line()
            .x(function (d) {
                return scaleX(d[variable]);
            })
            .y(function (d) {
                return scaleY(d["_yhat_"]);
            });


        var iceplotegroups = g.selectAll('g.iceplotgroup').data(per_id_model).enter().append('g').attr('class', 'iceplotgroup');

        var iceplotlines = iceplotegroups.append("path").attr('class', 'iceplotline')
        //.attr('id', function(x) {return 'iceplotline-' + x.key})
            .attr("fill", "none")                                                         //[0] to get array inside structure {{cos}}
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
                return line(x.values)
            });

        /*
          iceplotlines
          .on("mouseover", function(d){
              tooltipDiv.html( "<b> ICE line </b> <br/>" +
                           "obs. id: " + d.key.split('|')[0] +  "<br/>" +
                           "model: " + d.key.split('|')[1]
                   )
              .style("left", (d3.event.pageX ) + "px") // ustalamy pozycje elementu tam gdzie zostanie akcja podjeta
              .style("top", (d3.event.pageY) + "px")
              .transition()
              .duration(300)
              .style("opacity",1);

              d3.select(this)
                    .transition()
                    .duration(300)
                    .style("stroke-width", "4px")
                    .attr('opacity', 1);
              });

        iceplotlines
        .on("mouseout", function(d){

              d3.select(this)
                .transition()
                .duration(300)
                .style("stroke-width", "2.5px")
                .attr('opacity', 0.6);

              tooltipDiv
              .transition()
              .duration(300)
              .style("opacity", 0);
            });
        */

        var iceplotpoints = iceplotegroups.append('g').attr('class', 'iceplotpointgroup').selectAll('circle.iceplotpoint').data(function (d) {
            return d.values
        }).enter()
            .append("circle").attr('class', 'iceplotpoint')
            //.attr('id', function(x) {return 'iceplotpoint-' + x.key})
            .attr("fill", 'black') //function(x) { return scaleColor(dataObs.filter(function(d) {return (d['_ids_']+ '|' + d['_label_']) == x.key; })[0][color])})               }
            .attr("stroke", 'black') // function(x) { return scaleColor(dataObs.filter(function(d) {return (d['_ids_']+ '|' + d['_label_']) == x.key; })[0][color])})
            .attr('stroke-opacity', '0.2')
            .attr('stroke-width', size_ices)
            .attr('r', size_ices) // uzaleznic to od czegos gdy rozmiar wykresu sie bedziez zmieniac
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
                    .style("left", (d3.event.pageX) + "px") // ustalamy pozycje elementu tam gdzie zostanie akcja podjeta
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
                    .style("left", (d3.event.pageX) + "px") // ustalamy pozycje elementu tam gdzie zostanie akcja podjeta
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
                    .style("left", (d3.event.pageX) + "px") // ustalamy pozycje elementu tam gdzie zostanie akcja podjeta
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
            formatPredTooltip = this.formatPredTooltip_;

        if (aggregate_profiles == 'mean') {
            var nested_data = d3.nest()
                .key(function (d) {
                    return d['_label_'];
                })
                .key(function (d) {
                    return d[variable];
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
                .rollup(function (leaves) {
                    return d3.median(leaves, function (d) {
                        return d['_yhat_'];
                    });
                })
                .entries(dataVar);
        }


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
                return line(x.values)
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
            .attr('r', size_pdps) // uzaleznic to od czegos gdy rozmiar wykresu sie bedziez zmieniac
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
                    .style("left", (d3.event.pageX) + "px") // ustalamy pozycje elementu tam gdzie zostanie akcja podjeta
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


    /*
    // step JOIN
            var tramCircles = d3.select("#mapPanel").selectAll("circle.tramGroup")
                               .data(data, function(d) { return d.brigade + d.line; })

            // step: UPDATE
            tramCircles
                .transition()
                .duration(5000)
                .attr("cx", function(d){ return scaleLon(d.lon);})
                .attr("cy", function(d){ return scaleLat(d.lat);})
                .attr('stroke',function(d){ //if tram is moving its circle stroke width and color is changed to more blurry
                    if(d.status == "STOPPED"){ return "orange";}
                    else{ return "rgba(255,165,0,0.6)";}
                    })
                .attr("stroke-width",  function(d){
                    if(d.status == "STOPPED"){ return "1px";}
                    else{ return "4px";}
                    })

            // step: ENTER
            tramCircles.enter().append("circle")
            .attr("class", function(d){ return "tram_" + d.line + " tramGroup";})
                .attr("r", "10px")
                .attr("cx", function(d){ return scaleLon(d.lon);})
                .attr("cy", function(d){ return scaleLat(d.lat);})
                .attr('stroke',function(d){
                    if(d.status == "STOPPED"){ return "orange";}
                    else{ return "rgba(255,165,0,0.6)";}
                    })
                .attr("stroke-width",  function(d){
                    if(d.status == "STOPPED"){ return "1px";}
                    else{ return "4px";}
                    })
            //.merge(tramCircles)


            // step: EXIT
            tramCircles.exit().dispatch("mouseout").remove(); // dispatch function triggers particular events manually (here I want to trigger mouseout so the tooltip will disapear)
    */

    CeterisParibusPlot.prototype.scaleColorPrepare_ = function () {

        //console.log('EVOKING this INSIDE CeterisParibusPlot.scaleColorPrepare_')
        //console.log(this)

        var no_colors = this.no_colors_,
            default_color = this.default_color,
            defaultPaletteCat = d3.schemePaired,
            defaultPaletteNum = d3.schemeOrRd,
            color = this.color_,
            dataObs = this.dataObs_;

        this.scaleColor_ = {};

        if (typeof dataObs.map(function (x) {
            return x[color];
        }).filter(function (obj) {
            return obj;
        })[0] == 'string') {
            //console.log('color variable is categorical')
            this.scaleColor_ = d3.scaleOrdinal(defaultPaletteCat);
            this.scaleColor_.domain(d3.nest().key(function (d) {
                return d[color]
            }).entries(dataObs).map(function (x) {
                return x.key
            }));
        }
        else if (typeof dataObs.map(function (x) {
            return x[color]
        }).filter(function (obj) {
            return obj;
        })[0] == 'number') {
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
        else {
            //console.log('color variable not defined')
            this.scaleColor_ = d3.scaleOrdinal();
            this.scaleColor_.range([default_color]);
            this.scaleColor_.domain('default');
        }
    };


    CeterisParibusPlot.prototype.createTable_ = function (fn) {

        var headers = Object.keys(this.dataObs_[0]),
            self = this;
        //no_of_obs = this.dataObs_.length;d3.range(1, no_of_obs+1)


        if (!headers) {
            console.warn('no data for table!');
            return;
        }

        // na razie rozmiary tabeli takie same jak wykresu powyzej

        if (this.userDiv_.select('.tableDivCP')) {
            this.userDiv_.select('.tableDivCP').remove();
        }


        var tableDivCP = this.userDiv_.append('div')
            .attr('class', 'ceterisParibusD3 tableDivCP')
            .style('max-height', this.chartHeight_ + 'px')
            .style('width', this.chartWidth_ + 'px')
            .style('display', "table")
            .style('font', this.font_size_table_ + 'px sans-serif');

        var tableCP = tableDivCP.append('table').attr('class', 'tableCP compact hover row-border nowrap') //display - css class from DataTable, nowrap - proper sizing of rows when little space
            .style('max-height', this.chartHeight_ + 'px')
            .style('width', this.chartWidth_ + 'px');

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

        tableDivCP.style('min-height', tableCP.property('clientHeight') + 'px');
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


        var dt_options = {
            "scrollX": true,
            "paging": false,
            "scrollY": 200,
            "order": [[9, "asc"]],
            "scrollCollapse": true,
            "dom": '<"toolbar">frtip', // for title of the table
            "retrieve": true // to be able to ca,, DT multiple times
        }

        dt_options.scrollY = this.chartHeight_ * 0.8; //scrollY parameter sets only table height without header
        // cool table look
        $(document).ready(function () {
            $('.tableCP').DataTable(dt_options);
            $("div.toolbar").html('<b>Dataset:</b>'); // for title of the table
        });
        // attention: i don't have to create proper html table to do this, i can make it from JS object using DT options
        // look here https://datatables.net/examples/data_sources/js_array.html

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

    CeterisParibusPlot.prototype.changeSizeParameters_ = function () {

        this.plotWidth_ = this.is_color_variable_ ? this.chartWidth_ * 0.8 : this.chartWidth_;

        this.cellsHeight_ = Math.floor(this.chartHeight_ / this.rows_);
        this.cellsWidth_ = Math.floor(this.plotWidth_ / this.cols_);


        //console.log('old h avail ', this.heightAvail_);

        this.widthAvail_ = this.cellsWidth_ - this.default_margins.left - this.default_margins.right,
            this.heightAvail_ = this.cellsHeight_ * 0.95 - this.default_margins.top - this.default_margins.bottom;
        this.length_rugs_ = this.size_rugs_ * d3.min([this.heightAvail_, this.widthAvail_]) * 0.1;

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
            .tickSizeInner(-this.widthAvail_).tickPadding(10).ticks(5).tickFormat(d3.format("d")));

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
                        .tickPadding(10).ticks(3).tickFormat(d3.format("d")));
            }
            else if (typeof this.scalesX_[this.variables_[i]].domain()[0] == 'string') {
                this.scalesX_[this.variables_[i]] = this.scalesX_[this.variables_[i]].rangeRound([0 + this.length_rugs_, this.widthAvail_]);
                this.mainDivCP_.select(classToTake).select('.axisX')
                    .attr("transform", "translate(0," + this.heightAvail_ + ")")
                    .call(d3.axisBottom(this.scalesX_[this.variables_[i]]).tickSizeOuter(0).tickSizeInner(-this.heightAvail_).tickPadding(2).ticks(3))
                    .selectAll('text').attr('transform', 'rotate(-20)')
                    .style("text-anchor", "end");
            }

        }

        // axes artificial beginning

        this.plotDivCP_.selectAll('.axis_start').attr("transform", "translate(0," + this.heightAvail_ + ")");
        this.plotDivCP_.selectAll('.axis_start_line_x').attr('x2', this.length_rugs_ + 5 + 0.5);
        this.plotDivCP_.selectAll('.axis_start_line_y').attr('y2', -this.length_rugs_ - 5);


        // customizing axes
        this.userDiv_.selectAll('.domain')
            .style('stroke', 'black')
            .style('stroke-width', '1.5px');

        this.userDiv_.selectAll('.tick line')
            .style('stroke', 'grey')
            .style('stroke-width', '1px')
            .style('stroke-opacity', 0.2);


    };


    CeterisParibusPlot.prototype.updateCellsStructure_ = function () {

        this.userDiv_.select('.mainDivCP')
            .style('height', this.chartHeight_ + 'px')
            .style('width', this.chartWidth_ + 'px');

        this.userDiv_.select('.plotDivTableBody')
            .style('height', this.chartHeight_ + 'px')
            .style('width', this.plotWidth_ + 'px');

        this.plotDivCP_.selectAll('.cellRow')
            .style('height', this.cellsHeight_ + 'px');

        this.plotDivCP_.selectAll('.cell')
            .style('height', this.cellsHeight_ + 'px').style('width', this.cellsWidth_ + 'px');

        this.plotDivCP_.selectAll('.cellBody')
            .style('height', this.cellsHeight_ + 'px').style('width', this.cellsWidth_ + 'px');

        this.userDiv_.selectAll('.cellSvg')
            .attr('height', this.cellsHeight_ * 0.95).attr('width', this.cellsWidth_);

        this.tableDivCP_
            .style('height', this.chartHeight_ + 'px')
            .style('width', this.chartWidth_ + 'px');

        this.tableDivCP_.style('min-height', this.tableDivCP_.select('.tableCP').property('clientHeight') + 'px');

    };


    CeterisParibusPlot.prototype.updateLegend_ = function () {

        if (this.is_color_variable_) {

            this.legendDivCP_.select('.plotDivTableBody')
                .style('height', this.chartHeight_ + 'px').style('width', (this.chartWidth_ - this.plotWidth_) + 'px');

            this.legendDivCP_.select('svg')
                .attr('height', this.chartHeight_).attr('width', (this.chartWidth_ - this.plotWidth_));

            this.legendDivCP_.select('text.legendTitle')
                .attr('y', this.chartHeight_ * 0.1);

            this.legendDivCP_.select('g.legendKeysGroup')
                .attr("transform", "translate(" + ((this.chartWidth_ - this.plotWidth_) * 0.1) + "," + this.chartHeight_ * 0.2 + ")");

        }


    };


    CeterisParibusPlot.prototype.updateIcePlot_ = function (mainG, variable) {

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

        mainG.selectAll('.iceplotline').attr("d", function (x) {
            return line(x.values)
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

        console.log()
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
            scaleX = this.scalesX_[variable];

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

        mainG.selectAll('path.pdpline')
            .attr("d", function (x) {
                return line(x.values)
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

        var getNewFontSize = function (cellsWidth, adjustment) {

            var fontSize = 10 - adjustment;

            if (cellsWidth <= 50) {
                fontSize = 5 - adjustment;
            } else if (cellsWidth > 50 && cellsWidth <= 150) {
                fontSize = 10 - adjustment;
            } else if (cellsWidth > 150 && cellsWidth <= 500) {
                fontSize = 15 - adjustment;
            } else if (cellsWidth > 500 && cellsWidth <= 1000) {
                fontSize = 20 - adjustment;
            } else {
                fontSize = 25 - adjustment;
            }

            return fontSize;
        }


        //console.log(this.cellsWidth_)
        // could make it for every case, but instead of giving specific number, give percent change

        // fonts won't be resized if user give some values for these parameters
        if (!this.is_set_font_size_titles_) {
            var fontSize = getNewFontSize(this.cellsWidth_, 0);
            this.font_size_titles_ = fontSize;
            this.plotDivCP_.selectAll('.titleCell').style('font', this.font_size_titles_ + 'px sans-serif');
        }

        if (!this.is_set_font_size_axes_) {
            var fontSize = getNewFontSize(this.cellsWidth_, 4);
            this.font_size_axes_ = fontSize;
            this.plotDivCP_.selectAll('.axisY').style('font', this.font_size_axes_ + 'px sans-serif');
            this.plotDivCP_.selectAll('.axisX').style('font', this.font_size_axes_ + 'px sans-serif');
        }

        if (!this.is_set_font_size_tootlips_) {
            var fontSize = getNewFontSize(this.cellsWidth_, 1);
            this.font_size_tootlips_ = fontSize;
            this.plotDivCP_.select('.tooltip').style('font', this.font_size_tootlips_ + 'px sans-serif');
        }


        if (this.is_color_variable_ & !this.is_set_font_size_legend_) {
            var fontSize = getNewFontSize(this.cellsWidth_, 0);
            this.is_set_font_size_legend_ = fontSize;

            this.legendDivCP_.selectAll('text').style('font', this.is_set_font_size_legend_ + 'px sans-serif');
        }

        if (!this.is_set_font_size_table_) {
            var fontSize = getNewFontSize(this.cellsWidth_, 2);
            this.font_size_table_ = fontSize;
            this.tableDivCP_.style('font', this.font_size_table_ + 'px sans-serif');
        }

    };


    CeterisParibusPlot.prototype.updatePlotAfterResize_ = function () {

        this.updateXYScalesAndAxes_();
        this.updateCellsStructure_();
        this.updatePlots_();
        this.updateLegend_();
        this.resizeFonts();
        this.updateCellsStructure_();
    };


    CeterisParibusPlot.prototype.resizePlot_ = function (width, height) {

        var w = this.visWidth_, //this.chartWidth_,
            h = this.visHeight_;   //chartHeight_;

        if ((width === null) != (height === null)) {
            console.warn("resizePlot_() should be called with no arguments or with 2 non-NULL arguments. Pretending there were no arguments passed.");
            width = height = null;
        }

        if (width) {
            this.visWidth_ = width;
            this.visHeight_ = height;
        } else {

            this.visWidth_ = this.userDiv_.property('clientWidth');
            this.visHeight_ = this.userDiv_.property('clientHeight');
        }


        this.chartWidth_ = this.visWidth_;

        if (this.add_table_) {
            this.chartHeight_ = this.visHeight_ / 2;
        } else {
            this.chartHeight_ = this.visHeight_;
        }

        if (Math.abs(w - this.visWidth_) <= 1 && Math.abs(h - this.visHeight_) <= 1) {
            console.log('too little changes in size to resize the plot:' + ' in width: ' +
                Math.abs(w - this.visWidth_) + ' in height: ' + Math.abs(h - this.visHeight_))
            return;
        } else {

            this.changeSizeParameters_();
            this.updatePlotAfterResize_();

        }

    };

    // only main function will be exported
    exports.createPlot = createPlot;
    //exports.resizePlot = resizePlot;

    Object.defineProperty(exports, '__esModule', {value: true});

})));



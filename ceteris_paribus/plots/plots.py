import itertools
import json
import logging
import os
import webbrowser

import bokeh.palettes
import numpy as np
from bokeh.layouts import gridplot
from bokeh.plotting import figure, show
from flask import Flask, render_template

from ceteris_paribus.plots import PLOTS_DIR

app = Flask(__name__, template_folder=PLOTS_DIR)
number = iter(range(1000))


def _build_aggregated_profile(data, aggregate_profiles):
    """
    Build aggregated (single) profile
    :param data: ceteris paribus profiles
    :param aggregate_profiles: function aggregating
    :return: x, y - pair of numpy arrays with x and y coordinates
    """
    # TODO currently aggregate function is assumed to be a numpy function
    # TODO write it more pandas way if possible
    var_name = data['_vname_'].iloc[0]
    profiles = data.groupby('_ids_')
    x = profiles.get_group(0)[var_name]
    profiles_dict = dict(list(profiles))
    profiles_list = [np.array(pr['_yhat_']) for pr in profiles_dict.values()]
    y = aggregate_profiles(profiles_list, axis=0)
    return x, y


def _single_variable_plot(fig, data, var_name, new_observation, y_predicted, y_true,
                          show_profiles=True, show_observations=True, show_residuals=False,
                          aggregate_profiles=None,
                          size=5, alpha=0.6, color_single_residual="black",
                          size_points=12, alpha_points=0.5, color_points="red",
                          size_residuals=2, alpha_residuals=1., color_residuals="black",
                          color_up_residuals=None, color_down_residuals=None,
                          legend=None):
    """
    Plot single variable plot using bokeh
    :param fig: a bokeh figure plot is drawn on
    :param data: single variable profile
    :param var_name: variable name
    :param new_observation: observations for which the profiles were calculated
    :param y_predicted: y predicted for new_observation
    :param y_true: true y values for new_observation
    :param show_profiles: whether to show profiles
    :param show_observations: whether to depict individual observations
    :param show_residuals: whether to plot residuals with a line ended with a point, requires y_true supply
    :param aggregate_profiles: If None (default) then individual profiles will be plotted.
        If a function (e.g. mean or median) then profiles will be aggregated and only the aggregate profile will be plotted
    :param size: width of a line for profiles
    :param alpha: opacity of lines for profiles
    :param color_single_residual: color of lines for profiles
    :param size_points: size of points to be plotted
    :param alpha_points: opacity of points to be plotted
    :param color_points: color of points to be plotted
    :param size_residuals: size of line for residuals
    :param alpha_residuals: opacity of line for residuals
    :param color_residuals: color of line for residuals
    :param color_up_residuals: color of line for residuals pointed up
    :param color_down_residuals: color of line for residuals pointed down
    :param legend: description in legend for the profile
    """
    profiles = data.groupby('_ids_')
    if show_profiles:
        if aggregate_profiles is not None:
            x, y = _build_aggregated_profile(data, aggregate_profiles)
            fig.line(x, y, line_width=size, line_alpha=alpha, color=color_single_residual)
        else:
            for _, profile in profiles:
                fig.line(profile[var_name], profile['_yhat_'], line_width=size, line_alpha=alpha,
                         color=color_single_residual,
                         legend=legend)
    if show_observations:
        for a, b in zip(new_observation, y_predicted):
            fig.circle(a, b, size=size_points, alpha=alpha_points, color=color_points)
    if show_residuals:
        color_up_residuals = color_up_residuals or color_residuals
        color_down_residuals = color_down_residuals or color_residuals
        for a, b, c in zip(new_observation, y_predicted, y_true):
            color_single_residual = color_up_residuals if c > b else color_down_residuals
            fig.line([a, a], [b, c], line_width=size_residuals, line_alpha=alpha_residuals, color=color_single_residual)
            fig.circle(a, c, size=size_points, alpha=alpha_residuals, color=color_residuals)


def _get_y_range(cp_profiles, selected_variables):
    y_min = np.inf
    y_max = -np.inf

    for profile in cp_profiles:
        profiles_dict = profile.split_by("_vname_")
        for (var_name, df) in profiles_dict.items():
            if not selected_variables or var_name in selected_variables:
                y_min = min(y_min, min(df['_yhat_']))
                y_max = max(y_max, max(df['_yhat_']))

        y_min = min(y_min, min(profile.new_observation_predictions))
        y_max = max(y_max, max(profile.new_observation_predictions))

        if profile.new_observation_true is not None:
            y_min = min(y_min, min(profile.new_observation_true))
            y_max = max(y_max, max(profile.new_observation_true))

    dist = y_max - y_min
    return [y_min - 0.1 * dist, y_max + 0.1 * dist]


def _single_profile_plot(cp_profile, figures, y_range, selected_variables, color=None, legend=False, **kwargs):
    profiles_dict = cp_profile.split_by("_vname_")
    xs = cp_profile.new_observation_values.T
    ys = cp_profile.new_observation_predictions
    legend = cp_profile.profile['_label_'].iloc[0] if legend else None

    for i, ((var_name, df), x) in enumerate(zip(profiles_dict.items(), xs)):
        if not selected_variables or var_name in selected_variables:
            if color is None:
                _single_variable_plot(figures[i], df, var_name, x, ys,
                                      cp_profile.new_observation_true, y_range, legend=legend, **kwargs)
            else:
                _single_variable_plot(figures[i], df, var_name, x, ys,
                                      cp_profile.new_observation_true, y_range, color_single_residual=color,
                                      legend=legend, **kwargs)


def plot_bokeh(cp_profile, *args, sharey=True, ncols=3, selected_variables=None, **kwargs):
    """
    Plot ceteris paribus profile
    :param cp_profile: ceteris paribus profile
    :param args: next ceteris paribus profiles to be plotted along
    :param sharey: whether to share y axis range among individual variable plots
    :param ncols: number of columns of the plots grid
    :param selected_variables: variables selected for the plots
    :param kwargs: other options passed to the plot
    """
    palette = bokeh.palettes.Colorblind[8]
    if len(args) >= len(palette):
        logging.warning("There is more profiles {} than available colors in the palette {}"
                        .format(len(args) + 1, len(palette)))

    colors = itertools.cycle(palette)
    y_range = _get_y_range(list(args) + [cp_profile], selected_variables) if sharey else None
    figures = [figure(title=var_name, y_range=y_range) for var_name in cp_profile.profile['_vname_'].unique()]

    for profile in [cp_profile] + list(args):
        color = next(colors) if args else None
        legend = bool(args)
        _single_profile_plot(profile, figures, y_range, selected_variables, color=color, legend=legend, **kwargs)

    f = gridplot(figures, ncols=ncols)
    show(f)


def plot_d3(cp_profile, *args,
            show_profiles=True, show_observations=True, show_residuals=False, show_rugs=False,
            aggregate_profiles=None, selected_variables=None, **kwargs):

    params = dict()
    params.update(kwargs)
    params["variables"] = selected_variables or cp_profile.selected_variables
    params['color'] = "_label_" if args else None
    params['show_profiles'] = show_profiles
    params['show_observations'] = show_observations
    params['show_rugs'] = show_rugs
    params['show_residuals'] = show_residuals and cp_profile.new_observation_true
    params['aggregate_profiles'] = aggregate_profiles

    plot_id = str(next(number))

    with open(os.path.join(PLOTS_DIR, "params{}.js".format(plot_id)), 'w') as f:
        f.write("params = " + json.dumps(params, indent=2) + ";")

    all_profiles = [cp_profile] + list(args)

    cp_profile.save_observations(all_profiles, 'obs{}.js'.format(plot_id))
    cp_profile.save_profiles(all_profiles, "profile{}.js".format(plot_id))

    with app.app_context():
        data = render_template("plot_template.html", i=plot_id, params=params)

    with open(os.path.join(PLOTS_DIR, "plots{}.html").format(plot_id), 'w') as f:
        f.write(data)

    # open plot in a browser
    webbrowser.open("file://{}".format(os.path.join(PLOTS_DIR, "plots{}.html".format(plot_id))))

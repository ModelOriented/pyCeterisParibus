import numpy as np
from bokeh.layouts import gridplot
from bokeh.plotting import figure, show
from matplotlib import pyplot as plt


def _single_plot_matplotlib(subplot, data, var_name, new_observation, y_predicted, y_true,
                            show_profiles=True, show_observations=True, show_residuals=False):
    profiles = data.groupby('_ids_')
    if show_profiles:
        for _, profile in profiles:
            subplot.plot(profile[var_name], profile['_yhat_'], '-b')
    if show_observations:
        for a, b in zip(new_observation, y_predicted):
            subplot.plot(a, b, '-bo')
    if show_residuals:
        for a, b, c in zip(new_observation, y_predicted, y_true):
            subplot.plot(a, c, '-ro')
            subplot.plot([a, a], [b, c], '-', color='black')

    subplot.set_title(var_name)


def _plot_matplotlib(cp_profile, **kwargs):
    # TODO consider to remove as a legacy
    profiles_dict = cp_profile.split_by("_vname_")
    xs = cp_profile.new_observation_values.T
    ys = cp_profile.new_observation_predictions
    n_profiles = len(profiles_dict)
    f, axarr = plt.subplots(n_profiles, sharey=True)

    for i, ((var_name, df), x) in enumerate(zip(profiles_dict.items(), xs)):
        _single_plot_matplotlib(axarr[i], df, var_name, x, ys, cp_profile.new_observation_true, **kwargs)
    plt.show()


def _build_aggregated_profile(profiles, aggregate_profiles, var_name):
    # TODO test and document it, write it more in a pandas way?
    x = profiles.get_group(0)[var_name]
    profiles_dict = dict(list(profiles))
    profiles_list = [np.array(pr['_yhat_']) for pr in profiles_dict.values()]
    y = aggregate_profiles(profiles_list, axis=0)
    return x, y


def _single_plot_bokeh(data, var_name, new_observation, y_predicted, y_true, y_range=None,
                       show_profiles=True, show_observations=True, show_residuals=False,
                       aggregate_profiles=None,
                       size=5, alpha=0.6, color="black",
                       size_points=12, alpha_points=0.5, color_points="red",
                       size_residuals=2, alpha_residuals=1., color_residuals="black"):
    """
    Plot single variable plot using bokeh
    :param data: single variable profile
    :param var_name: variable name
    :param new_observation: observations for which the profiles were calculated
    :param y_predicted: y predicted for new_observation
    :param y_true: true y values for new_observation
    :param y_range: range for y axis, if None then sets automatically
    :param show_profiles: whether to show profiles
    :param show_observations: whether to depict individual observations
    :param show_residuals: whether to plot residuals with a line ended with a point, requires y_true supply
    :param aggregate_profiles: If None (default) then individual profiles will be plotted.
        If a function (e.g. mean or median) then profiles will be aggregated and only the aggregate profile will be plotted
    :param size: width of a line for profiles
    :param alpha: opacity of lines for profiles
    :param color: color of lines for profiles
    :param size_points: size of points to be plotted
    :param alpha_points: opacity of points to be plotted
    :param color_points: color of points to be plotted
    :param size_residuals: size of line for residuals
    :param alpha_residuals: opacity of line for residuals
    :param color_residuals: color of line for residuals
    """
    fig = figure(title=var_name, y_range=y_range)
    profiles = data.groupby('_ids_')
    if show_profiles:
        if aggregate_profiles is not None:
            x, y = _build_aggregated_profile(profiles, aggregate_profiles, var_name)
            fig.line(x, y, line_width=size, line_alpha=alpha, color=color)
        else:
            for _, profile in profiles:
                fig.line(profile[var_name], profile['_yhat_'], line_width=size, line_alpha=alpha, color=color)
    if show_observations:
        for a, b in zip(new_observation, y_predicted):
            fig.circle(a, b, size=size_points, alpha=alpha_points, color=color_points)
    if show_residuals:
        for a, b, c in zip(new_observation, y_predicted, y_true):
            fig.line([a, a], [b, c], line_width=size_residuals, line_alpha=alpha_residuals, color=color_residuals)
            fig.circle(a, c, size=size_points, alpha=alpha_residuals, color=color_residuals)
    return fig


def _get_y_range(cp_profile, selected_variables):
    y_min = np.inf
    y_max = -np.inf
    profiles_dict = cp_profile.split_by("_vname_")
    for (var_name, df) in profiles_dict.items():
        if not selected_variables or var_name in selected_variables:
            y_min = min(y_min, min(df['_yhat_']))
            y_max = max(y_max, max(df['_yhat_']))

    y_min = min(y_min, min(cp_profile.new_observation_predictions))
    y_max = max(y_max, max(cp_profile.new_observation_predictions))

    if cp_profile.new_observation_true is not None:
        y_min = min(y_min, min(cp_profile.new_observation_true))
        y_max = max(y_max, max(cp_profile.new_observation_true))

    dist = y_max - y_min
    return [y_min - 0.1 * dist, y_max + 0.1 * dist]


def _plot_bokeh(cp_profile, *args, sharey=True, ncols=3, selected_variables=None, **kwargs):
    """
    Plot ceteris paribus profile using bokeh
    :param cp_profile: ceteris paribus profile
    :param sharey: whether to share y axis range among individual variable plots
    :param kwargs: other options passed to the plot
    """
    profiles_dict = cp_profile.split_by("_vname_")
    xs = cp_profile.new_observation_values.T
    ys = cp_profile.new_observation_predictions
    plots = []
    y_range = _get_y_range(cp_profile, selected_variables) if sharey else None
    for (var_name, df), x in zip(profiles_dict.items(), xs):
        if not selected_variables or var_name in selected_variables:
            plots.append(_single_plot_bokeh(df, var_name, x, ys, cp_profile.new_observation_true, y_range, **kwargs))
    f = gridplot(plots, ncols=ncols)
    show(f)


def plot(cp_profile, *args, library='bokeh', **kwargs):
    """
    Plot ceteris paribus profile
    TODO enable more than one profile
    :param cp_profile: ceteris paribus profile
    :param library: plotting library, accepts 'bokeh', 'matplotlib'
    :param kwargs: other options passed to the plot
    """
    if library == 'bokeh':
        _plot_bokeh(cp_profile, *args, **kwargs)
    elif library == 'matplotlib':
        _plot_matplotlib(cp_profile, **kwargs)
    else:
        raise ValueError("Unknown plotting library: {}".format(library))

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


def _plot_matplotlib(cp_profile, show_profiles=True, show_observations=True,
                     show_residuals=False, selected_variables=None):
    profiles_dict = cp_profile.split_by("_vname_")
    xs = cp_profile.new_observation_values.T
    ys = cp_profile.new_observation_predictions
    n_profiles = len(profiles_dict)
    f, axarr = plt.subplots(n_profiles, sharey=True)

    for i, ((var_name, df), x) in enumerate(zip(profiles_dict.items(), xs)):
        _single_plot_matplotlib(axarr[i], df, var_name, x, ys, cp_profile.new_observation_true, show_profiles,
                                show_observations, show_residuals)
    plt.show()


def _single_plot_bokeh(data, var_name, new_observation, y_predicted, y_true,
                       show_profiles=True, show_observations=True, show_residuals=False):
    fig = figure(title=var_name)
    profiles = data.groupby('_ids_')
    if show_profiles:
        for _, profile in profiles:
            fig.line(profile[var_name], profile['_yhat_'], line_width=5)
    if show_observations:
        for a, b in zip(new_observation, y_predicted):
            fig.circle(a, b, color="red", size=12, alpha=0.5)
    if show_residuals:
        for a, b, c in zip(new_observation, y_predicted, y_true):
            fig.line([a, a], [b, c], color='black', line_width=2)
            fig.circle(a, c, color='black', size=6)
    return fig


def _plot_bokeh(cp_profile, show_profiles=True, show_observations=True,
                show_residuals=False, selected_variables=None):
    profiles_dict = cp_profile.split_by("_vname_")
    xs = cp_profile.new_observation_values.T
    ys = cp_profile.new_observation_predictions
    plots = []
    for i, ((var_name, df), x) in enumerate(zip(profiles_dict.items(), xs)):
        plots.append(_single_plot_bokeh(df, var_name, x, ys, cp_profile.new_observation_true, show_profiles,
                                        show_observations, show_residuals))
    f = gridplot([plots])
    show(f)


def plot(cp_profile, library='bokeh', **kwargs):
    if library == 'bokeh':
        _plot_bokeh(cp_profile, **kwargs)
    elif library == 'matplotlib':
        _plot_matplotlib(cp_profile, **kwargs)
    else:
        raise ValueError("Unknown plotting library: {}".format(library))

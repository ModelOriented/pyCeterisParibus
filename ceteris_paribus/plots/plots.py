import json
import logging
import os
import webbrowser

from flask import Flask, render_template

from ceteris_paribus.plots import PLOTS_DIR

app = Flask(__name__, template_folder=PLOTS_DIR)

MAX_PLOTS_PER_SESSION = 10000
# generates ids for subsequent plots
number = iter(range(MAX_PLOTS_PER_SESSION))


def _calculate_plot_variables(cp_profile, selected_variables):
    """
    Helper function to calculate valid subset of variables to be plotted
    """
    if not selected_variables:
        return cp_profile.selected_variables
    if not set(selected_variables).issubset(set(cp_profile.selected_variables)):
        logging.warning("Selected variables are not subset of all variables. Parameter is ignored.")
        return cp_profile.selected_variables
    else:
        return list(selected_variables)


def _params_update(params, **kwargs):
    for key, val in kwargs.items():
        if val:
            params[key] = val
    return params


def plot(cp_profile, *args,
         show_profiles=True, show_observations=True, show_residuals=False, show_rugs=False,
         aggregate_profiles=None, selected_variables=None,
         color=None, size=None, alpha=None,
         color_pdps=None, size_pdps=None, alpha_pdps=None,
         size_points=None, alpha_points=None, color_points=None,
         size_residuals=None, alpha_residuals=None, color_residuals=None,
         height=500, width=600,
         plot_title='', y_label=None,
         print_observations=True,
         **kwargs):
    """
    Plot ceteris paribus profile

    :param cp_profile: ceteris paribus profile
    :param args: next (optional) ceteris paribus profiles to be plotted along
    :param show_profiles: whether to show profiles
    :param show_observations: whether to show individual observations
    :param show_residuals: whether to plot residuals
    :param show_rugs: whether to plot rugs
    :param aggregate_profiles: if specified additional aggregated profile will be plotted, available values: `mean`, `median`
    :param selected_variables: variables selected for the plots
    :param kwargs: other options passed to the plot
    """

    params = dict()
    params.update(kwargs)
    params["variables"] = _calculate_plot_variables(cp_profile, selected_variables)
    params['color'] = "_label_" if args else color
    params['show_profiles'] = show_profiles
    params['show_observations'] = show_observations
    params['show_rugs'] = show_rugs
    params['show_residuals'] = show_residuals and (cp_profile.new_observation_true is not None)
    params['add_table'] = print_observations
    params['height'] = height
    params['width'] = width
    params['plot_title'] = plot_title
    params = _params_update(params, size=size, alpha=alpha,
                            color_pdps=color_pdps, size_pdps=size_pdps, alpha_pdps=alpha_pdps,
                            size_points=size_points, alpha_points=alpha_points, color_points=color_points,
                            size_residuals=size_residuals, alpha_residuals=alpha_residuals,
                            color_residuals=color_residuals,
                            y_label=y_label)

    if aggregate_profiles in {'mean', 'median', None}:
        params['aggregate_profiles'] = aggregate_profiles
    else:
        logging.warning("Incorrect function for profile aggregation: {}. Parameter ignored."
                        "Available values are: 'mean' and 'median'".format(aggregate_profiles))
        params['aggregate_profiles'] = None

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

import json
import os
import webbrowser

from flask import Flask, render_template

from ceteris_paribus.plots import PLOTS_DIR

app = Flask(__name__, template_folder=PLOTS_DIR)
number = iter(range(1000))


def plot(cp_profile, *args, color=None,
         show_profiles=True, show_observations=True, show_residuals=False, show_rugs=False,
         aggregate_profiles=None, selected_variables=None, **kwargs):

    params = dict()
    params.update(kwargs)
    params["variables"] = selected_variables or cp_profile.selected_variables
    params['color'] = "_label_" if args else color
    params['show_profiles'] = show_profiles
    params['show_observations'] = show_observations
    params['show_rugs'] = show_rugs
    params['show_residuals'] = show_residuals and (cp_profile.new_observation_true is not None)
    # TODO define the set of possible aggregators (strings)
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

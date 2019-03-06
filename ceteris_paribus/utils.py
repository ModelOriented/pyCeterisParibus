import json
import os

from ceteris_paribus.plots import PLOTS_DIR


def save_profiles(profiles, filename):
    data = dump_profiles(profiles)
    with open(os.path.join(PLOTS_DIR, filename), 'w') as f:
        f.write("profile = {};".format(json.dumps(data, indent=2, default=default)))


def dump_profiles(profiles):
    """
    Dump profiles into json format accepted by the plotting library

    :return: list of dicts representing points in the profile
    """
    data = []
    for cp_profile in profiles:
        for i, row in cp_profile.profile.iterrows():
            data.append(dict(zip(cp_profile.profile.columns, row)))
    return data


def default(o):
    """
    Workaround for dumping arrays with np.int64 type into json
    From: https://stackoverflow.com/a/50577730/7828646

    """
    return int(o)


def save_observations(profiles, filename):
    data = dump_observations(profiles)
    with open(os.path.join(PLOTS_DIR, filename), 'w') as f:
        f.write("observation = {};".format(json.dumps(data, indent=2, default=default)))


def dump_observations(profiles):
    data = []
    for profile in profiles:
        for i, yhat in enumerate(profile.new_observation_predictions):
            for var_name in profile.selected_variables:
                d = dict(zip(profile._all_variable_names, profile._new_observation.iloc[i]))
                d['_vname_'] = var_name
                d['_yhat_'] = yhat
                d['_label_'] = profile._label
                d['_ids_'] = i
                d['_y_'] = profile.new_observation_true[i] if profile.new_observation_true is not None else None
                data.append(d)
    return data

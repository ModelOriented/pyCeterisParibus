import json

import numpy as np
import pandas as pd


def save_profiles(profiles, filename):
    data = dump_profiles(profiles)
    with open(filename, 'w') as f:
        f.write("profile = {};".format(json.dumps(data, indent=2, default=default)))


def dump_profiles(profiles):
    """
    Dump profiles into json format accepted by the plotting library

    :return: list of dicts representing points in the profiles
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
    if isinstance(o, np.int64):
        return int(o)
    return float(o)


def save_observations(profiles, filename):
    data = dump_observations(profiles)
    with open(filename, 'w') as f:
        f.write("observation = {};".format(json.dumps(data, indent=2, default=default)))


def dump_observations(profiles):
    """
    Dump observations data into json format accepted by the plotting library

    :return: list of dicts representing observations in the profiles
    """
    data = []
    for profile in profiles:
        for i, yhat in enumerate(profile.new_observation_predictions):
            d = dict(zip(profile.all_variable_names, profile.new_observation.iloc[i]))
            d['_yhat_'] = yhat
            d['_label_'] = profile._label
            d['_ids_'] = i
            d['_y_'] = profile.new_observation_true[i] if profile.new_observation_true is not None else None
            data.append(d)
    return data


def transform_into_Series(y):
    if isinstance(y, pd.core.frame.DataFrame):
        y = pd.Series(y.iloc[:, 0])
    else:
        y = pd.Series(y)
    return y

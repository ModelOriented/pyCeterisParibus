import json
import os
from collections import OrderedDict

import numpy as np
import pandas as pd

from ceteris_paribus.plots import PLOTS_DIR


def individual_variable_profile(explainer, new_observation, y=None, variables=None, grid_points=101):
    """
    Calculate ceteris paribus profile
    :param explainer: a model to be explained
    :param new_observation: a new observation with columns that corresponds to variables used in the model
    :param y: y true labels for `new_observation`. If specified then will be added to ceteris paribus plots
    :param variables: variables selected for calculating profiles
    :param grid_points: number of points for profile
    :return: instance of CeterisParibus class
    """
    if variables:
        if not set(variables).issubset(explainer.var_names):
            raise ValueError('Invalid variable names')
    else:
        variables = explainer.var_names

    cp_profiles = CeterisParibus(explainer, new_observation, y, variables, grid_points)
    return cp_profiles


class CeterisParibus:

    def __init__(self, explainer, new_observation, y, selected_variables, grid_points):
        self._data = explainer.data
        self._all_variable_names = list(explainer.var_names)
        self._new_observation = np.array(new_observation)
        if self._new_observation.ndim == 1:
            self._new_observation = np.array([self._new_observation])
        self.selected_variables = sorted(selected_variables)
        self._predict_function = explainer.predict_fun
        self._grid_points = grid_points
        self._label = explainer.label
        self._variables_dict = dict(zip(self._all_variable_names, self._data.T))
        self._chosen_variables_dict = dict((var, self._variables_dict[var]) for var in self.selected_variables)

        variable_splits = self.calculate_variable_splits()
        self._profiles_list = [self._single_variable_df(var_name, var_split)
                               for var_name, var_split in variable_splits.items()]
        self.profile = pd.concat(self._profiles_list, ignore_index=True)
        variables_mask = [self._all_variable_names.index(var) for var in self.selected_variables]
        self.new_observation_values = self._new_observation.take(variables_mask, axis=1)
        self.new_observation_predictions = self._predict_function(self._new_observation)
        self.new_observation_true = [y] if np.isscalar(y) else y

    def calculate_variable_splits(self):
        return dict(
            (var, self._calculate_single_split(X_var))
            for (var, X_var) in self._chosen_variables_dict.items()
        )

    def _calculate_single_split(self, X_var):
        if np.issubdtype(X_var.dtype, np.integer):
            return np.unique(X_var)
        quantiles = np.linspace(0, 1, self._grid_points)
        return np.quantile(X_var, quantiles)

    def _single_variable_df(self, var_name, var_split):
        return pd.concat([self._single_observation_df(observation, var_name, var_split, profile_id)
                          for profile_id, observation in enumerate(self._new_observation)], ignore_index=True)

    def _single_observation_df(self, observation, var_name, var_split, profile_id):
        grid_points = len(var_split)
        X = np.tile(observation, (grid_points, 1))
        X_dict = dict(zip(self._all_variable_names, X.T))
        df = pd.DataFrame.from_dict(X_dict)
        df[var_name] = var_split
        df['_yhat_'] = self._predict_function(df.values)
        df['_vname_'] = np.repeat(var_name, grid_points)
        df['_label_'] = self._label
        df['_ids_'] = profile_id
        return df

    def split_by(self, column):
        """
        Split cp profile data frame by values of a given column
        :return: sorted mapping of values to dataframes
        """
        return OrderedDict(sorted(list(self.profile.groupby(column, sort=False))))

    def set_label(self, label):
        self._label = label

    def print_profile(self):
        print('Selected variables: {}'.format(self.selected_variables))
        print('Training data size: {}'.format(self._data.shape[0]))
        print(self.profile)

    def save_profiles(self, profiles, filename):
        data = self.dump_profiles(profiles)
        with open(os.path.join(PLOTS_DIR, filename), 'w') as f:
            f.write("profile = {};".format(json.dumps(data, indent=2, default=self.default)))

    def dump_profiles(self, profiles):
        data = []
        for cp_profile in profiles:
            for i, row in cp_profile.profile.iterrows():
                data.append(dict(zip(cp_profile.profile.columns, row)))
        return data

    @staticmethod
    def default(o):
        """
        Workaround for dumping arrays with np.int64 type into json
        From: https://stackoverflow.com/a/50577730/7828646
\        """
        if isinstance(o, np.int64):
            return int(o)
        raise TypeError

    def save_observations(self, profiles, filename):
        data = self.dump_observations(profiles)
        with open(os.path.join(PLOTS_DIR, filename), 'w') as f:
            f.write("observation = {};".format(json.dumps(data, indent=2, default=self.default)))

    def dump_observations(self, profiles):
        data = []
        for profile in profiles:
            for i, yhat in enumerate(profile.new_observation_predictions):
                for var_name in profile.selected_variables:
                    d = dict(zip(profile._all_variable_names, profile._new_observation[i]))
                    d['_vname_'] = var_name
                    d['_yhat_'] = yhat
                    d['_label_'] = profile._label
                    d['_ids_'] = i
                    d['_y_'] = profile.new_observation_true[i] if profile.new_observation_true is not None else None
                    data.append(d)
        return data

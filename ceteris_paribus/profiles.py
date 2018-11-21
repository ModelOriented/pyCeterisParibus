import re

import numpy as np
import pandas as pd


def individual_variable_profile(model, data, all_var_names, new_observation, y=None, selected_variables=None,
                                predict_function=None, grid_points=101, label=None):
    """
    Single Ceteris Paribus profile
    TODO document this
    TODO change the grid points number
    :param model:
    :param data:
    :param all_var_names:
    :param new_observation:
    :param y:
    :param selected_variables:
    :param predict_function:
    :param grid_points:
    :param label:
    :return:
    """
    if not predict_function:
        if hasattr(model, 'predict'):
            predict_function = model.predict
        else:
            raise ValueError('Unable to find predict function')
    if not label:
        if hasattr(model, '__str__'):
            label = re.split('\(', model.__str__())[0]
        else:
            label = ''
    if selected_variables:
        if not set(selected_variables).issubset(all_var_names):
            raise ValueError('Invalid variable names')
    else:
        selected_variables = all_var_names

    cp_profiles = CeterisParibus(data, all_var_names, new_observation, y, selected_variables, predict_function,
                                 grid_points, label)
    return cp_profiles


class CeterisParibus:

    def __init__(self, data, all_variable_names, new_observation, y, selected_variables, predict_function,
                 grid_points, label):
        self._all_variable_names = all_variable_names
        self._new_observation = new_observation
        self._predict_function = predict_function
        self._grid_points = grid_points
        self._label = label
        self._variables_dict = dict(zip(self._all_variable_names, data.T))
        self._chosen_variables_dict = dict((var, self._variables_dict[var]) for var in selected_variables)

        variable_splits = self.calculate_variable_splits()
        self.profiles_list = [self._single_variable_df(var_name, var_split)
                              for var_name, var_split in variable_splits.items()]
        variables_mask = [self._all_variable_names.index(var) for var in selected_variables]
        self.new_observation_values = new_observation[variables_mask]
        self.new_observation_predictions = predict_function([new_observation] * len(self.new_observation_values))
        self.new_observation_true = y

    def calculate_variable_splits(self):
        return dict(
            (var, self._calculate_single_split(X_var, self._grid_points))
            for (var, X_var) in self._chosen_variables_dict.items()
        )

    def _calculate_single_split(self, X_var, grid_points):
        """
        :param X_var:
        :param grid_points:
        :return:
        """
        if np.issubdtype(X_var.dtype, np.integer):
            return np.unique(X_var)
        quantiles = np.linspace(0, 1, grid_points)
        return np.quantile(X_var, quantiles)

    def _single_variable_df(self, var_name, var_split):
        """

        :param var_name:
        :param var_split:
        :return:
        """
        grid_points = len(var_split)
        X = np.tile(self._new_observation, (grid_points, 1))
        X_dict = dict(zip(self._all_variable_names, X.T))
        df = pd.DataFrame.from_dict(X_dict)
        df[var_name] = var_split
        df['_yhat_'] = self._predict_function(df.values)
        df['_vname_'] = np.repeat(var_name, grid_points)
        df['_label_'] = self._label
        df['_ids_'] = 1
        return df

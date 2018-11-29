import logging
import re
from collections import OrderedDict

import numpy as np
import pandas as pd


def individual_variable_profile(model, data, all_var_names, new_observation, y=None, selected_variables=None,
                                predict_function=None, grid_points=101, label=None):
    """
    Calculate ceteris paribus profile
    :param model: a model to be explained
    :param data: data to be used for creating profiles, e.g. calculating splits
    :param all_var_names: column names in the same order as columns in data
    :param new_observation: a new observation with columns that corresponds to variables used in the model
    :param y: y true labels for `new_observation`. If specified then will be added to ceteris paribus plots
    :param selected_variables:
    :param predict_function: predict function, will be extracted from model if not supplied
    :param grid_points: number of points for profile
    :param label: name of the model
    :return: instance of CeterisParibus class
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
            logging.warning("Model is unlabeled... \n You can add label using method set_label")
            label = 'unlabeled_model'
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
        self._new_observation = np.array(new_observation)
        if self._new_observation.ndim == 1:
            self._new_observation = np.array([self._new_observation])
        self._selected_variables = sorted(selected_variables)
        self._predict_function = predict_function
        self._grid_points = grid_points
        self._label = label
        self._variables_dict = dict(zip(self._all_variable_names, data.T))
        self._chosen_variables_dict = dict((var, self._variables_dict[var]) for var in self._selected_variables)

        variable_splits = self.calculate_variable_splits()
        self._profiles_list = [self._single_variable_df(var_name, var_split)
                               for var_name, var_split in variable_splits.items()]
        self.profile = pd.concat(self._profiles_list, ignore_index=True)
        variables_mask = [self._all_variable_names.index(var) for var in self._selected_variables]
        self.new_observation_values = self._new_observation.take(variables_mask, axis=1)
        self.new_observation_predictions = predict_function(self._new_observation)
        self.new_observation_true = [y] if y else None


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
        return OrderedDict(sorted(list(self.profile.groupby(column))))

    def set_label(self, label):
        self._label = label

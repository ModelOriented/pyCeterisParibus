import logging
from collections import OrderedDict

import numpy as np
import pandas as pd

from ceteris_paribus.utils import transform_into_Series


def individual_variable_profile(explainer, new_observation, y=None, variables=None, grid_points=101,
                                variable_splits=None):
    """
    Calculate ceteris paribus profile

    :param explainer: a model to be explained
    :param new_observation: a new observation for which the profiles are calculated
    :param y: y true labels for `new_observation`. If specified then will be added to ceteris paribus plots
    :param variables: collection of variables selected for calculating profiles
    :param grid_points: number of points for profile
    :param variable_splits: dictionary of splits for variables, in most cases created with `_calculate_variable_splits()`. If None then it will be calculated based on validation data avaliable in the `explainer`.
    :return: instance of CeterisParibus class
    """
    variables = _get_variables(variables, explainer)
    if not isinstance(new_observation, pd.core.frame.DataFrame):
        new_observation = np.array(new_observation)
        if new_observation.ndim == 1:
            # make 1D array 2D
            new_observation = new_observation.reshape((1, -1))
        new_observation = pd.DataFrame(new_observation, columns=explainer.var_names)
    else:
        try:
            new_observation.columns = explainer.var_names
        except ValueError as e:
            raise ValueError("Mismatched number of variables {} instead of {}".format(len(new_observation.columns),
                                                                                      len(explainer.var_names)))

    if y is not None:
        y = transform_into_Series(y)

    cp_profile = CeterisParibus(explainer, new_observation, y, variables, grid_points, variable_splits)
    return cp_profile


def _get_variables(variables, explainer):
    """
    Get valid variables for the profile

    :param variables: collection of variables
    :param explainer: Explainer object
    :return: collection of variables
    """
    if variables:
        if not set(variables).issubset(explainer.var_names):
            raise ValueError('Invalid variable names')
    else:
        variables = explainer.var_names
    return variables


def _valid_variable_splits(variable_splits, variables):
    """
    Validate variable splits
    """
    if set(variable_splits.keys()) == set(variables):
        return True
    else:
        logging.warning("Variable splits are incorrect - wrong set of variables supplied. Parameter is ignored")
        return False


class CeterisParibus:

    def __init__(self, explainer, new_observation, y, selected_variables, grid_points, variable_splits):
        """
        Creates Ceteris Paribus object

        :param explainer: explainer wrapping the model
        :param new_observation: DataFrame with observations for which the profiles will be calculated
        :param y: pandas Series with labels for the observations
        :param selected_variables: variables for which the profiles are calculated
        :param grid_points: number of points in a single variable split if calculated automatically
        :param variable_splits: mapping of variables into points the profile will be calculated, if None then calculate with the function `_calculate_variable_splits`
        """
        self._data = explainer.data
        self._predict_function = explainer.predict_fun
        self._grid_points = grid_points
        self._label = explainer.label
        self.all_variable_names = explainer.var_names
        self.new_observation = new_observation
        self.selected_variables = list(selected_variables)
        variable_splits = self._get_variable_splits(variable_splits)
        self.profile = self._calculate_profile(variable_splits)
        self.new_observation_values = self.new_observation[self.selected_variables]
        self.new_observation_predictions = self._predict_function(self.new_observation)
        self.new_observation_true = y

    def _get_variable_splits(self, variable_splits):
        """
        Helper function for calculating variable splits
        """
        if variable_splits is None or not _valid_variable_splits(variable_splits, self.selected_variables):
            variables_dict = self._data.to_dict(orient='series')
            chosen_variables_dict = dict((var, variables_dict[var]) for var in self.selected_variables)
            variable_splits = self._calculate_variable_splits(chosen_variables_dict)
        return variable_splits

    def _calculate_profile(self, variable_splits):
        """
        Calculate DataFrame profile
        """
        profiles_list = [self._single_variable_df(var_name, var_split)
                         for var_name, var_split in variable_splits.items()]
        profile = pd.concat(profiles_list, ignore_index=True)
        return profile

    def _calculate_single_split(self, X_var):
        """
        Calculate the split for a single variable

        :param X_var: variable data - pandas Series
        :return: selected subset of values for the variable
        """
        if np.issubdtype(X_var.dtype, np.floating):
            # grid points might be larger than the number of unique values
            quantiles = np.linspace(0, 1, self._grid_points)
            return np.quantile(X_var, quantiles)
        else:
            return np.unique(X_var)

    def _calculate_variable_splits(self, chosen_variables_dict):
        """
        Calculate splits for the given variables

        :param chosen_variables_dict: mapping  of variables into the values
        :return: mapping of variables into selected subsets of values
        """
        return dict(
            (var, self._calculate_single_split(X_var))
            for (var, X_var) in chosen_variables_dict.items()
        )

    def _single_variable_df(self, var_name, var_split):
        """
        Calculate profiles for a given variable

        :param var_name: variable name
        :param var_split: split values for the variable
        :return: DataFrame with profiles for a given variable
        """
        return pd.concat([self._single_observation_df(observation, var_name, var_split, profile_id)
                          for profile_id, observation in self.new_observation.iterrows()], ignore_index=True)

    def _single_observation_df(self, observation, var_name, var_split, profile_id):
        """
        Calculates the single profile

        :param observation: observation for which the profile is calculated
        :param var_name: variable name
        :param var_split: split values for the variable
        :param profile_id: profile id
        :return: DataFrame with the calculated profile values
        """
        # grid_points and self._grid_point might differ for categorical variables
        grid_points = len(var_split)
        X = np.tile(observation, (grid_points, 1))
        X_dict = OrderedDict(zip(self.all_variable_names, X.T))
        df = pd.DataFrame.from_dict(X_dict)
        df[var_name] = var_split
        df['_yhat_'] = self._predict_function(df)
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


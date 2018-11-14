import re

import numpy as np
import pandas as pd


def individual_variable_profile(model, data, names, new_observation, y=None, selected_variables=None,
                                predict_function=None,
                                grid_points=21, label=None):
    """
    Single Ceteris Paribus profile
    TODO document this
    :param model:
    :param data:
    :param names:
    :param new_observation:
    :param y:
    :param selected_variables:
    :param predict_function:
    :param grid_points:
    :param label:
    :return:
    """
    if not predict_function:
        predict_function = model.predict
    if not label:
        label = re.split('\(', model.__str__())[0]
    if selected_variables:
        if not selected_variables in names:
            raise ValueError('Invalid variable names')
    else:
        selected_variables = names

    variables_dict = dict(zip(names, data.T))
    chosen_variables_dict = dict((var, variables_dict[var]) for var in selected_variables)
    variable_splits = calculate_variable_splits(chosen_variables_dict, grid_points)

    result_df = [_single_variable_df(var_name, var_split, names, new_observation, predict_function)
                 for var_name, var_split in variable_splits.items()]

    return result_df


def _single_variable_df(var_name, var_split, all_var_names, new_observation, predict_function):
    # TODO make it object oriented and share parameters
    grid_points = len(var_split)
    X = np.tile(new_observation, (grid_points, 1))
    X_dict = dict(zip(all_var_names, X.T))
    df = pd.DataFrame.from_dict(X_dict)
    df[var_name] = var_split
    df['_yhat_'] = predict_function(df.values)
    df['_var_'] = np.repeat(var_name, grid_points)
    return df

def calculate_variable_splits(chosen_variables_dict, grid_points):
    return dict((var, _calculate_single_split(X_var, grid_points)) for (var, X_var) in chosen_variables_dict.items())


def _calculate_single_split(X_var, grid_points):
    """
    TODO works for numeric only
    :param X_var:
    :param grid_points:
    :return:
    """
    quantiles = np.linspace(0, 1, grid_points)
    return np.quantile(X_var, quantiles)

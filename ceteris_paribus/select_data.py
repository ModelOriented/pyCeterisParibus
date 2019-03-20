import logging

import numpy as np
import pandas as pd

from ceteris_paribus.gower import gower_distances
from ceteris_paribus.utils import transform_into_Series


def select_sample(data, y=None, n=15, seed=42):
    """
    Select sample from dataset.

    :param data: array or dataframe with observations
    :param y: labels for observations
    :param n: size of the sample
    :param seed: seed for random number generator
    :return: selected observations and corresponding labels if provided
    """
    np.random.seed(seed)
    if n > data.shape[0]:
        logging.warning("Given n ({}) is larger than data size ({})".format(n, data.shape[0]))
        n = data.shape[0]
    indices = np.random.choice(data.shape[0], n, replace=False)

    if isinstance(data, pd.core.frame.DataFrame):
        sampled_x = data.iloc[indices]
        sampled_x.reset_index(drop=True, inplace=True)
    else:
        sampled_x = data[indices, :]

    if y is not None:
        y = transform_into_Series(y)
        return sampled_x, y[indices].reset_index(drop=True)
    else:
        return sampled_x


def _select_columns(data, observation, variable_names=None, selected_variables=None):
    """
    Select data with specified columns

    :param data: DataFrame with observations
    :param observation: pandas Series with reference observation for neighbours selection
    :param variable_names: names of all variables
    :param selected_variables: names of selected variables
    :return: DataFrame with observations and pandas Series with referenced observation, with selected columns
    """
    if selected_variables is None:
        return data, observation
    try:
        if variable_names is None:
            if isinstance(data, pd.core.frame.DataFrame):
                variable_names = data.columns
            else:
                raise ValueError("Impossible to detect variable names")
        indices = [list(variable_names).index(var) for var in selected_variables]
    except ValueError:
        logging.warning("Selected variables: {} is not a subset of variables: {}".format(
            selected_variables, variable_names))
        return data, observation

    subset_data = data.iloc[:, indices]
    return subset_data, observation[indices]


def select_neighbours(data, observation, y=None, variable_names=None, selected_variables=None, dist_fun='gower', n=20):
    """
    Select observations from dataset, that are similar to a given observation

    :param data: array or DataFrame with observations
    :param observation: reference observation for neighbours selection
    :param y: labels for observations
    :param variable_names: names of variables
    :param selected_variables: selected variables - require supplying variable names along with data
    :param dist_fun: 'gower' or distance function, as pairwise distances in sklearn, gower works with missing data
    :param n: size of the sample
    :return: DataFrame with selected observations and pandas Series with corresponding labels if provided
    """
    if n > data.shape[0]:
        logging.warning("Given n ({}) is larger than data size ({})".format(n, data.shape[0]))
        n = data.shape[0]

    if not isinstance(data, pd.core.frame.DataFrame):
        data = pd.DataFrame(data)

    observation = transform_into_Series(observation)

    # columns are selected for the purpose of distance calculation
    selected_data, observation = _select_columns(data, observation, variable_names, selected_variables)

    if dist_fun == 'gower':
        distances = gower_distances(selected_data, observation)
    else:
        if not callable(dist_fun):
            raise ValueError('Distance has to be "gower" or a custom function')
        distances = dist_fun([observation], selected_data)[0]

    indices = np.argpartition(distances, n - 1)[:n]

    # selected points have all variables
    selected_points = data.iloc[indices]
    selected_points.reset_index(drop=True, inplace=True)

    if y is not None:
        y = transform_into_Series(y)
        return selected_points, y.iloc[indices].reset_index(drop=True)
    else:
        return selected_points

import logging

import numpy as np

from ceteris_paribus.gower import gower_distances


def select_sample(data, y=None, n=15, seed=42):
    """
    Select sample from dataset.
    :param data: array with observations
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
    if y is not None:
        return data[indices, :], y[indices]
    else:
        return data[indices, :]


def _select_subset_data(data, observation, variable_names=None, selected_variables=None):
    if selected_variables is None:
        return data, observation
    try:
        indices = [variable_names.index(var) for var in selected_variables]
    except ValueError:
        logging.warning("Selected variables: {} is not a subset of variables: {}".format(
            selected_variables, variable_names))
        return data, observation
    return data[:, indices], observation[indices]


def select_neighbours(data, observation, y=None, variable_names=None, selected_variables=None, dist_fun='gower', n=20):
    """
    Select observations from dataset, that are similar to a given observation
    :param data: array with observations
    :param observation: reference observation for neighbours selection
    :param y: labels for observations
    :param variable_names: names of variables
    :param selected_variables: selected variables - require supplying variable names along with data
    :param dist_fun: 'gower' or distance function, as pairwise distances in sklearn, gower works with missing data
    :param n: size of the sample
    :return: selected observations and corresponding labels if provided
    """
    if n > data.shape[0]:
        logging.warning("Given n ({}) is larger than data size ({})".format(n, data.shape[0]))
        n = data.shape[0]

    data, observation = _select_subset_data(data, observation, variable_names, selected_variables)

    if dist_fun == 'gower':
        distances = gower_distances(data, observation)
    else:
        if not callable(dist_fun):
            raise ValueError('Distance has to be "gower" or a custom function')
        distances = dist_fun([observation], data)[0]
    indices = np.argpartition(distances, n - 1)[:n]
    selected_points = data[indices, :]
    if y is not None:
        return selected_points, y[indices]
    else:
        return selected_points

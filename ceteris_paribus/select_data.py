import logging

import numpy as np
from sklearn.metrics.pairwise import euclidean_distances


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


def select_neighbours(data, observation, y=None, variables=None, distance=euclidean_distances, n=20):
    """
    Select observations from dataset, that are similar to a given observation
    :param data: array with observations
    :param observation: reference observation for neighbours selection
    :param y: labels for observations
    :param variables: TODO add variables choide - require supplying variable names along with data
    :param distance: distance function, as pairwise distances in sklearn
    :param n: size of the sample
    :return: selected observations and corresponding labels if provided
    """
    if n > data.shape[0]:
        logging.warning("Given n ({}) is larger than data size ({})".format(n, data.shape[0]))
        n = data.shape[0]
    distances = distance([observation], data)[0]
    indices = np.argpartition(distances, n - 1)[:n]
    selected_points = data[indices, :]
    if y is not None:
        return selected_points, y[indices]
    else:
        return selected_points

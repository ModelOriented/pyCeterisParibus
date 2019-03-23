""" This is the module for calculating gower's distance/dissimilarity """

import numpy as np
import pandas as pd


# Normalize the array
def _normalize_mixed_data_columns(arr):
    """
    Returns the numpy array representation of the data.
    Loses information about the types
    """
    return np.array(arr, dtype=object)


def _calc_range_mixed_data_columns(data, observation, dtypes):
    """ Return range for each numeric column, 0 for categorical variables """
    _, cols = data.shape

    result = np.zeros(cols)
    for col in range(cols):
        if np.issubdtype(dtypes[col], np.number):
            result[col] = max(max(data[:, col]), observation[col]) - min(min(data[:, col]), observation[col])
    return result


def _gower_dist(xi, xj, ranges, dtypes):
    """
    Return gower's distance between xi and xj

    :param ranges: ranges of values for each column
    :param dtypes: types of each column
    """
    dtypes = np.array(dtypes)

    sum_sij = 0.0
    sum_wij = 0.0

    cols = len(ranges)
    for col in range(cols):
        if np.issubdtype(dtypes[col], np.number):
            if pd.isnull(xi[col]) or pd.isnull(xj[col]) or np.isclose(0, ranges[col]):
                wij = 0
                sij = 0
            else:
                wij = 1
                sij = abs(xi[col] - xj[col]) / ranges[col]
        else:
            sij = xi[col] != xj[col]
            wij = 0 if pd.isnull(xi[col]) and pd.isnull(xj[col]) else 1

        sum_sij += wij * sij
        sum_wij += wij

    return sum_sij / sum_wij


def gower_distances(data, observation):
    """
    Return an array of distances between all observations and a chosen one
    Based on:
    https://sourceforge.net/projects/gower-distance-4python
    https://beta.vu.nl/nl/Images/stageverslag-hoven_tcm235-777817.pdf
    
    :type data: DataFrame
    :type observation: pandas Series
    """
    dtypes = data.dtypes
    data = _normalize_mixed_data_columns(data)
    observation = _normalize_mixed_data_columns(observation)
    ranges = _calc_range_mixed_data_columns(data, observation, dtypes)
    return np.array([_gower_dist(row, observation, ranges, dtypes) for row in data])

import numpy as np
import pandas as pd


# Normalize the array
def _normalize_mixed_data_columns(arr):
    if isinstance(arr, pd.DataFrame) or isinstance(arr, pd.core.series.Series):
        return np.array(arr)
    elif isinstance(arr, np.ndarray):
        return arr
    else:
        arr = np.array(arr)
    return arr


def _calc_range_mixed_data_columns(data, observation, dtypes):
    """ Return range for each column """
    _, cols = data.shape

    result = np.zeros(cols)
    for col in range(cols):
        if np.issubdtype(dtypes[col], np.number):
            result[col] = max(data[:, col].max(), observation[col]) - min(data[:, col].min(), observation[col])
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
            sij = abs(xi[col] - xj[col]) / ranges[col]
            wij = 0 if pd.isnull(xi[col]) or pd.isnull(xj[col]) else 1
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
    """
    if hasattr(data, 'dtypes'):
        dtypes = data.dtypes
    elif hasattr(data, 'dtype'):
        dtypes = [data.dtype] * len(data)
    else:
        dtypes = [np.float32] * len(data)

    data = _normalize_mixed_data_columns(data)
    observation = _normalize_mixed_data_columns(observation)
    ranges = _calc_range_mixed_data_columns(data, observation, dtypes)
    return np.array([_gower_dist(row, observation, ranges, dtypes) for row in data])


if __name__ == "__main__":
    X = pd.DataFrame({'age': [21, 21, 19, 30, 21, 21, 19, 30],
                      'gender': ['M', 'M', 'N', 'M', 'F', 'F', 'F', 'F'],
                      'civil_status': ['MARRIED', 'SINGLE', 'SINGLE', 'SINGLE', 'MARRIED', 'SINGLE', 'WIDOW',
                                       'DIVORCED'],
                      'salary': [3000.0, 1200.0, 32000.0, 1800.0, 2900.0, 1100.0, 10000.0, 1500.0],
                      'children': [True, False, True, True, True, False, False, True],
                      'available_credit': [2200, 100, 22000, 1100, 2000, 100, 6000, 2200]})

    print(gower_distances(X, X.iloc[0]))

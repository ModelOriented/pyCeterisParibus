import numpy as np
from sklearn.metrics.pairwise import euclidean_distances


def select_sample(data, n):
    return data[np.random.choice(data.shape[0], n, replace=False), :]


def select_neighbours(data, observation, variables=None, distance=euclidean_distances, n=20, frac=None):
    distances = euclidean_distances([observation], data)[0]
    selected_points = data[np.argpartition(distances, n)[:n], :]
    return selected_points

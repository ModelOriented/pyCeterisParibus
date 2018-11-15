import unittest

import numpy as np

from ceteris_paribus.select_data import select_sample, select_neighbours


class TestSelect(unittest.TestCase):

    def setUp(self):
        self.x = np.array([[1, 0, 1], [2, 0, 2], [10, 2, 10], [1, 0, 2]])

    def test_select_sample(self):
        (_, m) = self.x.shape
        size = 2
        sample = select_sample(self.x, size)
        self.assertEqual(sample.shape, (size, m))

    def test_select_sample_2(self):
        sample = select_sample(self.x, 1)
        self.assertIn(sample[0], self.x)

    def test_select_neighbours(self):
        neighbours = select_neighbours(self.x, self.x[0], n=1)
        self.assertSequenceEqual(list(neighbours[0]), list(self.x[0]))

    def test_select_neighbours_2(self):
        (_, m) = self.x.shape
        size = 3
        neighbours = select_neighbours(self.x, np.array([4, 3, 2]), n=size)
        self.assertEqual(neighbours.shape, (size, m))

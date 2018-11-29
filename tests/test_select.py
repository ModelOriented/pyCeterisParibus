import unittest

import numpy as np

from ceteris_paribus.select_data import select_sample, select_neighbours


class TestSelect(unittest.TestCase):

    def setUp(self):
        self.x = np.array([[1, 0, 1], [2, 0, 2], [10, 2, 10], [1, 0, 2]])
        self.y = np.array([11, 12.1, 13.2, 10.5])

    def test_select_sample(self):
        (_, m) = self.x.shape
        size = 2
        sample = select_sample(self.x, n=size)
        self.assertEqual(sample.shape, (size, m))

    def test_select_sample_2(self):
        sample = select_sample(self.x, n=1)
        self.assertIn(sample[0], self.x)

    def test_select_sample_3(self):
        sample_x, sample_y = select_sample(self.x, self.y, n=1)
        pos = list(self.y).index(sample_y[0])
        self.assertSequenceEqual(list(sample_x[0]), list(self.x[pos]))

    def test_select_sample_4(self):
        sample_x = select_sample(self.x, n=300)
        self.assertEqual(len(sample_x), len(self.x))

    def test_select_neighbours(self):
        neighbours = select_neighbours(self.x, self.x[0], n=1)
        self.assertSequenceEqual(list(neighbours[0]), list(self.x[0]))

    def test_select_neighbours_2(self):
        (_, m) = self.x.shape
        size = 3
        neighbours = select_neighbours(self.x, np.array([4, 3, 2]), n=size)
        self.assertEqual(neighbours.shape, (size, m))

    def test_select_neighbours_3(self):
        sample_x, sample_y = select_neighbours(self.x, np.array([4, 3, 2]), y=self.y, n=3)
        pos = list(self.y).index(sample_y[1])
        self.assertSequenceEqual(list(sample_x[1]), list(self.x[pos]))

    def test_select_neighbours_4(self):
        sample_x = select_neighbours(self.x, np.array([4, 3, 2]), n=300)
        self.assertEqual(len(sample_x), len(self.x))

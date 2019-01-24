import unittest
from unittest.mock import MagicMock

import numpy as np

from ceteris_paribus.profiles import _get_variables, CeterisParibus


class TestProfiles(unittest.TestCase):

    def setUp(self):
        self.cp = object.__new__(CeterisParibus)

    def test_get_variables(self):
        explainer = MagicMock(var_names=["c", "a", "b"])
        variables = ["b", "a"]
        self.assertEqual(_get_variables(variables, explainer), variables)

    def test_get_variables_2(self):
        explainer = MagicMock(var_names=["c", "a", "b"])
        variables = ["a", "a"]
        self.assertEqual(_get_variables(variables, explainer), variables)

    def test_get_variables_3(self):
        explainer = MagicMock(var_names=["a", "b"])
        variables = ["c", "a"]
        with self.assertRaises(ValueError):
            _get_variables(variables, explainer)

    def test_get_variables_4(self):
        variables = ["c", "a", "b"]
        explainer = MagicMock(var_names=variables)
        self.assertEqual(_get_variables(None, explainer), variables)

    def test_individual_variable_profile(self):
        # TODO fill it
        pass

    def test_calculate_single_split(self):
        X_var = np.array([1, 2, 1, 2, 1])
        np.testing.assert_array_equal(self.cp._calculate_single_split(X_var), np.array([1, 2]))

    def test_calculate_single_split_2(self):
        np.random.seed(42)
        X_var = np.random.random(100)
        self.cp._grid_points = 5
        splits = self.cp._calculate_single_split(X_var)
        self.assertEqual(splits.shape, (self.cp._grid_points,))

    def test_calculate_single_split_3(self):
        X_var = np.array([1, 1.2, 3, 1.7])
        self.cp._grid_points = 2
        splits = self.cp._calculate_single_split(X_var)
        np.testing.assert_array_equal(splits, np.array([1, 3]))

    def test_calculate_single_split_4(self):
        np.random.seed(42)
        X_var = np.random.random(1000)
        self.cp._grid_points = 200
        splits = self.cp._calculate_single_split(X_var)
        self.assertEqual(len(splits), len(set(splits)))
        np.testing.assert_array_equal(sorted(splits), splits)

    def test_calculate_variable_splits(self):
        self.cp._grid_points = 4
        chosen_variables_dict = {
            'a': np.array([1, 2, 1, 2]),
            'b': np.array([1., 2., 3., 4., 5.5, 7.2])
        }
        splits_dict = self.cp._calculate_variable_splits(chosen_variables_dict)
        self.assertEqual(len(splits_dict), 2)
        self.assertEqual(len(splits_dict['b']), self.cp._grid_points)
        np.testing.assert_array_equal(splits_dict['a'], [1, 2])

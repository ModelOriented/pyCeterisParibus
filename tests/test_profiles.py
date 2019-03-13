import unittest
from collections import OrderedDict
from unittest.mock import MagicMock

import numpy as np
import pandas as pd

from ceteris_paribus.profiles import _get_variables, CeterisParibus, _valid_variable_splits
from ceteris_paribus.utils import dump_profiles, dump_observations, transform_into_Series


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

    def test_single_observation_df(self):
        self.cp._label = "xyz"
        self.cp.all_variable_names = ["a", "b", "c"]
        self.cp._predict_function = lambda df: df.sum(axis=1)
        splits = np.array([1, 3, 15])
        observation_df = self.cp._single_observation_df(np.array([1, 2, 10]), "a", splits, profile_id=42)
        self.assertEqual(set(observation_df.columns), {"a", "b", "c", "_yhat_", "_vname_", "_label_", "_ids_"})
        np.testing.assert_array_equal(observation_df["_yhat_"], [13, 15, 27])
        np.testing.assert_array_equal(observation_df["a"], splits)
        np.testing.assert_array_equal(observation_df["b"], [2] * 3)

    def test_single_variable_df(self):
        self.cp._label = "xyz"
        self.cp.all_variable_names = ["a", "b", "c"]
        self.cp._predict_function = lambda df: df.sum(axis=1)
        splits = np.array([1, 3, 15])
        self.cp.new_observation = pd.DataFrame(np.array([[1, 2, 10]]))
        variable_df = self.cp._single_variable_df("a", splits)
        self.assertEqual(set(variable_df.columns), {"a", "b", "c", "_yhat_", "_vname_", "_label_", "_ids_"})
        np.testing.assert_array_equal(variable_df["_yhat_"], [13, 15, 27])
        np.testing.assert_array_equal(variable_df["a"], splits)
        np.testing.assert_array_equal(variable_df["b"], [2] * 3)
        np.testing.assert_array_equal(variable_df["_ids_"], [0] * 3)

    def test_set_label(self):
        label = "xyzabc"
        self.cp.set_label(label)
        self.assertEqual(self.cp._label, label)

    def test_valid_variable_splits_1(self):
        var_splits = {"a": [1, 2], "b": [4]}
        self.assertTrue(_valid_variable_splits(var_splits, ["a", "b"]))
        # expect warning here
        self.assertFalse(_valid_variable_splits(var_splits, ["c", "a", "b"]))

    def test_get_variable_splits_1(self):
        self.cp.selected_variables = ["a", "c"]
        var_splits = {"a": [1, 2], "c": [3]}
        self.assertEqual(var_splits, self.cp._get_variable_splits(var_splits))

    def test_get_variable_splits_2(self):
        self.cp.selected_variables = ["b", "c"]
        self.cp._data = pd.DataFrame.from_dict({
            "a": [1, 2, 4, 2],
            "b": ["a", "x", "a", "c"],
            "c": [1.21, 1.45, 1.72, 1.9132]
        })
        self.cp._grid_points = 4
        var_splits = self.cp._get_variable_splits(None)
        self.assertEqual(len(var_splits["b"]), 3)
        self.assertEqual(len(var_splits["c"]), 4)

    def test_calculate_profile(self):
        self.cp._single_variable_df = lambda var_name, var_split: pd.DataFrame({"c": [5], "d": [7]})
        var_splits = {"a": [2, 5, 2], "b": [3, 6]}
        self.assertEqual(self.cp._calculate_profile(var_splits).shape, (2, 2))


class TestProfilesUtils(unittest.TestCase):

    def setUp(self):
        self.cp1 = object.__new__(CeterisParibus)

    def test_dump_profiles_1(self):
        self.cp1.profile = pd.DataFrame()
        # one empty profile
        observations = dump_profiles([self.cp1])
        self.assertEqual(observations, [])

    def test_dump_profiles_2(self):
        records = [{
            "age": 19.0,
            "_vname_": "children",
            "_yhat_": 19531.877043934743,
            "_label_": "GradientBoostingRegressor",
            "children": 4.0,
            "_ids_": 0,
            "bmi": 27.9
        },
            {
                "age": 19.0,
                "_vname_": "children",
                "_yhat_": 19531.877043934743,
                "_label_": "GradientBoostingRegressor",
                "children": 4.0,
                "_ids_": 0,
                "bmi": 27.9
            }]

        self.cp1.profile = pd.DataFrame.from_records(records)
        self.assertEqual(records, dump_profiles([self.cp1]))

    def test_dump_profiles_3(self):
        records = [{
            "age": 19.0,
            "_vname_": "children",
            "_yhat_": 19531.877043934743,
            "_label_": "GradientBoostingRegressor",
            "children": 4.0,
            "_ids_": 0,
            "bmi": 27.9
        },
            {
                "age": 19.0,
                "_vname_": "children",
                "_yhat_": 19531.877043934743,
                "_label_": "GradientBoostingRegressor",
                "children": 4.0,
                "_ids_": 0,
                "bmi": 27.9
            }]
        self.cp1.profile = pd.DataFrame.from_records(records)
        self.assertEqual(records + records + records, dump_profiles([self.cp1, self.cp1, self.cp1]))

    def test_dump_observations(self):
        self.cp1.new_observation = pd.DataFrame.from_dict({
            "a": [1.2, 3.4, 2.6],
            "c": [4, 5, 12]
        })
        self.cp1.all_variable_names = list(self.cp1.new_observation.columns)
        self.cp1.selected_variables = ["a", "c"]
        self.cp1.new_observation_predictions = [12, 3, 6]
        self.cp1._label = "some_label"
        # true values not given
        self.cp1.new_observation_true = None
        observations = dump_observations([self.cp1])
        self.assertEqual(len(observations), 6)
        self.assertEqual(observations[0]['_vname_'], "a")
        self.assertEqual(observations[4]["_label_"], "some_label")
        self.assertEqual(observations[3]["_y_"], None)

    def test_dump_observations_2(self):
        self.cp1.new_observation = pd.DataFrame.from_dict({
            "a": [1.2, 3.4, 2.6],
            "c": [4, 5, 12]
        })
        self.cp1.all_variable_names = list(self.cp1.new_observation.columns)
        self.cp1.selected_variables = ["a"]
        self.cp1.new_observation_predictions = [12, 3, 6]
        self.cp1._label = "some_label"
        self.cp1.new_observation_true = [13, 4, 5]
        observations = dump_observations([self.cp1, self.cp1])
        self.assertEqual(len(observations), 6)
        self.assertEqual(observations[1]["_y_"], 4)

    def test_transform_into_Series_1(self):
        a = [1, 4, 2]
        b = transform_into_Series(a)
        np.testing.assert_array_equal(a, b)

    def test_transform_into_Series_2(self):
        a = np.array([4, 1, 6])
        b = transform_into_Series(a)
        np.testing.assert_array_equal(a, b)

    def test_transform_into_Series_3(self):
        a = pd.DataFrame(OrderedDict(zip(['a', 'b'], [[1, 2, 3], [4, 2, 1]])))
        b = transform_into_Series(a)
        np.testing.assert_array_equal(b, [1, 2, 3])

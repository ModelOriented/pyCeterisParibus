import unittest
from unittest.mock import MagicMock

from ceteris_paribus.plots.plots import _calculate_plot_variables, _params_update, _get_data_paths


class TestPlots(unittest.TestCase):

    def test_calculate_plot_variables(self):
        profile = MagicMock(selected_variables=["a", "b", "c"])
        self.assertEqual(_calculate_plot_variables(profile, ["b", "c"]), ["b", "c"])

    def test_calculate_plot_variables_2(self):
        profile = MagicMock(selected_variables=["a", "b", "c"])
        self.assertEqual(_calculate_plot_variables(profile, None), ["a", "b", "c"])

    def test_calculate_plot_variables_3(self):
        profile = MagicMock(selected_variables=["a", "b", "c"])
        # prints warning
        self.assertEqual(_calculate_plot_variables(profile, ["a", "d"]), ["a", "b", "c"])

    def test_params_update(self):
        self.assertEqual(_params_update({}, a=1, b=None, c=13), {'a': 1, 'c': 13})

    def test_data_paths(self):
        plot_path, params_path, obs_path, profile_path = _get_data_paths(5)
        self.assertTrue(plot_path.endswith('.html'))
        self.assertTrue(params_path.endswith('.js'))
        self.assertTrue(obs_path.endswith('.js'))
        self.assertTrue(profile_path.endswith('.js'))

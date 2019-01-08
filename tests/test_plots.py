import unittest

import numpy as np
import pandas as pd

from ceteris_paribus.plots.plots import _build_aggregated_profile


class TestBuildAggregateProfile(unittest.TestCase):

    def setUp(self):
        np.random.seed(42)
        self.profile1 = pd.DataFrame.from_dict({'var1': np.tile(np.random.rand(2), 4),
                                                '_yhat_': [1, 2, 3, 5, 10, 3, 6, 13],
                                                '_ids_': [0, 0, 1, 1, 2, 2, 3, 3]})
        self.profile1['_vname_'] = 'var1'
        self.profile2 = pd.DataFrame.from_dict({'var1': np.tile(np.random.rand(4), 2),
                                                'var2': np.tile(np.random.rand(4), 2),
                                                '_yhat_': [1, 2, 3, 5, 10, 3, 6, 13],
                                                '_ids_': [0, 0, 0, 0, 1, 1, 1, 1]})
        self.profile2['_vname_'] = 'var2'

    def test_build_aggregated_profile_1(self):
        x, y = _build_aggregated_profile(self.profile1, np.mean)
        np.testing.assert_array_equal(x, self.profile1['var1'][:2])
        np.testing.assert_array_equal(y, np.array([5, 5.75]))

    def test_build_aggregated_profile_2(self):
        x, y = _build_aggregated_profile(self.profile1, np.median)
        np.testing.assert_array_equal(y, np.array([4.5, 4]))
        _, y2 = _build_aggregated_profile(self.profile1, np.max)
        np.testing.assert_array_equal(y2, np.array([10, 13]))

    def test_build_aggregated_profile_3(self):
        x, y = _build_aggregated_profile(self.profile2, np.mean)
        np.testing.assert_array_equal(x, self.profile2['var2'][:4])
        np.testing.assert_array_equal(y, np.array([5.5, 2.5, 4.5, 9]))

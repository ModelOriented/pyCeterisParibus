import unittest
from unittest.mock import MagicMock

import numpy as np
import pandas as pd
from sklearn import datasets, ensemble

from ceteris_paribus.explainer import explain


class TestExplain(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        boston = datasets.load_boston()

        cls.X = boston['data']
        cls.y = boston['target']

        cls.rf_model = ensemble.RandomForestRegressor(n_estimators=100, random_state=42)

        # Train the model using the training set
        cls.rf_model.fit(cls.X, cls.y)

        cls.var_names = list(boston['feature_names'])

        cls.df = pd.DataFrame.from_dict({'a': [1, 2], 'b': [3, 6]})

    def test_explainer_1(self):
        model = MagicMock()
        delattr(model, 'predict')
        with self.assertRaises(ValueError) as c:
            explain(model, self.var_names)

    def test_explainer_2(self):
        model = MagicMock(predict=id)
        explainer = explain(model, data=pd.DataFrame())
        self.assertEqual(explainer.predict_fun, id)

    def test_explainer_3(self):
        explainer = explain(self.rf_model, [], predict_function=sum)
        self.assertEqual(explainer.predict_fun, sum)

    def test_explainer_4(self):
        label = "xyz"
        explainer = explain(self.rf_model, [], label=label)
        self.assertEqual(explainer.label, label)

    def test_explainer_5(self):
        # raises warning
        explainer = explain(self.rf_model, [])
        self.assertEqual(explainer.label, "RandomForestRegressor")

    def test_explainer_6(self):
        model = MagicMock()
        model.__str__.return_value = 'xyz'
        # raises warning
        explainer = explain(model, [])
        self.assertEqual(explainer.label, "unlabeled_model")

    def test_explainer_7(self):
        # no labels given
        with self.assertRaises(ValueError) as c:
            explainer = explain(self.rf_model)

    def test_explainer_8(self):
        # labels imputed from the dataframe
        explainer = explain(self.rf_model, data=self.df)
        self.assertEqual(explainer.var_names, ['a', 'b'])

    def test_explainer_9(self):
        explainer = explain(self.rf_model, variable_names=["a", "b", "c"], y=[1, 2, 3])
        np.testing.assert_array_equal(explainer.y, pd.Series([1, 2, 3]))

    def test_explainer_10(self):
        explainer = explain(self.rf_model, variable_names=["a", "b"], y=np.array([1, 4]))
        np.testing.assert_array_equal(explainer.y, pd.Series([1, 4]))

    def test_explainer_11(self):
        explainer = explain(self.rf_model, variable_names=["a", "b"], y=pd.DataFrame(np.array([1, 4])))
        np.testing.assert_array_equal(explainer.y, pd.Series([1, 4]))

    def test_explainer_12(self):
        # data from dataframe
        explainer = explain(self.rf_model, data=self.df)
        np.testing.assert_array_equal(explainer.data, self.df)

    def test_explainer_13(self):
        # data from numpy array
        explainer = explain(self.rf_model, variable_names=["a", "b"], data=self.df.values)
        np.testing.assert_array_equal(explainer.data, self.df)

    def test_explainer_14(self):
        # data for one observation - 1D array
        explainer = explain(self.rf_model, variable_names=["a", "b"], data=np.array(["cc", "dd"]))
        np.testing.assert_array_equal(explainer.data, pd.DataFrame.from_dict({"a": ["cc"], "b": ["dd"]}))

    def test_explainer_15(self):
        # wrong number of variables
        with self.assertRaises(ValueError):
            explainer = explain(self.rf_model, variable_names=["a", "b", "c"], data=self.df.values)

    def test_explainer_16(self):
        # predict function for array
        explainer = explain(self.rf_model, variable_names=self.var_names, data=self.X[:10], y=self.y[:10])
        self.assertEqual(len(explainer.predict_fun(pd.DataFrame(self.X[:10]))), 10)

    def test_explainer_17(self):
        # predict function for dataframe
        boston_df = pd.DataFrame(self.X[:10])
        explainer = explain(self.rf_model, data=boston_df)
        self.assertEqual(len(explainer.predict_fun(boston_df)), 10)

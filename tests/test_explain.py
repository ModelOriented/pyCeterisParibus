import unittest
from unittest.mock import MagicMock

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

        cls.labels = list(boston['feature_names'])

        # model, data, labels, variable_names

    def test_explainer_1(self):
        model = MagicMock()
        delattr(model, 'predict')
        with self.assertRaises(ValueError) as c:
            explain(model, self.labels)

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

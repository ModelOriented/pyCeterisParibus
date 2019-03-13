"""
Tests for using the main function `individual_variable_profile`
"""
import os
import unittest

import pandas as pd
from keras.layers import Dense, Activation
from keras.models import Sequential
from keras.wrappers.scikit_learn import KerasRegressor
from sklearn import datasets, ensemble
from sklearn.compose import ColumnTransformer
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from ceteris_paribus.datasets import DATASETS_DIR
from ceteris_paribus.explainer import explain
from ceteris_paribus.profiles import CeterisParibus
from ceteris_paribus.profiles import individual_variable_profile
from ceteris_paribus.select_data import select_sample, select_neighbours


def random_forest_classifier(X_train, y_train, var_names):
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    return rf_model, X_train, y_train, var_names


class TestClassification(unittest.TestCase):

    def setUp(self):
        self.iris = load_iris()

        self.X = self.iris['data']
        self.y = self.iris['target']
        X_train, X_test, y_train, y_test = train_test_split(self.X, self.y, test_size=0.33, random_state=42)
        (model, data, labels, variable_names) = random_forest_classifier(X_train, y_train,
                                                                         list(self.iris['feature_names']))
        predict_function = lambda X: model.predict_proba(X)[::, 0]
        self.explainer_rf = explain(model, variable_names, data, labels, predict_function=predict_function,
                                    label="rf_model")

    def test_iris_classification_1(self):
        cp_profile = individual_variable_profile(self.explainer_rf, self.X[1], y=self.y[1])
        self.assertTrue(isinstance(cp_profile, CeterisParibus))
        self.assertIsNotNone(cp_profile.new_observation_true)
        self.assertEqual(len(cp_profile._predict_function(self.X[:3])), 3)

    def test_iris_classification_2(self):
        grid_points = 3
        feature = self.iris['feature_names'][0]
        cp_profile = individual_variable_profile(self.explainer_rf, self.X[:10], variables=[feature],
                                                 grid_points=grid_points)
        self.assertIn(feature, cp_profile.profile.columns)
        self.assertEqual(len(cp_profile.profile), 10 * grid_points)
        self.assertIsNone(cp_profile.new_observation_true)
        self.assertEqual(cp_profile.selected_variables, [feature])

    def test_iris_classification_3(self):
        feature = self.iris['feature_names'][0]
        grid_points = 5  # should be ignored
        num_points = 3
        cp_profile = individual_variable_profile(self.explainer_rf, self.X[:num_points], y=self.y[:num_points],
                                                 variables=[feature], grid_points=grid_points,
                                                 variable_splits={feature: [10, 31]})
        self.assertEqual(len(cp_profile.profile), num_points * 2)

    def test_iris_classification_4(self):
        X_data = pd.DataFrame(self.X[:20])
        cp_profile = individual_variable_profile(self.explainer_rf, X_data, y=self.y[:20])
        self.assertEqual(len(cp_profile.profile), len(self.iris['feature_names']) * 20 * cp_profile._grid_points)

    def test_iris_classification_5(self):
        feature = self.iris['feature_names'][0]
        X_data = pd.DataFrame(self.X[:20])
        y_data = pd.DataFrame(self.y)
        cp_profile = individual_variable_profile(self.explainer_rf, X_data, y_data, variables=[feature])
        self.assertEqual(len(cp_profile.profile), 20 * cp_profile._grid_points)
        self.assertLessEqual(max(cp_profile.profile['_yhat_']), 1)
        self.assertGreaterEqual(min(cp_profile.profile['_yhat_']), 0)

    def test_iris_classification_6(self):
        X_data = pd.DataFrame(self.X[5]).T
        cp_profile = individual_variable_profile(self.explainer_rf, X_data, self.y[5])
        self.assertEqual(len(cp_profile.profile), len(self.iris['feature_names']) * cp_profile._grid_points)

    def test_iris_classification_7(self):
        X_data = pd.DataFrame(self.X[5])
        with self.assertRaises(ValueError):
            cp_profile = individual_variable_profile(self.explainer_rf, X_data, self.y[5])


def random_forest_regression(X_train, y_train, var_names):
    # Create linear regression object
    rf_model = ensemble.RandomForestRegressor(n_estimators=100, random_state=42)

    # Train the model using the training set
    rf_model.fit(X_train, y_train)

    # model, data, labels, variable_names
    return rf_model, X_train, y_train, var_names


class TestRegression(unittest.TestCase):

    def setUp(self):
        boston = datasets.load_boston()

        X = boston['data']
        y = boston['target']

        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(X, y, test_size=0.33, random_state=42)

        (model, data, labels, self.variable_names) = random_forest_regression(self.X_train, self.y_train,
                                                                              list(boston['feature_names']))
        self.explainer_rf = explain(model, self.variable_names, data, labels, label="rf_model")

    def test_regression_1(self):
        cp_profile = individual_variable_profile(self.explainer_rf, self.X_train[0], y=self.y_train[0],
                                                 variables=['TAX', 'CRIM'])
        self.assertIsNotNone(cp_profile.new_observation_true)
        self.assertEqual(len(cp_profile.selected_variables), 2)
        self.assertEqual(len(cp_profile.profile), cp_profile._grid_points * 2)
        self.assertIn("TAX", cp_profile.profile.columns)

    def test_regression_2(self):
        n = 3
        sample = select_sample(self.X_train, n=n)
        cp2 = individual_variable_profile(self.explainer_rf, sample, variables=['TAX', 'CRIM'])
        self.assertEqual(len(cp2.profile), cp2._grid_points * 2 * n)

    def test_regression_3(self):
        variable_names = self.variable_names
        neighbours = select_neighbours(self.X_train, self.X_train[0], variable_names=variable_names,
                                       selected_variables=variable_names, n=15)
        cp3 = individual_variable_profile(self.explainer_rf, neighbours, variables=['LSTAT', 'RM'],
                                          variable_splits={'LSTAT': [10, 20, 30], 'RM': [4, 5, 6, 7]})
        self.assertEqual(cp3.selected_variables, ['LSTAT', 'RM'])
        # num of different values in splits
        self.assertEqual(len(cp3.profile), 15 * 7)


class TestKeras(unittest.TestCase):

    def setUp(self):
        boston = datasets.load_boston()
        x = boston.data
        y = boston.target
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)

        def network_architecture():
            model = Sequential()
            model.add(Dense(640, input_dim=x.shape[1]))
            model.add(Activation('tanh'))
            model.add(Dense(320))
            model.add(Activation('tanh'))
            model.add(Dense(1))
            model.compile(loss='mean_squared_error', optimizer='adam')
            return model

        def keras_model():
            estimators = [
                ('scaler', StandardScaler()),
                ('mlp', KerasRegressor(build_fn=network_architecture, epochs=20))
            ]
            model = Pipeline(estimators)
            model.fit(x_train, y_train)
            return model, x_train, y_train, boston.feature_names

        model, self.x_train, self.y_train, self.var_names = keras_model()
        self.explainer_keras = explain(model, self.var_names, self.x_train, self.y_train, label='KerasMLP')

    def test_keras_1(self):
        cp = individual_variable_profile(self.explainer_keras, self.x_train[:10], y=self.y_train[:10],
                                         variables=["CRIM", "ZN", "AGE", "INDUS", "B"])
        self.assertEqual(len(cp.new_observation_true), 10)
        self.assertEqual(len(cp.profile), cp._grid_points * 5 * 10)

    def test_keras_2(self):
        cp = individual_variable_profile(self.explainer_keras, pd.DataFrame(self.x_train[:10]),
                                         y=list(self.y_train[:10]),
                                         variables=["CRIM", "ZN", "AGE", "INDUS", "B"])
        self.assertEqual(len(cp.new_observation_true), 10)
        self.assertEqual(len(cp.profile), cp._grid_points * 5 * 10)

    def test_keras_3(self):
        cp = individual_variable_profile(self.explainer_keras, self.x_train[5], y=self.y_train[5],
                                         variables=["CRIM", "ZN", "AGE", "INDUS", "B"])
        self.assertEqual(len(cp.new_observation_true), 1)
        self.assertEqual(len(cp.profile), cp._grid_points * 5)


class TestCategorical(unittest.TestCase):
    def setUp(self):
        df = pd.read_csv(os.path.join(DATASETS_DIR, 'insurance.csv'))

        self.x = df.drop(['charges'], inplace=False, axis=1)

        self.y = df['charges']

        var_names = list(self.x)

        # We create the preprocessing pipelines for both numeric and categorical data.
        numeric_features = ['age', 'bmi', 'children']
        numeric_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())])

        categorical_features = ['sex', 'smoker', 'region']
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))])

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)])

        # Append classifier to preprocessing pipeline.
        # Now we have a full prediction pipeline.
        clf = Pipeline(steps=[('preprocessor', preprocessor),
                              ('classifier', RandomForestRegressor())])

        clf.fit(self.x, self.y)

        self.explainer_cat = explain(clf, var_names, self.x, self.y, label="categorical_model")

    def test_categorical_1(self):
        cp = individual_variable_profile(self.explainer_cat, self.x.iloc[:10], self.y.iloc[:10])
        self.assertEqual(len(cp.new_observation_true), 10)
        self.assertIn('female', list(cp.profile['sex']))
        self.assertIn('sex', list(cp.profile['_vname_']))

import os

import pandas as pd
from sklearn import ensemble, svm
from sklearn.linear_model import LinearRegression

from ceteris_paribus.datasets import DATASETS_DIR
from ceteris_paribus.explainer import explain
from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile
from ceteris_paribus.select_data import select_sample

df = pd.read_csv(os.path.join(DATASETS_DIR, 'insurance.csv'))

df = df[['age', 'bmi', 'children', 'charges']]

x = df.drop(['charges'], inplace=False, axis=1)
y = df['charges']
var_names = list(x.columns)
x = x.values
y = y.values


def linear_regression_model():
    # Create linear regression object
    linear_model = LinearRegression()

    # Train the model using the training set
    linear_model.fit(x, y)

    # model, data, labels, variable_names
    return linear_model, x, y, var_names


def gradient_boosting_model():
    gb_model = ensemble.GradientBoostingRegressor(n_estimators=1000, random_state=42)
    gb_model.fit(x, y)
    return gb_model, x, y, var_names


def supported_vector_machines_model():
    svm_model = svm.SVR(C=0.01, gamma='scale')
    svm_model.fit(x, y)
    return svm_model, x, y, var_names


if __name__ == "__main__":
    (linear_model, data, labels, variable_names) = linear_regression_model()
    (gb_model, _, _, _) = gradient_boosting_model()
    (svm_model, _, _, _) = supported_vector_machines_model()

    explainer_linear = explain(linear_model, variable_names, data, y)
    explainer_gb = explain(gb_model, variable_names, data, y)
    explainer_svm = explain(svm_model, variable_names, data, y)

    cp_profile = individual_variable_profile(explainer_linear, x[0], y[0])
    plot(cp_profile, show_residuals=True)

    sample_x, sample_y = select_sample(x, y, n=10)
    cp2 = individual_variable_profile(explainer_gb, sample_x, y=sample_y)

    cp3 = individual_variable_profile(explainer_gb, x[0], y[0])
    plot(cp3, show_residuals=True)

    plot(cp_profile, cp3, show_residuals=True)

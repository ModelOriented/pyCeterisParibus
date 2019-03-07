import os
import pandas as pd
from sklearn import ensemble, svm
from sklearn.datasets import load_iris
from sklearn.linear_model import LinearRegression

from ceteris_paribus.explainer import explain
from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile
from ceteris_paribus.select_data import select_neighbours
from ceteris_paribus.datasets import DATASETS_DIR

df = pd.read_csv(os.path.join(DATASETS_DIR, 'insurance.csv'))

df = df[['age', 'bmi', 'children', 'charges']]

x = df.drop(['charges'], inplace=False, axis=1)
y = df['charges']
var_names = list(x.columns)
x = x.values
y = y.values

iris = load_iris()


def random_forest_classifier():
    rf_model = ensemble.RandomForestClassifier(n_estimators=100, random_state=42)

    rf_model.fit(iris['data'], iris['target'])

    return rf_model, iris['data'], iris['target'], iris['feature_names']


def linear_regression_model():
    linear_model = LinearRegression()
    linear_model.fit(x, y)
    # model, data, labels, variable_names
    return linear_model, x, y, var_names


def gradient_boosting_model():
    gb_model = ensemble.GradientBoostingRegressor(n_estimators=1000, random_state=42)
    gb_model.fit(x, y)
    return gb_model, x, y, var_names


def supported_vector_machines_model():
    svm_model = svm.SVR(C=0.01, gamma='scale', kernel='poly')
    svm_model.fit(x, y)
    return svm_model, x, y, var_names


if __name__ == "__main__":

    (linear_model, data, labels, variable_names) = linear_regression_model()
    (gb_model, _, _, _) = gradient_boosting_model()
    (svm_model, _, _, _) = supported_vector_machines_model()

    explainer_linear = explain(linear_model, variable_names, data, y)
    explainer_gb = explain(gb_model, variable_names, data, y)
    explainer_svm = explain(svm_model, variable_names, data, y)

    # single profile
    cp_1 = individual_variable_profile(explainer_gb, x[0], y[0])
    plot(cp_1, destination="notebook", selected_variables=["bmi"], print_observations=False)

    # local fit
    neighbours_x, neighbours_y = select_neighbours(x, x[10], y=y, n=10)
    cp_2 = individual_variable_profile(explainer_gb,
            neighbours_x, neighbours_y)
    plot(cp_2, show_residuals=True, selected_variables=["age"], print_observations=False, color_residuals='red',
         plot_title='')

    # aggregate profiles
    plot(cp_2, aggregate_profiles="mean", selected_variables=["age"], color_pdps='black', size_pdps=6,
         alpha_pdps=0.7, print_observations=False,
         plot_title='')

    # many variables
    plot(cp_1, selected_variables=["bmi", "age", "children"], print_observations=False, plot_title='', width=950)

    # many models
    cp_svm = individual_variable_profile(explainer_svm, x[0], y[0])
    cp_linear = individual_variable_profile(explainer_linear, x[0], y[0])
    plot(cp_1, cp_svm, cp_linear, print_observations=False, plot_title='', width=1050)

    # color by feature
    plot(cp_2, color="bmi", print_observations=False, plot_title='', width=1050, selected_variables=["age"], size=3)

    # classification multiplot
    rf_model, iris_x, iris_y, iris_var_names = random_forest_classifier()

    explainer_rf1 = explain(rf_model, iris_var_names, iris_x, iris_y,
                           predict_function= lambda X: rf_model.predict_proba(X)[::, 0], label=iris.target_names[0])
    explainer_rf2 = explain(rf_model, iris_var_names, iris_x, iris_y,
                           predict_function= lambda X: rf_model.predict_proba(X)[::, 1], label=iris.target_names[1])
    explainer_rf3 = explain(rf_model, iris_var_names, iris_x, iris_y,
                           predict_function= lambda X: rf_model.predict_proba(X)[::, 2], label=iris.target_names[2])


    cp_rf1 = individual_variable_profile(explainer_rf1, iris_x[0], iris_y[0])
    cp_rf2 = individual_variable_profile(explainer_rf2, iris_x[0], iris_y[0])
    cp_rf3 = individual_variable_profile(explainer_rf3, iris_x[0], iris_y[0])

    plot(cp_rf1, cp_rf2, cp_rf3, selected_variables=['petal length (cm)', 'petal width (cm)', 'sepal length (cm)'],
         plot_title='', print_observations=False, width=1050)
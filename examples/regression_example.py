from sklearn import datasets, ensemble
from sklearn.model_selection import train_test_split

from ceteris_paribus.explainer import explain
from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile
from ceteris_paribus.select_data import select_sample, select_neighbours

boston = datasets.load_boston()

X = boston['data']
y = boston['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)


def random_forest_regression():
    # Create linear regression object
    rf_model = ensemble.RandomForestRegressor(n_estimators=100, random_state=42)

    # Train the model using the training set
    rf_model.fit(X_train, y_train)

    # model, data, labels, variable_names
    return rf_model, X_train, y_train, list(boston['feature_names'])


if __name__ == "__main__":
    (model, data, labels, variable_names) = random_forest_regression()
    explainer_rf = explain(model, variable_names, data, labels)

    cp_profile = individual_variable_profile(explainer_rf, X_train[0], y=y_train[0], variables=['TAX', 'CRIM'])
    plot(cp_profile)

    sample = select_sample(X_train, n=3)
    cp2 = individual_variable_profile(explainer_rf, sample, variables=['TAX', 'CRIM'])
    plot(cp2)

    neighbours = select_neighbours(X_train, X_train[0], variable_names=variable_names,
                                   selected_variables=variable_names, n=15)
    cp3 = individual_variable_profile(explainer_rf, neighbours, variables=['LSTAT', 'RM'],
                                      variable_splits={'LSTAT': [10, 20, 30], 'RM': [4, 5, 6, 7]})
    plot(cp3)

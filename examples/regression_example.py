from sklearn import datasets, ensemble
from sklearn.model_selection import train_test_split

from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile

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
    cp_profile = individual_variable_profile(model, data, variable_names, X_train[0], y=y_train[0],
                                             selected_variables=['TAX', 'CRIM'])
    plot(cp_profile, show_residuals=True)

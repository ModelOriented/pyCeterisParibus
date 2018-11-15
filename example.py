from sklearn import datasets, ensemble

from ceteris_paribus.plots import plot
from ceteris_paribus.profiles import individual_variable_profile

diabetes = datasets.load_diabetes()
diabetes_X = diabetes.data[:, :5]
diabetes_X_train = diabetes_X[:-20]
diabetes_X_test = diabetes_X[-20:]
# Split the targets into training/testing sets
diabetes_y_train = diabetes.target[:-20]
diabetes_y_test = diabetes.target[-20:]


def random_forest_regression():
    # Create linear regression object
    lr_model = ensemble.RandomForestRegressor(n_estimators=100)

    # Train the model using the training set
    lr_model.fit(diabetes_X_train, diabetes_y_train)

    # model, data, labels, variable_names
    return lr_model, diabetes_X_train, diabetes_y_train, ['col1', 'col2', 'col3', 'col4', 'col5']


if __name__ == "__main__":
    (model, data, labels, variable_names) = random_forest_regression()
    cp_profile = individual_variable_profile(model, data, variable_names, diabetes_X_test[1])
    plot(cp_profile)

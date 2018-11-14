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
    lr_model = ensemble.RandomForestRegressor()

    # Train the model using the training sets

    lr_model.fit(diabetes_X_train, diabetes_y_train)

    # data labels model names
    return diabetes_X_train, diabetes_y_train, lr_model, ['col1', 'col2', 'col3', 'col4', 'col5']


if __name__ == "__main__":
    (data, labels, model, names) = random_forest_regression()
    cp_profile = individual_variable_profile(model, data, names, diabetes_X_test[1])
    plot(cp_profile)

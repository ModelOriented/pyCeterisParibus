from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

from ceteris_paribus.explainer import explain
from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile

iris = load_iris()

X = iris['data']
y = iris['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

print(iris['feature_names'])

def random_forest_classifier():
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)

    rf_model.fit(X_train, y_train)

    return rf_model, X_train, y_train, iris['feature_names']


if __name__ == "__main__":
    (model, data, labels, variable_names) = random_forest_classifier()
    predict_function = lambda X: model.predict_proba(X)[::, 0]
    explainer_rf = explain(model, variable_names, data, labels, predict_function=predict_function)
    cp_profile = individual_variable_profile(explainer_rf, X[1], y=y[1])
    plot(cp_profile)

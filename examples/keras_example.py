from keras.layers import Dense, Activation
from keras.models import Sequential
from keras.wrappers.scikit_learn import KerasRegressor
from sklearn.datasets import load_boston
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ceteris_paribus.explainer import explain
from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile

boston = load_boston()
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
        ('mlp', KerasRegressor(build_fn=network_architecture, epochs=200))
    ]
    model = Pipeline(estimators)
    model.fit(x_train, y_train)
    return model, x_train, y_train, boston.feature_names


if __name__ == "__main__":
    model, x_train, y_train, var_names = keras_model()
    explainer_keras = explain(model, var_names, x_train, y_train, label='KerasMLP')
    cp = individual_variable_profile(explainer_keras, x_train[:10], y=y_train[:10],
                                     variables=["CRIM", "ZN", "AGE", "INDUS", "B"])
    plot(cp, show_residuals=True, selected_variables=["CRIM", "ZN", "AGE", "B"], show_observations=True,
         show_rugs=True)

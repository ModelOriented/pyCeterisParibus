from keras.layers import Dense, Activation
from keras.models import Sequential
from sklearn.datasets import load_boston
from sklearn.model_selection import train_test_split

from ceteris_paribus.explainer import explain
from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile

boston = load_boston()
x = boston.data
y = boston.target
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)


def keras_model():
    # TODO add scaling and put inside the pipeline
    model = Sequential()
    model.add(Dense(1024, input_dim=x.shape[1]))
    model.add(Activation('tanh'))
    model.add(Dense(32))
    model.add(Activation('tanh'))
    model.add(Dense(1))
    model.compile(loss='mean_squared_error', optimizer='adam')
    model.fit(x_train, y_train, epochs=200, validation_data=(x_test, y_test))
    return model, x_train, y_train, boston.feature_names


def _predict_fun(model, x):
    pred = model.predict(x)
    return pred.reshape((pred.shape[0],))


if __name__ == "__main__":
    model, x_train, y_train, var_names = keras_model()
    explainer_keras = explain(model, var_names, x_train, y_train, predict_function=lambda x: _predict_fun(model, x))
    cp = individual_variable_profile(explainer_keras, x_train[0], variables=["CRIM", "ZN", "AGE", "INDUS", "B"])
    plot(cp, show_residuals=True, selected_variables=["CRIM", "ZN", "AGE", "INDUS"], show_observations=True,
         show_rugs=True)

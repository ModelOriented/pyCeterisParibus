from sklearn import datasets, ensemble
from sklearn.model_selection import train_test_split

from ceteris_paribus.plots.plots import plot
from ceteris_paribus.profiles import individual_variable_profile
from ceteris_paribus.select_data import select_neighbours

""" Data preparation """
# Load Boston Housing Data
boston = datasets.load_boston()

X = boston['data']
y = boston['target']

variable_names = boston['feature_names']

# Split observations and corresponding labels into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

""" Training model """
# Create random forest object
rf_model = ensemble.RandomForestRegressor(n_estimators=100, random_state=42)

# Train the model using the training set
rf_model.fit(X_train, y_train)

""" Create Ceteris Paribus profile """
cp_profile = individual_variable_profile(rf_model, X_train, variable_names, X_train[0], y=y_train[0],
                                         selected_variables=['AGE', 'CRIM'])

""" Plot the profile """
plot(cp_profile, show_observations=True, show_residuals=True)

""" Print the profile """
cp_profile.print_profile()

""" Select sample observations """
observations1, labels1 = select_neighbours(X_train, X_train[0], y=y_train, n=10)

""" Create Ceteris Paribus profiles for multiple observations """
cp_profile_2 = individual_variable_profile(rf_model, X_train, variable_names, observations1, y=labels1,
                                           selected_variables=['AGE', 'CRIM'])

cp_profile_2.print_profile()

plot(cp_profile_2, show_observations=True, show_residuals=True)

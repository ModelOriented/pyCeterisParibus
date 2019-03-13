import os

import pandas as pd

from ceteris_paribus.datasets import DATASETS_DIR
from ceteris_paribus.plots.plots import plot

df = pd.read_csv(os.path.join(DATASETS_DIR, 'insurance.csv'))

x = df.drop(['charges'], inplace=False, axis=1)

y = df['charges']

var_names = list(x)

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor

# We create the preprocessing pipelines for both numeric and categorical data.
numeric_features = ['age', 'bmi', 'children']
numeric_transformer = Pipeline(steps=[
    ('scaler', StandardScaler())])

categorical_features = ['sex', 'smoker', 'region']
categorical_transformer = Pipeline(steps=[
    ('onehot', OneHotEncoder(handle_unknown='ignore'))])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)])

# Append classifier to preprocessing pipeline.
# Now we have a full prediction pipeline.
clf = Pipeline(steps=[('preprocessor', preprocessor),
                      ('classifier', RandomForestRegressor())])

clf.fit(x, y)

from ceteris_paribus.explainer import explain

explainer_cat = explain(clf, var_names, x, y, label="categorical_model")

from ceteris_paribus.profiles import individual_variable_profile

cp_cat = individual_variable_profile(explainer_cat, x.iloc[:10], y.iloc[:10])

cp_cat.print_profile()
plot(cp_cat)

plot(cp_cat, color="smoker")

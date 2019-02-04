
[![travis](https://travis-ci.org/ModelOriented/pyCeterisParibus.svg?branch=master)](https://travis-ci.org/ModelOriented/pyCeterisParibus)
[![codecov](https://codecov.io/gh/ModelOriented/pyCeterisParibus/branch/master/graph/badge.svg)](https://codecov.io/gh/ModelOriented/pyCeterisParibus)
[![Documentation Status](https://readthedocs.org/projects/pyceterisparibus/badge/?version=latest)](https://pyceterisparibus.readthedocs.io/en/latest/?badge=latest)

# pyCeterisParibus
Python library for Ceteris Paribus Plots

### Single variable response

```
from ceteris_paribus.profiles import individual_variable_profile
from ceteris_paribus.plots.plots import plot_d3

cp = individual_variable_profile(explainer_gb, x[0], y[0], variables={'bmi'})
plot(cp, show_residuals=True)
```
![Single Variable Plot](misc/single_variable_plot.png)


### Local fit

```
from ceteris_paribus.select_data import select_neighbours

neighbours_x, neighbours_y = select_neighbours(x, x[0], y=y, n=15)
cp_2 = individual_variable_profile(explainer_gb,
        neighbours_x, neighbours_y)
plot(cp_2, show_residuals=True, selected_variables=["bmi"])
```
![Local fit plot](misc/local_fit.png)


### Average response

```
plot(cp_2, aggregate_profiles="mean", selected_variables=["age"])
```
![Average response](misc/average_response.png)



### Many variables

```
plot(cp_1, selected_variables=["bmi", "age", "children"])
```
![Many variables](misc/many_variables.png)


### Many models
```
cp_svm = individual_variable_profile(explainer_svm, x[0], y[0])
cp_linear = individual_variable_profile(explainer_linear, x[0], y[0])
plot(cp_1, cp_svm, cp_linear)
```
![Many models](misc/many_models.png)

### Model interactions
```
plot(cp_2, color="bmi")
```
![Model interactions](misc/color_by_default.png)

## Setup
Works on Python 3.5+

In order to install the package execute:
```
pip install git+https://github.com/ModelOriented/pyCeterisParibus
```
or download the sources, enter the main directory and perform:
```
https://github.com/ModelOriented/pyCeterisParibus.git
cd pyCeterisParibus
python setup.py install   # (alternatively use pip install .)
```

## Docs
Latest documentation is hosted here: 

https://pyceterisparibus.readthedocs.io

To build the documentation locally:
```
cd docs
make html
```
and open `_build/html/index.html`
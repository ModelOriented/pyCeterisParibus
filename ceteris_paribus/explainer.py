import logging
import re
from collections import namedtuple

import numpy as np
import pandas as pd

Explainer = namedtuple("Explainer", "model var_names data y predict_fun label")


def explain(model, variable_names=None, data=None, y=None, predict_function=None, label=None):
    """
    This function creates a unified representation of a model, which can be further processed by various explainers

    :param model: a model to be explained
    :param variable_names: names of variables, if not supplied then derived from data
    :param data: data that was used for fitting
    :param y: labels for the data
    :param predict_function: function that takes the data and returns predictions
    :param label: label of the model, if not supplied the function will try to infer it from the model object, otherwise unset
    :return: Explainer object
    """
    if not predict_function:
        if hasattr(model, 'predict'):
            if isinstance(data, pd.core.frame.DataFrame):
                predict_function = model.predict
            else:
                predict_function = lambda df: model.predict(df.values)
        else:
            raise ValueError('Unable to find predict function')
    if not label:
        logging.warning("Model is unlabeled... \n You can add label using method set_label")
        label_items = re.split('\(', str(model))
        if label_items and len(label_items) > 1:
            label = label_items[0]
        else:
            label = 'unlabeled_model'
    if variable_names is None:
        if isinstance(data, pd.core.frame.DataFrame):
            variable_names = list(data)
        else:
            raise ValueError("Unable to impute the variable names. Those must be supplied directly!")

    if data is not None:
        if not isinstance(data, pd.core.frame.DataFrame):
            data = np.array(data)
            if data.ndim == 1:
                # make 1D array 2D
                data = data.reshape((1, -1))
            if len(variable_names) != data.shape[1]:
                raise ValueError("Incorrect number of variables given.")

            data = pd.DataFrame(data, columns=variable_names)

    if y is not None:
        if isinstance(y, pd.core.frame.DataFrame):
            y = pd.Series(y[0])
        else:
            y = pd.Series(y)

    explainer = Explainer(model, list(variable_names), data, y, predict_function, label)
    return explainer


import logging
import re
from collections import namedtuple

Explainer = namedtuple("Explainer", "model var_names data y predict_fun label")


def explain(model, variable_names, data=None, y=None, predict_function=None, label=None):
    """
    This function creates a unified representation of a model, which can be further processed by various explainers

    :param model: a model to be explained
    :param variable_names: names of variables
    :param data: data that was used for fitting
    :param y: labels for the data
    :param predict_function: function that takes the data and returns predictions
    :param label: label of the model, if not supplied the function will try to infer it from the model object, otherwise unset
    :return: Explainer object
    """
    if not predict_function:
        if hasattr(model, 'predict'):
            predict_function = model.predict
        else:
            raise ValueError('Unable to find predict function')
    if not label:
        logging.warning("Model is unlabeled... \n You can add label using method set_label")
        label_items = re.split('\(', str(model))
        if label_items and len(label_items) > 1:
            label = label_items[0]
        else:
            label = 'unlabeled_model'

    explainer = Explainer(model, list(variable_names), data, y, predict_function, label)
    return explainer

import logging
import re
from collections import namedtuple

Explainer = namedtuple("Explainer", "model var_names data y predict_fun link label")


def explain(model, variable_names, data=None, y=None, predict_function=None, link=None, label=None):
    if not predict_function:
        if hasattr(model, 'predict'):
            predict_function = model.predict
        else:
            raise ValueError('Unable to find predict function')
    if not label:
        if hasattr(model, '__str__'):
            label = re.split('\(', model.__str__())[0]
        else:
            logging.warning("Model is unlabeled... \n You can add label using method set_label")
            label = 'unlabeled_model'

    explainer = Explainer(model, variable_names, data, y, predict_function, link, label)
    return explainer

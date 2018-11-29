from matplotlib import pyplot as plt


def _make_single_plot(subplot, data, var_name, new_observation, y_predicted, y_true,
                      show_profiles=True, show_observations=True, show_residuals=False):
    profiles = data.groupby('_ids_')
    if show_profiles:
        for _, profile in profiles:
            subplot.plot(profile[var_name], profile['_yhat_'], '-b')
    if show_observations:
        for a, b in zip(new_observation, y_predicted):
            subplot.plot(a, b, '-bo')
    if show_residuals:
        for a, b, c in zip(new_observation, y_predicted, y_true):
            subplot.plot(a, c, '-ro')
            subplot.plot([a, a], [b, c], '-', color='black')

    subplot.set_title(var_name)


def plot(cp_profile, show_profiles=True, show_observations=True, show_residuals=False, selected_variables=None):
    profiles_dict = cp_profile.split_by("_vname_")
    xs = cp_profile.new_observation_values.T
    ys = cp_profile.new_observation_predictions
    n_profiles = len(profiles_dict)
    f, axarr = plt.subplots(n_profiles, sharey=True)

    for i, ((var_name, df), x) in enumerate(zip(profiles_dict.items(), xs)):
        _make_single_plot(axarr[i], df, var_name, x, ys, cp_profile.new_observation_true, show_profiles,
                          show_observations, show_residuals)
    plt.show()


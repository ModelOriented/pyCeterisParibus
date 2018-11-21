from matplotlib import pyplot as plt


def plot(cp_profile, show_profiles=True, show_observations=True, show_residuals=False, selected_variables=None):
    profiles = cp_profile.profiles_list
    xs = cp_profile.new_observation_values
    ys = cp_profile.new_observation_predictions
    n_profiles = len(profiles)

    f, axarr = plt.subplots(n_profiles, sharey=True)
    for i, (df, x, y) in enumerate(zip(profiles, xs, ys)):
        var_name = df['_vname_'][0]
        if show_profiles:
            axarr[i].plot(df[var_name], df['_yhat_'], '-b')
        if show_observations:
            axarr[i].plot(x, y, '-bo')
        if show_residuals:
            if not cp_profile.new_observation_true:
                raise ValueError('True value for the new observation is not supplied')
            axarr[i].plot(x, cp_profile.new_observation_true, '-ro')
            axarr[i].plot([x, x], [y, cp_profile.new_observation_true], '-', color='black')

        axarr[i].set_title(var_name)
    plt.show()

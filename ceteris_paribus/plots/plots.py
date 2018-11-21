from matplotlib import pyplot as plt


def plot(cp_profile):
    profiles = cp_profile.profiles_list
    xs = cp_profile.new_observation_values
    ys = cp_profile.new_observation_predictions
    n_profiles = len(profiles)

    f, axarr = plt.subplots(n_profiles, sharey=True)
    for i, (df, x, y) in enumerate(zip(profiles, xs, ys)):
        var_name = df['_vname_'][0]
        axarr[i].plot(df[var_name], df['_yhat_'], '-b')
        axarr[i].plot(x, y, '-bo')
        axarr[i].set_title(var_name)
    plt.show()

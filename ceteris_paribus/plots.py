from matplotlib import pyplot as plt


def plot(cp_profile):
    f, axarr = plt.subplots(len(cp_profile[0]), sharey=True)
    profiles, xs, ys = cp_profile
    for i, (df, x, y) in enumerate(zip(profiles, xs, ys)):
        var_name = df['_var_'][0]
        axarr[i].plot(df[var_name], df['_yhat_'], '-b')
        axarr[i].plot(x, y, '-bo')
        axarr[i].set_title(var_name)
    plt.show()

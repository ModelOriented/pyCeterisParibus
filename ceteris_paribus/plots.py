from matplotlib import pyplot as plt


def plot(cp_profile):
    f, axarr = plt.subplots(len(cp_profile))
    for i, df in enumerate(cp_profile):
        var_name = df['_var_'][0]
        axarr[i].plot(df[var_name], df['_yhat_'], '-bo')
        axarr[i].set_title(var_name)
    plt.show()

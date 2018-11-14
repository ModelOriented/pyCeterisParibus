from matplotlib import pyplot as plt


def plot(cp_profile):
    f, axarr = plt.subplots(len(cp_profile))
    for i, (X, y, var) in enumerate(cp_profile):
        axarr[i].plot(X, y, '-bo')
        axarr[i].set_title(var)
    plt.show()

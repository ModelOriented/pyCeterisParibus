# build and publish to
# https://pypi.org/project/pyCeterisParibus/
rm -r dist/
python setup.py sdist bdist_wheel
python -m twine upload dist/*

# Requirements
- Python 3.10
- Poetry

# Installation
```bash
# if you already have venv preppared you can use it with
poetry  env use <path to python in venv>

poetry install
```

# Running

All filepaths are rooted in `resources` directory.
Generated data will be put in `generated_data` directory in a subdir named with timestamp.

Functionalities:

* Generating users: create n random users and save the data in a json file

```bash
poetry run generate_users {user_count}
```
* Extending users: if new fields were added to user data generation, but you don't want to change already existing data, old users can be extended with new fields from the new users

```bash
poetry run extend_users {old_users_file} {new_users_file}
```

* Generating easytrade data: generate trading data for initializing easytrade db over the period of n days back up until now

```bash
# to generate data for already existing users
poetry run generate_easytrade_data {days} --users-file={users_file}

# to generate data with new users
poetry run generate_easytrade_data {days} --users-count={users_count}
```
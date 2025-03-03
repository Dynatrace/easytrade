from argparse import ArgumentParser
from dataclasses import asdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from faker import Faker
from rich import print, print_json
from user_generator.accounts import Account, AccountFactory
from user_generator.action_generator import ActionGenerator
from user_generator.balance import BalanceEntry, BalanceHistory
from user_generator.constants import (
    COUNTRIES_WHITELIST,
    GENERATED_DATA_DIR,
    RESOURCES_DIR,
    InstrumentCode,
)
from user_generator.instruments import (
    InstrumentFactory,
    OwnedInstrument,
    OwnedInstrumentFactory,
)
from user_generator.timeframe import Timeframe, TimePeriod
from user_generator.trades import TradeEntry, TradeHistory, TradeManager
from user_generator.user import Country, User, UserFactory
from user_generator.utils import (
    deserialize_data,
    load_json_file,
    save_json_file,
    sha256_string,
    timestamp_dir_name,
    save_sql_file
)


def get_owned_instruments(accounts: list[Account]) -> list[OwnedInstrument]:
    return [
        instrument
        for account in accounts
        for instrument in account.owned_instruments.values()
    ]


def get_users_from_file(
    filename: str = "users.json", *, base_dir: Path = RESOURCES_DIR
) -> list[User]:
    """Get users data from file, resources dir is used as a base dir."""
    file = base_dir.joinpath(filename)
    return [deserialize_data(User, user) for user in load_json_file(file)]


def get_accounts(
    factory: AccountFactory, users: list[User], timestamp: datetime
) -> list[Account]:
    return [factory.create_account_for_user(user, timestamp) for user in users]


def save_data(
    users: list[User],
    accounts: list[Account],
    balance_history: list[BalanceEntry],
    trades: list[TradeEntry],
    *,
    base_dir: Path = GENERATED_DATA_DIR
) -> None:
    save_dir_path = base_dir.joinpath(timestamp_dir_name())

    save_sql_file([account.to_json(sha256_string) for account in accounts], 
                    save_dir_path.joinpath("sql-accounts.sql"), 
                    RESOURCES_DIR.joinpath("sql/accounts-create.sql"),
                    RESOURCES_DIR.joinpath("sql/accounts-insert.sql"), skip_id=True)
    
    save_sql_file([account.balance.to_json() for account in accounts], 
                    save_dir_path.joinpath("sql-balance.sql"), 
                    RESOURCES_DIR.joinpath("sql/balance-create.sql"),
                    RESOURCES_DIR.joinpath("sql/balance-insert.sql"))
    
    save_sql_file([balance_entry for balance_entry in balance_history], 
                save_dir_path.joinpath("sql-balancehistory.sql"), 
                RESOURCES_DIR.joinpath("sql/balancehistory-create.sql"),
                RESOURCES_DIR.joinpath("sql/balancehistory-insert.sql"), skip_id=True)
    
    save_sql_file([instrument.to_json() for instrument in get_owned_instruments(accounts)], 
                save_dir_path.joinpath("sql-ownedinstruments.sql"), 
                RESOURCES_DIR.joinpath("sql/ownedinstruments-create.sql"),
                RESOURCES_DIR.joinpath("sql/ownedinstruments-insert.sql"), skip_id=True)
    
    save_sql_file([trade for trade in trades], 
                save_dir_path.joinpath("sql-trades.sql"), 
                RESOURCES_DIR.joinpath("sql/trades-create.sql"),
                RESOURCES_DIR.joinpath("sql/trades-insert.sql"), skip_id=True)


def combine_users(old_users_path: Path, new_users_path: Path) -> list[dict[str, Any]]:
    old_users: list[dict[str, Any]] = load_json_file(old_users_path)
    new_users: list[dict[str, Any]] = load_json_file(new_users_path)
    return [
        {**new_user, **old_user} for old_user, new_user in zip(old_users, new_users)
    ]


def get_countries_data(file_path: Path) -> dict[str, Country]:
    """Get countries data from json file convert it to objects and return it."""
    json_data: dict[str, Any] = load_json_file(file_path)
    return {name: Country.from_json(data) for name, data in json_data.items()}


def generate_users(
    user_count: int, countries_filename: str, countries_whitelist: list[str]
) -> list[User]:
    countries = get_countries_data(RESOURCES_DIR.joinpath(countries_filename))
    faker = Faker([countries[country].locale for country in countries_whitelist])
    factory = UserFactory(faker, countries)
    return factory.create_users(user_count, countries_whitelist)


def entrypoint_generate_users():
    """Poetry entrypoint for generating user data"""
    parser = ArgumentParser()
    parser.add_argument("user_count", type=int)
    args = vars(parser.parse_args())

    users = generate_users(args["user_count"], "countries.json", COUNTRIES_WHITELIST)

    users_file = GENERATED_DATA_DIR.joinpath(timestamp_dir_name(), "users.json")
    save_json_file(users_file, [asdict(user) for user in users])


def entrypoint_generate_easy_trade_data():
    """Poetry entrypoint for generating EasyTrade data"""
    parser = ArgumentParser()
    parser.add_argument("days", type=int)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--users-file", type=str)
    group.add_argument("--users-count", type=int)
    args = vars(parser.parse_args())

    users: list[User] = (
        get_users_from_file(args["users_file"])
        if args["users_file"] is not None
        else generate_users(args["users_count"], "countries.json", COUNTRIES_WHITELIST)
    )

    faker = Faker()
    timeframe = Timeframe(faker)
    instrument_factory = InstrumentFactory(timeframe)

    instruments = [
        instrument_factory.create_instrument(code) for code in InstrumentCode
    ]

    owned_instrument_factory = OwnedInstrumentFactory(instruments)
    balance_history = BalanceHistory()
    trade_history = TradeHistory()
    trade_manager = TradeManager(trade_history)
    account_factory = AccountFactory(balance_history, owned_instrument_factory)

    period = TimePeriod.from_period(
        timedelta(days=args["days"]), timeframe.get_day_start(datetime.today())
    )
    accounts = [
        account_factory.create_account_for_user(user, period.start) for user in users
    ]

    action_generator = ActionGenerator(
        timeframe,
        trade_manager,
        {instrument.data.code: instrument for instrument in instruments},
    )

    for account in accounts:
        if account.id > 5 :
            action_generator.make_history(account, period)

    save_data(
        users,
        accounts,
        balance_history.to_json(),
        trade_history.to_json(),
    )


def entrypoint_extend_users():
    """Poetry entrypoint for extending user data with newly generated fields"""
    parser = ArgumentParser()
    parser.add_argument("base_users", type=str)
    parser.add_argument("extending_users", type=str)
    args = vars(parser.parse_args())

    extended_users = combine_users(
        RESOURCES_DIR.joinpath(args["base_users"]),
        RESOURCES_DIR.joinpath(args["extending_users"]),
    )

    users_file = GENERATED_DATA_DIR.joinpath(timestamp_dir_name(), "users.json")
    save_json_file(users_file, extended_users)


def entrypoint_make_simple_passwords():
    """Poetry entrypoint to change user passwords to simple ones"""
    parser = ArgumentParser()
    parser.add_argument("base_users", type=str)
    args = vars(parser.parse_args())

    users: list[dict[str, Any]] = load_json_file(
        RESOURCES_DIR.joinpath(args["base_users"])
    )
    new_users = [
        {**user, "password": UserFactory.create_simple_password(user["first_name"])}
        for user in users
    ]

    new_users_file = GENERATED_DATA_DIR.joinpath(timestamp_dir_name(), "users.json")
    save_json_file(new_users_file, new_users)


def entrypoint_update_password_hash():
    """Poetry entrypoint to update user password hashes"""

    parser = ArgumentParser()
    parser.add_argument("base_users", type=str)
    parser.add_argument("account_data", type=str)
    args = vars(parser.parse_args())

    users: list[dict[str, Any]] = load_json_file(
        RESOURCES_DIR.joinpath(args["base_users"])
    )
    account_data: list[dict[str, Any]] = load_json_file(
        RESOURCES_DIR.joinpath(args["account_data"])
    )

    new_account_data = [
        {**account, "hashed_password": sha256_string(user["password"])}
        for account, user in zip(account_data, users)
    ]

    new_accounts_file = GENERATED_DATA_DIR.joinpath(
        timestamp_dir_name(), "accounts.json"
    )
    save_json_file(new_accounts_file, new_account_data)


def main():
    print(
        "Directly running the script is not supported yet, please use Poetry scripts."
    )


if __name__ == "__main__":
    main()

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable
from user_generator.balance import Balance, BalanceHistory
from user_generator.constants import STARTING_INDEX, ActionType, InstrumentCode
from user_generator.instruments import (
    OwnedInstrument,
    OwnedInstrumentFactory,
)

from user_generator.user import Country, User, UserFactory


@dataclass
class Account:
    """Class that hold information about user account"""

    id: int
    user_data: User
    balance: Balance
    owned_instruments: dict[InstrumentCode, OwnedInstrument]

    def to_json(self, hash_function: Callable[[str], str]) -> dict[str, Any]:
        """Returns the dictionary representation of account"""
        return {
            "id": self.id,
            "package_id": self.user_data.package_id,
            "first_name": self.user_data.first_name,
            "last_name": self.user_data.last_name,
            "username": self.user_data.username,
            "email": self.user_data.email,
            "hashed_password": hash_function(self.user_data.password),
            "origin": self.user_data.origin,
            "creation_date": self.user_data.creation_date,
            "package_activation_date": self.user_data.package_activation_date,
            "account_active": 1 if self.user_data.account_active else 0,
            "address": self.user_data.address
        }

    def can_sell(self, code: InstrumentCode, quantity: float) -> bool:
        """Returns true if account can sell given quantity of instrument"""
        instrument = self.get_instrument(code)
        return instrument.quantity >= quantity

    def can_buy(self, price: float) -> bool:
        """Return true if account can afford the price"""
        return self.balance.value >= price

    def get_instrument(self, code: InstrumentCode) -> OwnedInstrument:
        try:
            return self.owned_instruments[code]
        except KeyError as e:
            raise ValueError(f"Unknown instrument with code {code}") from e
        
    def get_balance(self) -> Balance:
        return self.balance

    def modify_instrument(
        self, code: InstrumentCode, quantity: float, timestamp: datetime
    ) -> None:
        """Modify quantity of owned instrument"""
        instrument = self.get_instrument(code)
        instrument.modify(quantity, timestamp)

    def buy_instrument(
        self, code: InstrumentCode, quantity: float, price: float, timestamp: datetime
    ) -> bool:
        if not self.can_buy(price):
            return False
        self.balance.remove_funds(ActionType.BUY, price, timestamp)
        self.modify_instrument(code, quantity, timestamp)
        return True

    def sell_instrument(
        self, code: InstrumentCode, quantity: float, price: float, timestamp: datetime
    ) -> bool:
        if not self.can_sell(code, quantity):
            return False
        self.modify_instrument(code, -quantity, timestamp)
        self.balance.add_funds(ActionType.SELL, price, timestamp)
        return True

    def deposit_funds(self, amount: float, timestamp: datetime) -> None:
        """Proxy for depositing funds into accounts balance"""
        self.balance.action(ActionType.DEPOSIT, amount, timestamp)

    def withdraw_funds(self, amount: float, timestamp: datetime) -> None:
        """Proxy for withdrawing funds from accounts balance"""
        self.balance.action(ActionType.WITHDRAW, amount, timestamp)

    def get_instruments_by_quantity(self) -> list[InstrumentCode]:
        return [
            code
            for code, _ in sorted(
                self.owned_instruments.items(), key=lambda x: x[1].quantity
            )
        ]


@dataclass
class AccountFactory:
    balance_history: BalanceHistory
    instrument_factory: OwnedInstrumentFactory
    account_id: int = field(init=False, default=STARTING_INDEX)

    def get_account_id(self) -> int:
        """Get id for new account"""
        account_id = self.account_id
        self.account_id += 1
        return account_id

    def create_account_for_user(self, user_data: User, timestamp: datetime) -> Account:
        """Creates account for user data"""
        account_id = self.get_account_id()
        balance = Balance(account_id, self.balance_history)
        owned_instruments = self.instrument_factory.create_owned_instruments(
            account_id, timestamp
        )
        return Account(account_id, user_data, balance, owned_instruments)

    def create_account(
        self, user_factory: UserFactory, timestamp: datetime, country: Country
    ) -> Account:
        """Creates user data and account"""
        user_data = user_factory.create_user(country)
        return self.create_account_for_user(user_data, timestamp)

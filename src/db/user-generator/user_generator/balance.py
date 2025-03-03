from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable
from user_generator.constants import (
    MIN_DEPOSIT_VALUE,
    MIN_WITHDRAW_VALUE,
    STARTING_INDEX,
    ActionType,
)


@dataclass(slots=True)
class BalanceEntry:
    id: int
    account_id: int
    old_value: float
    value_change: float
    action_type: ActionType
    action_date: datetime

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "account_id": self.account_id,
            "old_value": self.old_value,
            "value_change": self.value_change,
            "action_type": str(self.action_type),
            "action_date": str(self.action_date),
        }


@dataclass
class BalanceHistory:
    entry_id: int = field(init=False, default=STARTING_INDEX)
    entries: list[BalanceEntry] = field(init=False, default_factory=list)

    def to_json(self) -> list[Any]:
        return [entry.to_json() for entry in self.entries]

    def get_entry_id(self) -> int:
        entry_id = self.entry_id
        self.entry_id += 1
        return entry_id

    def new_entry(
        self,
        account_id: int,
        old_value: float,
        value_change: float,
        action_type: ActionType,
        action_date: datetime,
    ) -> None:
        self.entries.append(
            BalanceEntry(
                self.get_entry_id(),
                account_id,
                old_value,
                value_change,
                action_type,
                action_date,
            )
        )


@dataclass
class Balance:
    account_id: int
    value: float = field(init=False, default=0)
    history: BalanceHistory = field(default_factory=BalanceHistory())

    def action(self, action: ActionType, amount: float, timestamp: datetime) -> bool:
        """Changes balance according to action given"""
        action_mapping: dict[
            ActionType, Callable[[ActionType, float, datetime], bool]
        ] = {
            ActionType.WITHDRAW: self.remove_funds,
            ActionType.DEPOSIT: self.add_funds,
            ActionType.BUY: self.remove_funds,
            ActionType.SELL: self.add_funds,
            ActionType.TRANSACTIONFEE: self.remove_funds
        }

        try:
            return action_mapping[action](action, amount, timestamp)
        except KeyError as e:
            raise ValueError(f"Unknown action {str(action)}") from e

    def remove_funds(
        self, action: ActionType, amount: float, timestamp: datetime
    ) -> bool:
        """Remove specified amount of funds from balance, to perform action"""
        if amount <= MIN_WITHDRAW_VALUE:
            return False
        if amount > self.value:
            return False

        self.history.new_entry(self.account_id, self.value, -amount, action, timestamp)
        self.value -= amount
        return True

    def add_funds(self, action: ActionType, amount: float, timestamp: datetime) -> bool:
        """Add specified amount of funds to balance, to perform action"""
        if amount < MIN_DEPOSIT_VALUE:
            return False

        self.history.new_entry(self.account_id, self.value, amount, action, timestamp)
        self.value += amount
        return True
    
    def to_json(self) -> dict[str, Any]:
        """Returns the dictionary representaion of balance"""
        return {
            "account_id": self.account_id,
            "balance": self.value
        }
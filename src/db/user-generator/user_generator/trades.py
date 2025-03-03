from dataclasses import dataclass, field
from datetime import datetime, timedelta
from random import random
from typing import Any
from user_generator.accounts import Account

from user_generator.constants import (
    STARTING_INDEX,
    TRADE_SUCCESS_CHANCE,
    ActionType,
)
from user_generator.instruments import Instrument


@dataclass
class TradeEntry:
    id: int
    account_id: int
    instrument_id: int
    action_type: ActionType
    quantity: float
    price: float
    timestamp_open: datetime
    timestamp_close: datetime
    trade_ended: bool
    trade_successful: bool
    status: str

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "account_id": self.account_id,
            "instrument_id": self.instrument_id,
            "action_type": str(self.action_type),
            "quantity": self.quantity,
            "price": self.price,
            "timestamp_open": str(self.timestamp_open),
            "timestamp_close": str(self.timestamp_close),
            "trade_ended": 1 if self.trade_ended else 0,
            "trade_successful": 1 if self.trade_successful else 0,
            "status": self.status
        }


@dataclass
class TradeHistory:
    entry_id: int = field(init=False, default=STARTING_INDEX)
    entries: list[TradeEntry] = field(init=False, default_factory=list)

    def to_json(self) -> list[Any]:
        return [entry.to_json() for entry in self.entries]

    def get_entry_id(self) -> int:
        entry_id = self.entry_id
        self.entry_id += 1
        return entry_id

    def new_entry(
        self,
        account_id: int,
        instrument_id: int,
        action_type: ActionType,
        quantity: float,
        price: float,
        timestamp_open: datetime,
        timestamp_close: datetime,
        trade_ended: bool,
        trade_successful: bool,
        status: str,
    ) -> None:
        self.entries.append(
            TradeEntry(
                self.get_entry_id(),
                account_id,
                instrument_id,
                action_type,
                quantity,
                price,
                timestamp_open,
                timestamp_close,
                trade_ended,
                trade_successful,
                status,
            )
        )


@dataclass
class TradeManager:
    history: TradeHistory

    def get_trade_success(self, chance: float) -> bool:
        return random() <= chance

    def trade(
        self,
        action: ActionType,
        account: Account,
        instrument: Instrument,
        quantity: float,
        timestamp: datetime,
        duration: timedelta,
    ) -> None:
        unit_price = instrument.get_value(timestamp)
        price = quantity * unit_price
        instrument_code = instrument.data.code
        trade_success = self.get_trade_success(TRADE_SUCCESS_CHANCE)
        status = "Transaction completed successfully" if trade_success else "Transaction did not succeed"

        if trade_success:
            transactions = {
                ActionType.BUY: account.buy_instrument,
                ActionType.SELL: account.sell_instrument,
            }

            try:
                result = transactions[action](
                    instrument_code, quantity, price, timestamp
                )
                if not result:
                    return
            except KeyError as e:
                raise ValueError(f"Unknown action {str(action)}") from e

        self.history.new_entry(
            account.id,
            instrument.id,
            action,
            quantity,
            unit_price,
            timestamp,
            timestamp + duration,
            True,
            trade_success,
            status,
        )

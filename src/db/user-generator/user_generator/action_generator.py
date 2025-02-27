from dataclasses import dataclass
from datetime import datetime, timedelta
from math import floor
from random import randint

from user_generator.accounts import Account
from user_generator.constants import (
    BALANCE_WITHDRAW_RATIO,
    DESIRED_STOCK_QUANTITY,
    HIGH_BALANCE_THRESHOLD,
    LOW_BALANCE_THRESHOLD,
    MAX_BALANCE_VALUE,
    MAX_DAILY_ACTIONS,
    MAX_STOCK_BUY_RATIO,
    MAX_STOCK_SELL_RATIO,
    MIN_BALANCE_VALUE,
    MIN_DAILY_ACTIONS,
    MIN_STOCK_BUY_RATIO,
    MIN_STOCK_SELL_RATIO,
    ActionType,
    InstrumentCode,
)
from user_generator.instruments import Instrument
from user_generator.timeframe import TimePeriod, Timeframe
from user_generator.trades import TradeManager
from user_generator.utils import random_between


class Actions:
    @staticmethod
    def low_balance_action(
        account: Account, timestamp: datetime, balance_reference: float
    ) -> None:
        account.deposit_funds(balance_reference - account.balance.value, timestamp)

    @staticmethod
    def high_balance_action(
        account: Account, timestamp: datetime, balance_reference: float
    ) -> None:
        account.withdraw_funds(
            BALANCE_WITHDRAW_RATIO * account.balance.value, timestamp
        )

    @staticmethod
    def low_insturment_quantity_action(
        account: Account,
        instrument: Instrument,
        trade_manager: TradeManager,
        timestamp: datetime,
    ) -> None:
        buy_credit = account.balance.value * random_between(
            MIN_STOCK_BUY_RATIO, MAX_STOCK_BUY_RATIO
        )
        buy_quantity = floor(buy_credit / instrument.get_value(timestamp))
        trade_manager.trade(
            ActionType.BUY,
            account,
            instrument,
            buy_quantity,
            timestamp,
            timedelta(),
        )

    @staticmethod
    def high_instrument_quantity_action(
        account: Account,
        instrument: Instrument,
        owned_quantity: float,
        trade_manager: TradeManager,
        timestamp: datetime,
    ) -> None:
        sell_quantity = floor(
            owned_quantity * random_between(MIN_STOCK_SELL_RATIO, MAX_STOCK_SELL_RATIO)
        )
        trade_manager.trade(
            ActionType.SELL,
            account,
            instrument,
            sell_quantity,
            timestamp,
            timedelta(),
        )


@dataclass
class ActionGenerator:
    timeframe: Timeframe
    trade_manager: TradeManager
    instruments: dict[InstrumentCode, Instrument]

    def create_daily_periods(self, period: TimePeriod) -> list[TimePeriod]:
        """Divide the entire period into list of days"""
        return period.slice_with_interval(timedelta(days=1))

    def create_daily_action_timestamps(
        self, period: TimePeriod, actions: int
    ) -> list[datetime]:
        """Return a list of timestamps for each action over the period"""
        return self.timeframe.get_datetime_series(period, actions)

    def create_action_timestamps(
        self, period: TimePeriod, daily_actions: int
    ) -> list[datetime]:
        """Return a list of action timestamps over the entire period"""
        return [
            timestamp
            for day in self.create_daily_periods(period)
            for timestamp in self.create_daily_action_timestamps(day, daily_actions)
        ]

    def generate_action(
        self, account: Account, timestamp: datetime, balance_reference: float
    ) -> None:
        """Generate apropriate action following behaviour based on the reference balance value"""
        if account.balance.value < LOW_BALANCE_THRESHOLD * balance_reference:
            Actions.low_balance_action(account, timestamp, balance_reference)
            return
        if account.balance.value > HIGH_BALANCE_THRESHOLD * balance_reference:
            Actions.high_balance_action(account, timestamp, balance_reference)
            return

        instrument_code = account.get_instruments_by_quantity()[0]
        instrument = self.instruments[instrument_code]
        owned_instrument = account.get_instrument(instrument_code)

        if owned_instrument.quantity < DESIRED_STOCK_QUANTITY:
            Actions.low_insturment_quantity_action(
                account, instrument, self.trade_manager, timestamp
            )
            return
        if owned_instrument.quantity > DESIRED_STOCK_QUANTITY:
            Actions.high_instrument_quantity_action(
                account,
                instrument,
                owned_instrument.quantity,
                self.trade_manager,
                timestamp,
            )
            return

    def make_history(self, account: Account, period: TimePeriod) -> None:
        """Create a trade / balance history for an account over given period of time"""
        balance_reference = random_between(MIN_BALANCE_VALUE, MAX_BALANCE_VALUE)
        daily_actions = randint(MIN_DAILY_ACTIONS, MAX_DAILY_ACTIONS)
        action_timestamps = self.create_action_timestamps(period, daily_actions)
        for timestamp in action_timestamps:
            self.generate_action(account, timestamp, balance_reference)

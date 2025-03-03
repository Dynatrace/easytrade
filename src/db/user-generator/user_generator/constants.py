from enum import Enum
from pathlib import Path


MIN_BALANCE_VALUE: float = 10000
MAX_BALANCE_VALUE: float = 100000

MIN_WITHDRAW_VALUE: float = 0
MIN_DEPOSIT_VALUE: float = 0

USER_PASSWORD_LENGTH: int = 50

STARTING_INDEX: int = 1

HIGH_BALANCE_THRESHOLD: float = 2
LOW_BALANCE_THRESHOLD: float = 0.3
BALANCE_WITHDRAW_RATIO: float = 0.5

DESIRED_STOCK_QUANTITY: float = 500
MIN_STOCK_BUY_RATIO: float = 0.3
MAX_STOCK_BUY_RATIO: float = 0.7
MIN_STOCK_SELL_RATIO: float = 0.3
MAX_STOCK_SELL_RATIO: float = 0.6

MIN_DAILY_ACTIONS: int = 3
MAX_DAILY_ACTIONS: int = 7

TRADE_SUCCESS_CHANCE: float = 0.9

RESOURCES_DIR: Path = Path(__file__).parent.resolve().joinpath("resources")
GENERATED_DATA_DIR: Path = Path(__file__).parent.resolve().joinpath("generated_data")

COUNTRIES_WHITELIST: list[str] = [
    "United States",
    "United Kingdom",
    "Poland",
    "Germany",
]

CREDIT_CARD_TYPES: dict[str, str] = {
    "americanExpress": "amex",
    "mastercard": "mastercard",
    "visaCredit": "visa",
    "visaDebit": "visa",
}

SQL_INSERT_LIMIT = 1000

class ActionType(str, Enum):
    WITHDRAW = "withdraw"
    DEPOSIT = "deposit"
    BUY = "buy"
    SELL = "sell"
    TRANSACTIONFEE = "transactionfee"

    def __str__(self) -> str:
        return self._value_


class InstrumentCode(str, Enum):
    EASYTRAVEL = "ETRAVE"
    EASYPLANES = "EPLANE"
    EASYHOTELS = "EHOTEL"
    JANGRP = "JANGRP"
    CORFIG = "CORFIG"
    CMRTIN = "CMRTIN"
    CHAMAT = "CHAMAT"
    BLSTCR = "BLSTCR"
    CAFGAL = "CAFGAL"
    DECGRP = "DECGRP"
    PETBAN = "PETBAN"
    BATBAT = "BATBAT"
    STOLLC = "STOLLC"
    LEBRGA = "LEBRGA"
    MOROBA = "MOROBA"

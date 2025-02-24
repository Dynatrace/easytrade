from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Callable
from scipy.interpolate import interp1d
from numpy import ndarray
from user_generator.timeframe import Timeframe
from user_generator.constants import STARTING_INDEX, InstrumentCode

minutes = [n * 60 for n in (0, 3, 6, 9, 12, 15, 18, 21, 24)]


@dataclass
class InstrumentData:
    code: InstrumentCode
    name: str
    daily_stock_values: list[float]


INSTRUMENT_DATA: dict[InstrumentCode, InstrumentData] = {
    InstrumentCode.EASYTRAVEL: InstrumentData(
        InstrumentCode.EASYTRAVEL,
        "EasyTravel",
        [
            150.0,
            157.5,
            165.0,
            142.5,
            135.0,
            142.5,
            135.0,
            157.5,
            150.0,
        ],
    ),
    InstrumentCode.EASYPLANES: InstrumentData(
        InstrumentCode.EASYPLANES,
        "EasyPlanes",
        [73.0, 80.0, 87.0, 94.0, 92.0, 100.0, 50.0, 60.0, 73.0],
    ),
    InstrumentCode.EASYHOTELS: InstrumentData(
        InstrumentCode.EASYHOTELS,
        "EasyHotels",
        [25.0, 24.0, 26.0, 200, 17.0, 20.0, 30.0, 35.0, 25.0],
    ),
    InstrumentCode.JANGRP: InstrumentData(
        InstrumentCode.JANGRP,
        "Janssen Groep",
        [0.2170, 0.2370, 0.2270, 0.2070, 0.2370, 0.2170, 0.2370, 0.2070, 0.001],
    ),
    InstrumentCode.CORFIG: InstrumentData(
        InstrumentCode.CORFIG,
        "Corti e figli",
        [0.2440, 0.2565, 0.2690, 0.2815, 0.2690, 0.2815, 0.2440, 0.2315, 0.001],
    ),
    InstrumentCode.CMRTIN: InstrumentData(
        InstrumentCode.CMRTIN,
        "Cummerata Inc",
        [2.1740, 2.0740, 1.9740, 2.0740, 1.8740, 2.0740, 2.2740, 2.3740, 0.01],
    ),
    InstrumentCode.CHAMAT: InstrumentData(
        InstrumentCode.CHAMAT,
        "Charles - Mathieu",
        [1.1270, 1.1770, 1.2270, 1.2770, 1.3270, 1.2770, 1.2270, 1.1770, 0.01],
    ),
    InstrumentCode.BLSTCR: InstrumentData(
        InstrumentCode.BLSTCR,
        "BlueStar Craft",
        [10.0210, 9.5210, 9.0210, 8.5210, 8.0210, 8.5210, 9.0210, 9.5210, 0.04],
    ),
    InstrumentCode.CAFGAL: InstrumentData(
        InstrumentCode.CAFGAL,
        "Cafe Galore",
        [4.6130, 4.7830, 4.6130, 4.4430, 4.6130, 4.9530, 4.6130, 4.2730, 0.02],
    ),
    InstrumentCode.DECGRP: InstrumentData(
        InstrumentCode.DECGRP,
        "Deckerr Gruppe",
        [0.8870, 0.8470, 0.9270, 0.8070, 0.9670, 0.7670, 1.0070, 0.7270, 0.005],
    ),
    InstrumentCode.PETBAN: InstrumentData(
        InstrumentCode.PETBAN,
        "Peters Bank",
        [4.0950, 3.6950, 4.2950, 4.2950, 3.6950, 3.4950, 3.4950, 3.8950, 0.02],
    ),
    InstrumentCode.BATBAT: InstrumentData(
        InstrumentCode.BATBAT,
        "Batista - Batista",
        [8.8910, 9.6910, 8.4910, 8.4910, 8.0910, 9.2910, 9.2910, 8.4910, 0.04],
    ),
    InstrumentCode.STOLLC: InstrumentData(
        InstrumentCode.STOLLC,
        "Stokes LLC",
        [0.4620, 0.4820, 0.4420, 0.5020, 0.4220, 0.4820, 0.4420, 0.5020, 0.002],
    ),
    InstrumentCode.LEBRGA: InstrumentData(
        InstrumentCode.LEBRGA,
        "Lemke - Braun Garden",
        [0.1120, 0.0820, 0.1020, 0.0820, 0.0920, 0.0820, 0.0820, 0.1220, 0.0007],
    ),
    InstrumentCode.MOROBA: InstrumentData(
        InstrumentCode.MOROBA,
        "Mohr Royalty Bank",
        [0.0997, 0.1047, 0.1097, 0.1047, 0.1097, 0.1147, 0.1097, 0.1147, 0.0007],
    ),
}


def interpolate(code: InstrumentCode) -> Callable[[datetime], float]:
    f = interp1d(minutes, INSTRUMENT_DATA[code].daily_stock_values)

    def inner(timestamp: datetime) -> float:
        val = f(timestamp.hour * 60 + timestamp.minute)
        if isinstance(val, ndarray):
            val = val.item()
        return val

    return inner


@dataclass
class Instrument:
    id: int
    data: InstrumentData
    values: dict[str, float]

    def get_value(self, timestamp: datetime) -> float:
        return self.values[str(timestamp.replace(second=0, microsecond=0).time())]


@dataclass
class InstrumentFactory:
    timeframe: Timeframe
    instrument_id: int = field(init=False, default=STARTING_INDEX)

    def get_instrument_id(self) -> int:
        instrument_id = self.instrument_id
        self.instrument_id += 1
        return instrument_id

    def create_instrument(self, code: InstrumentCode) -> Instrument:
        start = self.timeframe.get_day_start(datetime.today())
        end = self.timeframe.get_day_start(datetime.today() + timedelta(days=1))
        ts = self.timeframe.get_time_indexed_values(start, end, 60, interpolate(code))
        values = {str(timestamp.time()): value for timestamp, value in ts}
        return Instrument(self.get_instrument_id(), INSTRUMENT_DATA[code], values)


@dataclass
class OwnedInstrument:
    id: int
    account_id: int
    instrument_id: int
    quantity: float
    last_modification: datetime

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "account_id": self.account_id,
            "instrument_id": self.instrument_id,
            "quantity": self.quantity,
            "last_modification": str(self.last_modification),
        }

    def modify(self, quantity_change: float, timestamp: datetime):
        self.quantity += quantity_change
        self.last_modification = timestamp


@dataclass
class OwnedInstrumentFactory:
    instruments: list[Instrument]
    instrument_id: int = field(init=False, default=STARTING_INDEX)

    def get_instrument_id(self) -> int:
        instrument_id = self.instrument_id
        self.instrument_id += 1
        return instrument_id

    def create_owned_instruments(
        self, account_id: int, timestamp: datetime
    ) -> dict[InstrumentCode, OwnedInstrument]:
        return {
            instrument.data.code: OwnedInstrument(
                self.get_instrument_id(), account_id, instrument.id, 0, timestamp
            )
            for instrument in self.instruments
        }

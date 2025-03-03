from dataclasses import dataclass
from datetime import datetime, timedelta
from math import floor
from typing import Any, Callable, Iterable, Optional

from faker import Faker


@dataclass
class TimePeriod:
    start: datetime
    end: datetime

    def to_json(self) -> dict[str, Any]:
        return {"start": str(self.start), "end": str(self.end)}

    @property
    def delta(self) -> timedelta:
        return self.end - self.start

    def slice(self, parts: int) -> list["TimePeriod"]:
        """Slice period into equal parts"""
        if parts <= 0:
            return []
        interval = self.delta / parts
        slices = (*(self.start + i * interval for i in range(parts)), self.end)
        return [TimePeriod(slices[i], slices[i + 1]) for i in range(parts)]

    def slice_with_interval(self, interval: timedelta) -> list["TimePeriod"]:
        """Slice period into parts of length of interval if possible"""
        ratio = floor(self.delta / interval)
        return [
            TimePeriod(self.start + i * interval, self.start + (i + 1) * interval)
            for i in range(ratio)
        ]

    @classmethod
    def from_period(
        cls, period: timedelta, end: Optional[datetime] = None
    ) -> "TimePeriod":
        """
        Return TimePeriod object

        @param period: delta between start and end
        @param end: datetime of end of period, from which timedelta will be subtracted to get start, datetime.now() will be used if not given
        @return: TimePeriod object
        """
        if end is None:
            end = datetime.now()
        return cls(end - period, end)


@dataclass
class Timeframe:
    faker: Faker

    @staticmethod
    def normalize_resolution(timestamp: datetime) -> datetime:
        """Remove seconds and microseconds from datetime, effectively setting it's resolution to minutes"""
        return timestamp.replace(second=0, microsecond=0)

    def get_datetime_series(self, period: TimePeriod, n: int) -> list[datetime]:
        """
        Return a list of n datetimes between start and end
        The period is first sliced into n equal parts and then a random datetime is generated for each of them.
        """
        slices = period.slice(n)
        return [self.get_datetime_between(slices[i]) for i in range(n)]

    def get_datetime_between(self, period: TimePeriod) -> datetime:
        """Return random datetime between start and end"""
        return self.faker.date_time_between(period.start, period.end)

    def get_time_indexed_values(
        self,
        start: datetime,
        end: datetime,
        precision: float,
        func: Callable[[datetime], float],
    ) -> Iterable[tuple[datetime, float]]:
        ts = self.faker.time_series(start, end, precision=precision, distrib=func)
        return ((timestamp, value) for timestamp, value in ts)

    def get_day_start(self, day: datetime) -> datetime:
        """Return datetime of the start of the day"""
        return day.replace(hour=0, minute=0, second=0, microsecond=0)

import string
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from random import choice, choices
from typing import Any, Optional

from faker import Faker
from user_generator.constants import CREDIT_CARD_TYPES, USER_PASSWORD_LENGTH


@dataclass
class User:
    package_id: int
    first_name: str
    last_name: str
    username: str
    email: str
    password: str
    user_agent: str
    ip4: str
    address: str
    credit_card_number: str
    credit_card_cvv: str
    credit_card_provider: str
    visitor_id: str
    origin: str
    creation_date: str
    package_activation_date: str
    account_active: bool


@dataclass
class Country:
    country_name: str
    continent: str
    locale: str = "en_US"
    valid: bool = True
    ip4: list[str] = field(default_factory=list)
    ip6: list[str] = field(default_factory=list)

    @classmethod
    def from_json(cls, data: dict[str, Any]) -> "Country":
        return cls(**data)


@dataclass
class UserFactory:
    faker: Faker
    country_data: dict[str, Country]

    def create_user(self, country: Country, simple_password: bool = True) -> User:
        """Creates randomly generated user."""
        package_id = self.create_package_id()
        first_name = self.create_first_name(country.locale)
        last_name = self.create_last_name(country.locale)
        password = (
            self.create_simple_password(first_name)
            if simple_password
            else self.create_password(USER_PASSWORD_LENGTH, country.locale)
        )
        username = self.create_username(first_name, last_name)
        email = self.create_email(first_name, last_name)
        user_agent = self.create_user_agent()
        ip = choice(country.ip4)
        address = self.create_address(country.locale)
        card_provider = self.get_card_provider()
        card_type = self.get_card_type(card_provider)
        card_number = self.create_card_number(card_type)
        card_cvv = self.create_card_cvv(card_type)
        visitor_id = self.create_visitor_id()
        origin = self.create_origin()
        creation_date = self.create_creation_date()
        package_activation_date = creation_date
        account_active = self.create_account_active()

        user = User(
            package_id=package_id,
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            password=password,
            user_agent=user_agent,
            ip4=ip,
            address=address,
            credit_card_number=card_number,
            credit_card_cvv=card_cvv,
            credit_card_provider=card_provider,
            visitor_id=visitor_id,
            origin=origin,
            creation_date=creation_date,
            package_activation_date=package_activation_date,
            account_active=account_active,
        )

        return user

    def create_users(
        self, count: int, allowed_countries: Optional[list[str]] = None
    ) -> list[User]:
        countries = [
            country
            for name, country in self.country_data.items()
            if allowed_countries is None or name in allowed_countries
        ]
        return [self.create_user(country) for country in choices(countries, k=count)]

    def create_package_id(self) -> int:
        return self.faker.random_int(min=1, max=3)

    def create_first_name(self, locale: str) -> str:
        return self.faker[locale].first_name()

    def create_last_name(self, locale: str) -> str:
        return self.faker[locale].last_name()

    def create_password(self, length: int, locale: str) -> str:
        return self.faker[locale].password(length=length)

    @classmethod
    def create_simple_password(cls, first_name: str) -> str:
        return f"pass_{first_name.lower()}_123"

    def create_username(self, first_name: str, last_name: str) -> str:

        return f"{first_name.lower()}_{last_name.lower()}".replace(" ", "_")

    def create_email(
        self, first_name: str, last_name: str, locale: str = "en_US"
    ) -> str:
        """Create email address from name"""
        domain: str = self.faker[locale].free_email_domain()
        return f"{first_name.lower()}.{last_name.lower()}@{domain}".replace(" ", "_")

    def create_user_agent(self, mobile: bool = False) -> str:
        while True:
            user_agent: str = self.faker.user_agent()
            is_mobile = "mobile" in user_agent.lower()
            if mobile and is_mobile:
                return user_agent
            elif not mobile and not is_mobile:
                return user_agent

    def create_address(self, locale: str) -> str:
        address: str = self.faker[locale].address()
        return address.replace("\n", " ")

    def get_card_type(self, card_provider: str) -> str:
        return CREDIT_CARD_TYPES[card_provider]

    def get_card_provider(self) -> str:
        return choice(tuple(CREDIT_CARD_TYPES))

    def create_card_number(self, card_type: str) -> str:
        return str(self.faker.credit_card_number(card_type))

    def create_card_cvv(self, card_type: str) -> str:
        return str(self.faker.credit_card_security_code(card_type))

    def create_timestamp(self) -> str:
        timestamp: datetime = self.faker.date_time_between(
            datetime.now() - timedelta(days=30), datetime.now()
        )
        return str(timestamp.timestamp() * 1000)[:13]

    def create_visitor_id(self) -> str:
        """Create visitor id for dynatrace one agent"""
        timestamp = self.create_timestamp()
        random_id = "".join(choices(string.ascii_uppercase + string.digits, k=32))
        return timestamp + random_id

    def create_origin(self) -> str:
        return "PRESET"

    def create_creation_date(self) -> str:
        timestamp: datetime = self.faker.date_time_between(
            datetime.now() - timedelta(days=365), datetime.now() - timedelta(days=330)
        )
        return timestamp.strftime("%Y-%m-%d %H:%M:%S")

    def create_account_active(self) -> bool:
        return True

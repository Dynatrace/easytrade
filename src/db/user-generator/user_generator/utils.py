from datetime import datetime
from hashlib import sha256
import json
from pathlib import Path
from random import random
from typing import Any, Optional, Type, TypeVar
from deserialize import deserialize
from user_generator.constants import SQL_INSERT_LIMIT

def random_between(start: float, end: float) -> float:
    return (end - start) * random() + start


def save_json_file(file: Path, data: Any) -> None:
    file.parent.mkdir(parents=True, exist_ok=True)
    with file.open(mode="w", encoding="UTF-8") as write_file:
        json.dump(data, write_file)


def load_json_file(file: Path) -> Any:
    with file.open(mode="r", encoding="UTF-8") as read_file:
        return json.load(read_file)
    

def save_sql_file(data: list[dict[Any]],
    file: Path, 
    sql_create_file: Path,
    sql_insert_file: Path,
    skip_id: bool = False) -> None:

    file.parent.mkdir(parents=True, exist_ok=True)
    write_file = file.open("w", encoding="UTF-8")

    """Add SQL Create query at the top of the file"""
    write_file.writelines(read_lines_from_file(sql_create_file))

    for index, elem in enumerate(data):
        if(index % SQL_INSERT_LIMIT == 0):
            """Pack every 1000 records into one INSERT query"""
            write_file.writelines(read_lines_from_file(sql_insert_file))

        write_file.write(dict_to_sql_values(elem, skip_id))
        if(index == len(data) - 1 or index % SQL_INSERT_LIMIT == SQL_INSERT_LIMIT-1):
            write_file.write(";\n")
        else:
            write_file.write(",\n")
    write_file.write("GO")

    write_file.close()


def read_lines_from_file(file: Path) -> None:
    with file.open("r", encoding="UTF-8") as read_file:
        lines = read_file.readlines()
    return lines


def sha256_string(string: str) -> str:
    return sha256(string.encode()).hexdigest()


T = TypeVar("T")


def deserialize_data(class_reference: Type[T], data: dict[str, Any]) -> T:
    instance = deserialize(class_reference, data)
    if instance is None:
        raise TypeError(f"Couldn't parse {data} into {class_reference.__name__}")
    return instance


def timestamp_dir_name(
    timestamp: Optional[datetime] = None, format: str = "%Y-%m-%d_%H-%M-%S"
) -> str:
    """
    Generate name for file or dir from timestamp using format

    @param timestamp: datetime to use, if not provided datetime.now() will be used
    @param format: format used to convert timestamp to string

    @return: string with formatted timestamp
    """

    if timestamp is None:
        timestamp = datetime.now()
    return timestamp.strftime(format)


def dict_to_sql_values(dict: dict[Any], skip_id: bool) -> str:
    result = "(\n    "
    first = True
    for key in dict:
        if skip_id and key.lower() == "id":
            continue
        if not first:
            result += ',\n    '
        first = False
        value = dict[key]
        is_number = type(value) == int or type(value) == float
        if not is_number:
            result += f'"{str(value)}"'
        else:
            result += str(value)
    return result + "\n)"
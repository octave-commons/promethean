# SPDX-License-Identifier: GPL-3.0-only
from shared.py.utils.numbers import normalize_numbers


def test_normalize_simple_number():
    text = "He owes me 5 dollars."
    assert normalize_numbers(text) == "He owes me five dollars."


def test_normalize_money_and_ordinal():
    text = "She won $1.05 in the 1st contest."
    expected = "She won one dollar, five cents in the first contest."
    assert normalize_numbers(text) == expected


def test_decimal_number():
    text = "Pi is 3.14"
    assert normalize_numbers(text) == "Pi is three point fourteen"


def test_plural_dollars_and_cents():
    text = "He found $2.01 on the street."
    expected = "He found two dollars, one cent on the street."
    assert normalize_numbers(text) == expected

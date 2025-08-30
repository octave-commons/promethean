"""
 Copyright (c) 2020-2024 Intel Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

This file is based in numbers.py from https://github.com/keithito/tacotron,
commit d26c763342518d4e432e9c4036a1aff3b4fdaa1e on Feb 3, 2020

"""

import inflect
import re


_inflect = inflect.engine()
_comma_number_re = re.compile(r"([0-9][0-9\,]+[0-9])")
_decimal_number_re = re.compile(r"([0-9]+\.[0-9]+)")
_pounds_re = re.compile(r"£([0-9\,]*[0-9]+)")
_dollars_re = re.compile(r"\$([0-9\.\,]*[0-9]+)")
_ordinal_re = re.compile(r"[0-9]+(st|nd|rd|th)")
_number_re = re.compile(r"[0-9]+")


def _remove_commas(m: re.Match) -> str:
    """Return the number string with embedded commas removed."""
    return m.group(1).replace(",", "")


def _expand_decimal_point(m: re.Match) -> str:
    """Convert a decimal point match into words."""
    return m.group(1).replace(".", " point ")


def _pluralize(unit: str, amount: int) -> str:
    """Return ``unit`` in singular or plural form based on ``amount``."""
    return unit if amount == 1 else unit + "s"


def _format_currency(amount: int, unit: str) -> str:
    """Format a currency amount with correct pluralization."""
    return f"{amount} {_pluralize(unit, amount)}"


def _expand_dollars(m: re.Match) -> str:
    """Expand a currency amount into spoken words."""
    match = m.group(1)
    parts = match.split(".")
    if len(parts) > 2:
        return match + " dollars"  # Unexpected format
    dollars = int(parts[0]) if parts[0] else 0
    cents = int(parts[1]) if len(parts) > 1 and parts[1] else 0
    if dollars and cents:
        return (
            f"{_format_currency(dollars, 'dollar')}, {_format_currency(cents, 'cent')}"
        )
    elif dollars:
        return _format_currency(dollars, "dollar")
    elif cents:
        return _format_currency(cents, "cent")
    else:
        return "zero dollars"


def _expand_ordinal(m: re.Match) -> str:
    """Expand an ordinal number into words."""
    res = _inflect.number_to_words(m.group(0))
    return " ".join(res) if isinstance(res, list) else res


def _expand_number(m: re.Match) -> str:
    """Expand a cardinal number into words."""
    num = int(m.group(0))
    if num > 1000 and num < 3000:
        if num == 2000:
            return "two thousand"
        elif num > 2000 and num < 2010:
            res = _inflect.number_to_words(str(num % 100))
            return "two thousand " + (" ".join(res) if isinstance(res, list) else res)
        elif num % 100 == 0:
            res = _inflect.number_to_words(str(num // 100))
            return (" ".join(res) if isinstance(res, list) else res) + " hundred"
        else:
            res = _inflect.number_to_words(str(num), andword="", zero="oh", group=2)
            text = " ".join(res) if isinstance(res, list) else res
            return text.replace(", ", " ")
    else:
        res = _inflect.number_to_words(str(num), andword="")
        return " ".join(res) if isinstance(res, list) else res


def normalize_numbers(text: str) -> str:
    """Normalize all numbers within ``text`` to their spoken forms."""
    text = re.sub(_comma_number_re, _remove_commas, text)
    text = re.sub(_pounds_re, r"\1 pounds", text)
    text = re.sub(_dollars_re, _expand_dollars, text)
    text = re.sub(_decimal_number_re, _expand_decimal_point, text)
    text = re.sub(_ordinal_re, _expand_ordinal, text)
    text = re.sub(_number_re, _expand_number, text)
    return text

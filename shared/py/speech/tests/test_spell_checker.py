import pytest

from shared.py.speech import spell_checker


@pytest.mark.parametrize(
    "sentence,expected",
    [
        ("She go to school every day", "She goes to school every day."),
        ("He don't know nothing", "He didn't know anything."),
        ("They is playing soccer", "They play soccer."),
    ],
)
def test_correct_returns_expected_sentence(sentence, expected):
    assert spell_checker.correct(sentence) == expected

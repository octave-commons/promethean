# Untested Python Modules

This document lists modules in the `shared/py` package that currently have no automated test coverage.

| Module Path | Lines Missed | Notes |
|-------------|-------------|-------|
| `shared/py/date_tools.py` | 16 | Utility functions for date handling |
| `shared/py/mongodb.py` | 19 | MongoDB wrapper utilities |
| `shared/py/settings.py` | 17 | Global application settings loader |
| `shared/py/utils/gui.py` | 25 | Tkinter GUI helpers |
| `shared/py/utils/wav_processing.py` | 83 | Audio batch and resampling routines |

Coverage generated with `pytest --cov` showed these modules at **0%** coverage. Adding unit tests will ensure these utilities remain stable as the project evolves.

---

#hashtags: #testing #coverage #documentation

#tags: #docs

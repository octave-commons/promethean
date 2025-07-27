import pytest; pytest.skip("example script", allow_module_level=True)
import os
print(os.path.dirname(os.path.abspath(__file__)))
print(os.getcwd())
print(__file__)
print(os.path.abspath("models/public/forward-tacotron/forward-tacotron-duration-prediction/FP16/forward-tacotron-duration-prediction.xml"))
test_path="models/public/forward-tacotron/forward-tacotron-duration-prediction/FP16/forward-tacotron-duration-prediction.xml"
print(os.path.exists(test_path))


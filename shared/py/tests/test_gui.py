import sys
import types

from shared.py.utils.gui import init_parameters_interactive


def test_init_parameters_interactive_defaults(monkeypatch):
    created = []

    class DummyWidget:
        def __init__(self, *args, **kwargs):
            created.append(type(self).__name__)

        def pack(self, *args, **kwargs):
            pass

    class DummyTk(DummyWidget):
        def title(self, *_):
            pass

        def geometry(self, *_):
            pass

        def destroy(self):
            pass

    class DummyLabelFrame(DummyWidget):
        pass

    class DummyRadiobutton(DummyWidget):
        pass

    class DummyScale(DummyWidget):
        pass

    class DummyButton(DummyWidget):
        pass

    class DummyVar:
        def __init__(self, value=None):
            self.value = value

        def get(self):
            return self.value

    class DummyIntVar(DummyVar):
        pass

    class DummyDoubleVar(DummyVar):
        pass

    fake_tk = types.SimpleNamespace(
        Tk=DummyTk,
        LabelFrame=DummyLabelFrame,
        Radiobutton=DummyRadiobutton,
        IntVar=DummyIntVar,
        DoubleVar=DummyDoubleVar,
        Scale=DummyScale,
        Button=DummyButton,
        W="w",
        HORIZONTAL="horizontal",
        mainloop=lambda: None,
    )

    monkeypatch.setitem(sys.modules, "tkinter", fake_tk)

    args = types.SimpleNamespace(alpha=1.0)
    result = init_parameters_interactive(args)

    assert result == {"gender": "Male", "style": 1.0, "speed": 1.0}
    assert "DummyTk" in created
    assert "DummyRadiobutton" in created

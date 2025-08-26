import os, sys, glob, site, ctypes

libs = (
    "libcusparseLt.so.0",
    "libcusparse.so.12",
    "libcublasLt.so.12",
    "libcublas.so.12",
    "libcudnn.so.9",
)


def ok():
    for n in libs:
        try:
            ctypes.CDLL(n)
            return True
        except OSError:
            pass
    return False


if not ok() and os.environ.get("PROMETHEAN_CUDA_LIBS_BOOTSTRAPPED") != "1":
    paths = set()
    for base in list(site.getsitepackages()) + [site.getusersitepackages()]:
        if base:
            for d in glob.glob(base + "/nvidia/*/lib"):
                if glob.glob(d + "/*.so*"):
                    paths.add(d)
    if paths:
        os.environ["LD_LIBRARY_PATH"] = ":".join(sorted(paths)) + (
            ":" + os.environ["LD_LIBRARY_PATH"]
            if os.environ.get("LD_LIBRARY_PATH")
            else ""
        )
        os.environ["PROMETHEAN_CUDA_LIBS_BOOTSTRAPPED"] = "1"
        os.execve(sys.executable, [sys.executable] + sys.argv, os.environ)

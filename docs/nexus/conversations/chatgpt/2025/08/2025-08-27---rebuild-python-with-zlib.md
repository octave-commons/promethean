---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Rebuild Python with zlib"
conversation_id: 68af52f9-b9d4-832a-8c14-05ce1473113d
create_time: 08/27/2025 at 1:48 PM
update_time: 08/27/2025 at 1:50 PM
---

# Title: Rebuild Python with zlib

Created: 08/27/2025 at 1:48 PM
Last Updated: 08/27/2025 at 1:50 PM
Chat URL: https://chat.openai.com/c/68af52f9-b9d4-832a-8c14-05ce1473113d


>[!nexus_user] **User** - 08/27/2025 at 1:48 PM
> (cd /home/err/.pyenv/versions/3.12.1/bin; ln -s python3.12-config python3.12-config); \
> 	rm -f /home/err/.pyenv/versions/3.12.1/lib/pkgconfig/python-3.12.pc; \
> 	(cd /home/err/.pyenv/versions/3.12.1/lib/pkgconfig; ln -s python-3.12.pc python-3.12.pc); \
> 	rm -f /home/err/.pyenv/versions/3.12.1/lib/pkgconfig/python-3.12-embed.pc; \
> 	(cd /home/err/.pyenv/versions/3.12.1/lib/pkgconfig; ln -s python-3.12-embed.pc python-3.12-embed.pc); \
> fi
> rm -f /home/err/.pyenv/versions/3.12.1/bin/python3-config
> (cd /home/err/.pyenv/versions/3.12.1/bin; ln -s python3.12-config python3-config)
> rm -f /home/err/.pyenv/versions/3.12.1/lib/pkgconfig/python3.pc
> (cd /home/err/.pyenv/versions/3.12.1/lib/pkgconfig; ln -s python-3.12.pc python3.pc)
> rm -f /home/err/.pyenv/versions/3.12.1/lib/pkgconfig/python3-embed.pc
> (cd /home/err/.pyenv/versions/3.12.1/lib/pkgconfig; ln -s python-3.12-embed.pc python3-embed.pc)
> rm -f /home/err/.pyenv/versions/3.12.1/bin/idle3
> (cd /home/err/.pyenv/versions/3.12.1/bin; ln -s idle3.12 idle3)
> rm -f /home/err/.pyenv/versions/3.12.1/bin/pydoc3
> (cd /home/err/.pyenv/versions/3.12.1/bin; ln -s pydoc3.12 pydoc3)
> rm -f /home/err/.pyenv/versions/3.12.1/bin/2to3
> (cd /home/err/.pyenv/versions/3.12.1/bin; ln -s 2to3-3.12 2to3)
> if test "x" != "x" ; then \
> 	rm -f /home/err/.pyenv/versions/3.12.1/bin/python3-32; \
> 	(cd /home/err/.pyenv/versions/3.12.1/bin; ln -s python3.12-32 python3-32) \
> fi
> if test "x" != "x" ; then \
> 	rm -f /home/err/.pyenv/versions/3.12.1/bin/python3-intel64; \
> 	(cd /home/err/.pyenv/versions/3.12.1/bin; ln -s python3.12-intel64 python3-intel64) \
> fi
> rm -f /home/err/.pyenv/versions/3.12.1/share/man/man1/python3.1
> (cd /home/err/.pyenv/versions/3.12.1/share/man/man1; ln -s python3.12.1 python3.1)
> if test "xupgrade" != "xno" ; then \
> 	case upgrade in \
> 		upgrade) ensurepip="--upgrade" ;; \
> 		install|*) ensurepip="" ;; \
> 	esac; \
> 	LD_LIBRARY_PATH=/tmp/python-build.20250827134555.174277/Python-3.12.1 ./python -E -m ensurepip \
> 		$ensurepip --root=/ ; \
> fi
> Traceback (most recent call last):
>  File "<frozen zipimport>", line 518, in _get_decompress_func
> ModuleNotFoundError: No module named 'zlib'
> 
> During handling of the above exception, another exception occurred:
> 
> Traceback (most recent call last):
>  File "<frozen zipimport>", line 566, in _get_data
>  File "<frozen zipimport>", line 521, in _get_decompress_func
> zipimport.ZipImportError: can't decompress data; zlib not available
> 
> During handling of the above exception, another exception occurred:
> 
> Traceback (most recent call last):
>  File "<string>", line 6, in <module>
>  File "<frozen runpy>", line 222, in run_module
>  File "<frozen runpy>", line 148, in _get_module_details
>  File "<frozen runpy>", line 112, in _get_module_details
>  File "<frozen zipimport>", line 137, in get_code
>  File "<frozen zipimport>", line 700, in _get_module_code
>  File "<frozen zipimport>", line 568, in _get_data
> zipimport.ZipImportError: can't decompress data; zlib not available
> Traceback (most recent call last):
>  File "<frozen runpy>", line 198, in _run_module_as_main
>  File "<frozen runpy>", line 88, in _run_code
>  File "/tmp/python-build.20250827134555.174277/Python-3.12.1/Lib/ensurepip/__main__.py", line 5, in <module>
>  sys.exit(ensurepip._main())
>  ^^^^^^^^^^^^^^^^^
>  File "/tmp/python-build.20250827134555.174277/Python-3.12.1/Lib/ensurepip/__init__.py", line 284, in _main
>  return _bootstrap(
>  ^^^^^^^^^^^
>  File "/tmp/python-build.20250827134555.174277/Python-3.12.1/Lib/ensurepip/__init__.py", line 200, in _bootstrap
>  return _run_pip([*args, *_PACKAGE_NAMES], additional_paths)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "/tmp/python-build.20250827134555.174277/Python-3.12.1/Lib/ensurepip/__init__.py", line 101, in _run_pip
>  return subprocess.run(cmd, check=True).returncode
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "/tmp/python-build.20250827134555.174277/Python-3.12.1/Lib/subprocess.py", line 571, in run
>  raise CalledProcessError(retcode, process.args,
> subprocess.CalledProcessError: Command '['/tmp/python-build.20250827134555.174277/Python-3.12.1/python', '-W', 'ignore::DeprecationWarning', '-c', '\nimport runpy\nimport sys\nsys.path = [\'/tmp/tmpeknasnvr/pip-23.2.1-py3-none-any.whl\'] + sys.path\nsys.argv[1:] = [\'install\', \'--no-cache-dir\', \'--no-index\', \'--find-\', \'/tmp/tmpeknasnvr\', \'--root\', \'/\', \'--upgrade\', \'pip\']\nrunpy.run_module("pip", run_name="__main__", alter_sys=True)\n']' returned non-zero exit status 1.
> make: *** [Makefile:2023: install] Error 1
<!-- UID: f5e9ce31-26ac-47aa-a4fd-713df30f579f -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 1:48 PM
> You built Python without zlib. `ensurepip` unpacks a bundled wheel (a zip); without zlib support, import fails → `zipimport.ZipImportError: zlib not available`. Fix = install zlib **headers** (and the usual build deps) and **rebuild** that Python.
> 
> # What to do (Ubuntu/Debian)
> 
> ```bash
> # 1) Build deps (safe to re-run)
> sudo apt update
> sudo apt install -y \
>  build-essential curl ca-certificates \
>  zlib1g-dev libbz2-dev liblzma-dev xz-utils \
>  libssl-dev libreadline-dev libsqlite3-dev \
>  libffi-dev libncursesw5-dev tk-dev uuid-dev \
>  libgdbm-dev libgdbm-compat-dev
> 
> # 2) Rebuild Python (pyenv)
> pyenv uninstall -f 3.12.1
> 
> # optional but recommended: take latest patch, e.g. 3.12.6
> # pyenv install -l | grep '^ 3\.12\.' | tail -1
> # export VERSION=3.12.6
> 
> export VERSION=3.12.1
> # --enable-shared helps editors/tools find libpython
> env PYTHON_CONFIGURE_OPTS="--enable-shared" pyenv install "$VERSION"
> pyenv global "$VERSION"
> 
> # 3) Sanity checks
> python -c "import sys, zlib;print(sys.version);print('zlib ok:', zlib.ZLIB_RUNTIME_VERSION)"
> python -m pip --version
> ```
> 
> If those two lines don’t error, you’re done.
> 
> # Fedora/RHEL (if that’s you)
> ```bash
> sudo dnf groupinstall -y "Development Tools"
> sudo dnf install -y \
>  zlib-devel bzip2-devel xz-devel \
>  openssl-devel readline-devel sqlite-devel \
>  libffi-devel ncurses-devel tk-devel gdbm-devel
> 
> pyenv uninstall -f 3.12.1
> env PYTHON_CONFIGURE_OPTS="--enable-shared" pyenv install 3.12.1
> ```
> 
> # Why this happened (straight)
> - `zlib1g-dev` (Ubuntu) provides **`/usr/include/zlib.h`**. Without it, the CPython `zlib` module is skipped at build time.
> - `ensurepip` then tries to `zipimport` the bundled pip wheel → needs zlib → boom.
> - No amount of sym in `.../lib/pkgconfig` will save this; you must rebuild with zlib present.
> 
> # Quick verification (post-fix)
> ```bash
> python -m sysconfig | grep -i zlib
> python -c "import zlib, zipimport; print('ok')"
> python -m pip install --upgrade pip
> ```
> 
> # Optional niceties
> - Build with LTO/PGO for speed:
>  ```bash
>  env PYTHON_CONFIGURE_OPTS="--enable-optimizations --with-lto --enable-shared" pyenv install 3.12.6
>  ```
> - Keep SSL working (pip needs it): ensure `libssl-dev` was installed before building.
> 
> If you still see weirdness, paste the tail of `~/.pyenv/versions/3.12.1/build.log` and `config.log` and we’ll pick it apart.
> 
> #hashtags
> #linux #pyenv #python #build-failures #zlib #devtools #ubuntu #fix-notes
<!-- UID: 3fa062d9-4609-4372-9734-9661e4a7e85f -->

---



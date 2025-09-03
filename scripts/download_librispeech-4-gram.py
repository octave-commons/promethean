# SPDX-License-Identifier: GPL-3.0-only
import torchaudio

paths = torchaudio.models.decoder.download_pretrained_files("librispeech-4-gram")
arpa_path = paths[0]  # This is the uncompressed .arpa file

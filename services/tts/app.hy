(import [fastapi [FastAPI Form Response]])
(import torch)
(import io)
(import [safetensors.torch [load_file]])
(import soundfile :as sf)
(import logging)

(import [nltk])
(.download nltk "averaged_perceptron_tagger_eng")

(setv log (.getLogger logging __name__))

(setv app (FastAPI))

(import [transformers [FastSpeech2ConformerTokenizer FastSpeech2ConformerWithHifiGan]])

(setv device (if (torch.cuda.is_available) "cuda" "cpu"))
(.debug log "Running on device %s" device)

(setv tokenizer (.from_pretrained FastSpeech2ConformerTokenizer "espnet/fastspeech2_conformer"))
(setv model (.to (.from_pretrained FastSpeech2ConformerWithHifiGan "espnet/fastspeech2_conformer_with_hifigan" :use_safetensors True) device))

(defn synthesize [text]
  (setv input-ids (.to (.input_ids (tokenizer text :return_tensors "pt")) device))
  (with [(torch.no_grad)]
    (setv output (model input-ids :return_dict True))
    (.numpy (.cpu (.squeeze (.waveform output))))))

(@ (app.post "/synth_voice_pcm")
(defn synth-voice-pcm [#* [input-text (Form ... )]]
  (setv pcm-bytes-io (io.BytesIO))
  (sf.write pcm-bytes-io (synthesize input-text) :samplerate 22050 :format "RAW" :subtype "PCM_16")
  (Response :content (.getvalue pcm-bytes-io) :media_type "application/octet-stream")))

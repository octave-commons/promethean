---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Desktop audio sink selection"
conversation_id: 68980cf1-8080-8324-b02b-5e82eeda0f0b
create_time: 08/09/2025 at 10:07 PM
update_time: 08/10/2025 at 12:14 AM
---

# Title: Desktop audio sink selection

Created: 08/09/2025 at 10:07 PM
Last Updated: 08/10/2025 at 12:14 AM
Chat URL: https://chat.openai.com/c/68980cf1-8080-8324-b02b-5e82eeda0f0b


>[!nexus_user] **User** - 08/09/2025 at 10:07 PM
> Which one of these is my desktop audio sink?
> err@err-Stealth-16-AI-Studio-A1VGG:~/devel/promethean$ pactl list short sources
> 1208 alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp_5__sink.monitor PipeWire s32le 2ch 48000Hz IDLE
> 1209 alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp_4__sink.monitor PipeWire s32le 2ch 48000Hz SUSPENDED
> 1210 alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp_3__sink.monitor PipeWire s32le 2ch 48000Hz SUSPENDED
> 1211 alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp__sink.monitor PipeWire s32le 2ch 48000Hz SUSPENDED
> 1212 alsa_input.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp__source PipeWire s32le 2ch 48000Hz SUSPENDED
> 1213 alsa_input.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp_6__source PipeWire s32le 2ch 48000Hz SUSPENDED
> 1214 alsa_output.usb-SteelSeries_SteelSeries_Arctis_Nova_5-00.analog-stereo.monitor PipeWire s16le 2ch 48000Hz RUNNING
> 1215 alsa_input.usb-SteelSeries_SteelSeries_Arctis_Nova_5-00.mono-fallback PipeWire s16le 1ch 48000Hz RUNNING
<!-- UID: 1df80ce8-21ee-4210-acde-51bccdc7bbdc -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 10:07 PM
> Your desktop audio sink is most likely: 
> 
> ```
> alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp_5__sink.monitor
> ```
> 
> That’s the one in your list that: 
> - Is a **`.monitor`** source — meaning it’s the *loopback* capture of a sink (desktop audio output). 
> - Corresponds to your onboard audio (`pci-0000_00_1f.3...`). 
> - Is the only one in `IDLE` state — meaning it’s available and not suspended. 
> 
> Your USB headset (`alsa_output.usb-SteelSeries_...monitor`) is also a sink monitor, but that one would only capture audio being sent to the headset, not your main system speakers. 
> 
> If you want **all desktop audio** going through your default speakers, you’d use the `alsa_output.pci...sink.monitor`. 
> If you want **only what’s going to your headset**, you’d use the `alsa_output.usb-SteelSeries_...monitor`. 
> 
> If you want, I can walk you through a `pactl` or `pw-loopback` setup that captures *both*.
<!-- UID: acc66c83-436e-409a-9114-47e913aba4d5 -->

---




>[!nexus_user] **User** - 08/09/2025 at 10:16 PM
> How do I match what voicemeeter does on windows? I want to capture my desktop audio *and* my mic.
<!-- UID: 8748c98b-ef60-4907-8dc1-b4b23f30a515 -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 10:16 PM
> On Linux with PipeWire (what you’re using), you can get a **VoiceMeeter-like virtual mix** by creating a *combined* virtual source that merges: 
> 
> 1. **Your desktop audio monitor** (`alsa_output...sink.monitor`) 
> 2. **Your microphone source** (`alsa_input...source`) 
> 
> Here’s the general approach. 
> 
> ---
> 
> ## **1. Create a virtual source**
> PipeWire uses `pw-loopback` to route audio between sources and sinks.
> 
> You can create a **null sink** (virtual output) and then loop both your mic and desktop audio into it.
> 
> ```bash
> # Create a null sink (virtual output)
> pactl load-module module-null-sink sink_name=MixedOutput sink_properties=device.description=MixedOutput
> ```
> 
> This creates two things:
> - `MixedOutput` (acts like speakers — you can route things here)
> - `MixedOutput.monitor` (acts like a mic — you can record from this)
> 
> ---
> 
> ## **2. Loop desktop audio into the mix**
> ```bash
> pw-loopback --capture-props='node.name=DesktopAudioLoopback' --playback-props='node.target=MixedOutput' --target alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp_5__sink.monitor
> ```
> Replace the `--target` with your actual desktop sink monitor.
> 
> ---
> 
> ## **3. Loop mic into the mix**
> ```bash
> pw-loopback --capture-props='node.name=MicLoopback' --playback-props='node.target=MixedOutput' --target alsa_input.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp__source
> ```
> Replace `--target` with your actual mic source.
> 
> ---
> 
> ## **4. Use `MixedOutput.monitor` as your “combined mic”**
> In OBS, Discord, or whatever app, select:
> ```
> MixedOutput.monitor
> ```
> That’s now your mic + desktop audio merged into one stream — exactly like VoiceMeeter’s “B1/B2” outputs.
> 
> ---
> 
> ## **5. (Optional) Save it so it starts every boot**
> You can put the `pactl` and `pw-loopback` commands into:
> ```
> ~/.config/pipewire/pipewire-pulse.conf
> ```
> or into a `systemd --user` service so they run at login.
> 
> ---
> 
> If you want, I can give you a **one-liner** that spins up the null sink and loops your mic + desktop audio automatically without manual PipeWire plumbing. That’s closest to VoiceMeeter’s plug-and-play feel. 
> 
> Do you want me to make that script?
<!-- UID: 01adbdb6-f729-4903-b151-02985a612ae6 -->

---



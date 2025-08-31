---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Raspberry Pi Wi-Fi range"
conversation_id: 689a3e8a-ce3c-8320-9bc9-6534efe40df1
create_time: 08/11/2025 at 2:04 PM
update_time: 08/12/2025 at 8:44 AM
---

# Title: Raspberry Pi Wi-Fi range

Created: 08/11/2025 at 2:04 PM
Last Updated: 08/12/2025 at 8:44 AM
Chat URL: https://chat.openai.com/c/689a3e8a-ce3c-8320-9bc9-6534efe40df1


>[!nexus_user] **User** - 08/11/2025 at 2:04 PM
> Years ago, I was looking into this thing where I could use a Raspberry Pi and this really, really long range Wi-Fi thing. And I was thinking about making a decentralized network of these things. How much would that cost now? What's the longest possible range Wi-Fi thing I could possibly attach to a Raspberry Pi?
<!-- UID: bbb2130a-2864-486a-b3ed-097dc00f6a34 -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 2:07 PM
> Here’s the no-BS 2025 snapshot.
> 
> # Long-range Wi-Fi with a Raspberry Pi — what’s realistic
> 
> **Attach point:** Don’t use a USB dongle for multi-km. Use an outdoor PtP radio/antenna on a mast and plug it into the Pi via Ethernet (the radio does the RF; the Pi just routes/serves apps). USB “high-power” sticks are for RV park fishing, not 10–50 km .
> 
> ## “How much would it cost now?”
> Per *link* (you need two radios), rough street pricing:
> 
> - **Budget / short–mid (1–10+ km LOS)** 
>  **Ubiquiti LiteBeam 5AC Gen2 (23 dBi)** ≈ **$64–$80 each** → **$130–$160 per pair**. Ubiquiti advertises **“30+ km”** under ideal LOS, though plan for less. citeturn1view1 
>  Add a **Raspberry Pi 5** (4/8/16 GB at **$60/$80/$120** list), PoE injectors (usually included), outdoor CAT6, mounts, surge → **$150–$300 extra**. cite
> 
> - **Serious / long (10–40+ km LOS)** 
>  **Ubiquiti PowerBeam 5AC-620 (29 dBi)** ≈ **$219 each** → **$440–$500 per pair** (+ same incidentals). 450+ Mbps class. cite
> 
> - **Extreme / “as far as you can reasonably push unlicensed 5 GHz”** 
>  **RocketDish 34 dBi + airFiber 5XHD radio** on each side. Dish ≈ **$329** each, radio ≈ **$429** each → **~$1,500–$1,800 per link** before mounts/grounding. People do **100+ km** with this class of gear under immaculate LOS. (Ubiquiti has public record attempts 140–300 km.) cite
> 
> - **Special case (60 GHz “wave” , very high throughput, weather-sensitive)** 
>  **airFiber 60 LR** does ~**12+ km** at up to ~2 Gbps, but 60 GHz fades in rain/snow; great when clean LOS and predictable weather. ≈ **$270–$350 each**. cite
> 
> - **RV “Wi-Fi fishing” (hundreds of meters to a km+ if the far AP cooperates)** 
>  **ALFA Tube-UAC2 (USB)** ≈ **$60** + a **24 dBi 2.4 GHz grid** ≈ **$60–$90**. Works with Linux/RPi; still nowhere near dish-to-dish . citeturn7view0
> 
> > Ballpark all-in (per link): 
> > LiteBeam pair **$280–$450**, PowerBeam pair **$650–$950**, RocketDish/AF-5XHD pair **$1.8–$2.5k** once you add masts, grounding, cable, etc.
> 
> ## “What’s the longest I could possibly do from a Pi?”
> - If we’re talking **unlicensed “Wi-Fi-ish” 5 GHz**, **RocketDish + AF-5XHD-class** hardware is the realistic ceiling. **100+ km** has been done; beyond that is stunt territory and site-prep becomes everything (earth curvature, Fresnel clearance, wind loading, precision alignment, spectrum noise). cite
> - **60 GHz** tops out around **12 km** with AF60-LR. Amazing throughput, but keep a weather plan. cite
> - **802.11ah (Wi-Fi HaLow)** modules for Pi exist and can do **kilometer-class** at low-Mbps, but they’re dev-kit pricing and niche. Good for sensors, not backhaul. cite
> 
> ## Reality checks (don’t skip)
> - **Law & RF limits:** In the U-NII bands, U.S. rules cap conducted/EIRP and dictate reductions as antenna gain rises; DFS applies. Know **47 CFR §15.407** before you crank power. cite
> - **Geometry beats wattage:** You need **clean LOS + Fresnel clearance**. Calculate it, then design mast heights accordingly. cite
> - **USB adapters ≠ mesh:** If building a decentralized/mesh network, run **OpenWrt + 802.11s/BATMAN-adv** on radios/routers; **most USB Wi-Fi dongles don’t support 802.11s**. cite
> 
> ## What I’d buy today (practical picks)
> - **<10–15 km, cheap & sane:** Pair of **LiteBeam 5AC Gen2**, Pi 5 at the edge if you need compute. citeturn1view1
> - **15–40+ km / more robust:** Pair of **PowerBeam 620**. cite
> - **Gigabit over a dozen km (weather okay):** Pair of **AF60-LR**. cite
> - **RV park capture:** **ALFA Tube-UAC2 + grid antenna** to a Pi running hostapd/NAT for your LAN. citeturn7view0
> 
> If you want, I’ll sketch a minimal BOM (masts, PoE, grounding, cable gauges) and a quick config plan (bridge vs routed, Pi services, OpenWrt/BATMAN-adv topology). #wifi #raspberrypi #mesh #ubiquiti #mikrotik #pointtopoint #longrange #openwrt #80211s #halow
<!-- UID: 920e56a4-210a-4a9f-b3ed-bf337adf9bb5 -->

---



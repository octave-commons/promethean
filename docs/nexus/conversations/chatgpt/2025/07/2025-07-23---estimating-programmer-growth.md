---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Estimating Programmer Growth"
conversation_id: 68818a5e-5a38-8004-b5a1-8543546df309
create_time: 07/23/2025 at 8:20 PM
update_time: 07/23/2025 at 8:22 PM
---

# Title: Estimating Programmer Growth

Created: 07/23/2025 at 8:20 PM
Last Updated: 07/23/2025 at 8:22 PM
Chat URL: https://chat.openai.com/c/68818a5e-5a38-8004-b5a1-8543546df309


>[!nexus_agent] **Assistant** - 07/23/2025 at 8:21 PM
> Yeah, Uncle Bob (Robert C. Martin) has repeatedly mentioned that the number of programmers has historically doubled about every five years. That figure isn’t exact science, but it's useful for understanding why software culture is fragmented and institutional memory is poor—most devs are relatively new.
> 
> Let’s break it down practically.
> 
> ---
> 
> ### 📅 Let's estimate:
> Say Uncle Bob said that in a talk or book around **2003–2008** (he often referenced this idea in that era). For simplicity, let’s pick **2005** as the base year.
> 
> Back then, a **common ballpark** estimate was:
> 
> - ~**5 million** professional software developers worldwide (depending on the source: IDC, Evans Data, etc.)
> 
> Now if we double that every 5 years:
> 
> | Year | Estimate (# Devs) |
> |------|--------------------|
> | 2005 | ~5 million |
> | 2010 | ~10 million |
> | 2015 | ~20 million |
> | 2020 | ~40 million |
> | 2025 | ~80 million ← theoretical based on doubling every 5 years
> 
> That gives us **~80 million** today _if_ the doubling trend held steady.
> 
> ---
> 
> ### 🧾 Reality check with actual data:
> 
> - **Evans Data Corp (2023)**: estimated around **29.1 million developers** worldwide.
> - **SlashData (2024)**: estimated **35 million** developers.
> 
> So we’re **not** quite at 80 million. The doubling rate seems to have **slowed**, likely due to saturation, educational bottlenecks, and economic ceilings.
> 
> ---
> 
> ### 💡 Bottom line:
> If Uncle Bob's model held true from 2005, we’d be at **~80 million developers** in 2025. But real-world numbers suggest we're more like **35–40 million**, meaning growth has **slowed to more like 1.5x every 5–6 years**, not full doubling.
> 
> Still, compared to 2005, that's **7–8× growth** in 20 years—**massive scale-up**. And most devs today weren’t coding even 10 years ago, which explains a lot about the current state of the industry.
> 
> Want me to graph this out or model alternate projections?
<!-- UID: 60e979df-259c-4b62-bf69-eb23d52d9684 -->

---




>[!nexus_user] **User** - 07/23/2025 at 8:21 PM
> Uncle bob once talked about how the number of programmers are doubling about every 5 years... from the last time he talked about that, bout how many programmers do you think there are right now?
<!-- UID: 35696f4b-def0-4112-920d-470d958f4696 -->




>[!nexus_agent] **Assistant** - 07/23/2025 at 8:21 PM
> You're asking the right kind of question—experience percentile is *way* more meaningful than just "how many years you’ve been coding."
> 
> Let’s figure this out by estimating what **percentile of developers** you’d fall into if you started programming in **2012**.
> 
> ---
> 
> ## 🧠 Assumptions
> 
> To answer this, we need to estimate the **distribution of developer experience** in the current population. Since the number of devs has been growing **exponentially**, the experience level is skewed **heavily toward newer devs**.
> 
> We’ll model like this:
> 
> 1. Assume the number of devs **doubles every ~5–6 years** until recently (based on Uncle Bob and real data).
> 2. Estimate global dev population at:
>  - **2025**: ~35 million (realistic)
>  - Then work backward to figure out how many started each year.
> 
> Let’s build a rough cohort model.
> 
> ---
> 
> ## 🔢 Model: Devs per Year Cohort
> 
> We’ll pretend devs started work and kept working (not 100% true, but close enough for percentile modeling):
> 
> | Year Started | Estimated Cohort Size | Total Experience in 2025 | Cumulative % |
> |--------------|------------------------|---------------------------|----------------|
> | 2025 | ~2.0M | 0 years | ~5% |
> | 2024 | ~2.1M | 1 year | ~11% |
> | 2023 | ~2.3M | 2 years | ~17% |
> | 2022 | ~2.5M | 3 years | ~24% |
> | 2021 | ~2.7M | 4 years | ~31% |
> | 2020 | ~3.0M | 5 years | ~39% |
> | 2019 | ~2.7M | 6 years | ~46% |
> | 2018 | ~2.5M | 7 years | ~52% |
> | 2017 | ~2.2M | 8 years | ~58% |
> | 2016 | ~2.0M | 9 years | ~64% |
> | 2015 | ~1.7M | 10 years | ~69% |
> | 2014 | ~1.5M | 11 years | ~73% |
> | 2013 | ~1.3M | 12 years | ~77% |
> | **2012** | **~1.1M** | **13 years** | **~80%** |
> | ... | ... | ... | ... |
> 
> ---
> 
> ## ✅ Answer:
> 
> If you started in **2012**, that puts you roughly at the **80th percentile** in terms of years of programming experience in 2025.
> 
> **Only ~20% of professional developers today have been coding longer than you.**
> 
> Let that sink in: you’re in the **top quintile** of experience. Not because you’re ancient, but because most devs are relatively new. That exponential growth curve makes 13 years look like an eternity in this field.
> 
> ---
> 
> Want to know your rank in percentile *by skill*, not just experience? That’s a harder (but more interesting) problem—plenty of 3-year devs outperform 10-year ones. But years alone? You're a veteran.
<!-- UID: 96d481bd-25c6-4bfe-8fb3-550ce245aca7 -->

---




>[!nexus_user] **User** - 07/23/2025 at 8:21 PM
> so if I started programming in 2012, what percentile of programming years experience does that place me?
<!-- UID: 70cfb0bb-917f-4bcf-b555-60e4231d946a -->



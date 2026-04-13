# Mission Control: Hormuz Scenarios

**Version**: 0.1.0
**Status**: Analysis
**Purpose**: Define scenarios for Hormuz Strait risk tracking, with probability bands and indicators.

---

## Overview

The Strait of Hormuz is a critical chokepoint for global oil transit (~20% of global liquids, ~20 million barrels/day). This document defines scenarios for use in threat radar and mission control systems.

---

## Base Facts

| Fact | Value | Source |
|------|-------|--------|
| Daily transit through Hormuz | ~20 million b/d | EIA |
| Share of global liquids | ~20% | EIA |
| Global reroute capacity | ~4.2 million b/d | IEA |
| Primary alternative route | Sumed pipeline + Cape | Industry |
| Regional powers | Iran, UAE, Saudi Arabia, Oman | Geography |

---

## Scenario Framework

Scenarios are defined by:
1. **Trigger conditions**: What starts the scenario
2. **Probability band**: Estimated likelihood
3. **Key indicators**: What confirms/denies
4. **Impact level**: Economic, humanitarian, geopolitical
5. **Time horizon**: How fast it unfolds

---

## Scenario 1: Managed De-escalation

**Probability**: Medium-High (35-50%)

**Trigger**: Diplomatic resolution, backchannel negotiations, or mutual face-saving off-ramps.

**Indicators**:
- Iran receives sanctions relief or economic concessions
- US/Israel pauses escalatory actions
- Regional mediators (Oman, Qatar) active
- Oil prices stabilize near pre-crisis levels

**Impact**:
- Minimal disruption to shipping
- Insurance rates normalize
- Military presence drawn down gradually

**Confirmation**:
- Official statements from all parties de-escalating
- Iranian vessels return to normal patrol patterns
- Commercial shipping resumes full volume

---

## Scenario 2: Controlled Tension

**Probability**: Medium (25-35%)

**Trigger**: Intermittent harassment, selective targeting, diplomatic signals without full escalation.

**Indicators**:
- Iranian speedboat approaches continue but don't result in captures
- Seizures limited to specific flagged vessels (negotiation leverage)
- US naval presence increased but engagements limited
- Oil prices elevated but not spiking

**Impact**:
- 10-30% reduction in Hormuz transit volume
- Insurance premiums rise 5-10x
- Regional shipping reroutes partially
- Economic drag on oil-importing nations

**Confirmation**:
- Pattern of harassment without full closure
- Diplomatic channels remain open
- No confirmed mining or sustained attacks

---

## Scenario 3: Temporary Closure

**Probability**: Low-Medium (10-20%)

**Trigger**: Iranian Revolutionary Guard Corps (IRGC) initiates mining or sustained attacks, international response escalates.

**Indicators**:
- Confirmed mining of strait approaches
- Multiple commercial vessels attacked/sunk
- US carrier strike group engages
- Oil prices spike 50-100%

**Impact**:
- Hormuz transit near-zero for 2-8 weeks
- Global supply shock, strategic reserve releases
- Military conflict limited to naval/air
- Significant economic contraction

**Confirmation**:
- Satellite imagery of mining activity
- Confirmed vessel damage/sinkings
- Military statements confirming engagement
- Oil market reaction confirming closure

---

## Scenario 4: Prolonged Disruption

**Probability**: Low (5-10%)

**Trigger**: Full military conflict with Iran, sustained infrastructure attacks, multi-front escalation.

**Indicators**:
- US/coalition military strikes on Iranian soil
- Iranian attacks on regional oil infrastructure (Saudi, UAE)
- Hormuz closed for months
- Global depression scenario

**Impact**:
- Hormuz closed 3-12 months
- Global GDP contraction 2-5%
- Energy crisis in import-dependent nations
- Potential wider regional war

**Confirmation**:
- Multiple military engagements
- Confirmed infrastructure damage
- Extended high oil prices
- International economic emergency declarations

---

## Scenario 5: Wildcard: Asymmetric Escalation

**Probability**: Very Low (1-5%)

**Trigger**: Non-state actor attack, cyberattack on oil infrastructure, accidental escalation, or third-party provocation.

**Indicators**:
- Attribution unclear for initial incident
- Rapid escalation without clear diplomatic path
- Cyber infrastructure attacks
- Missile attacks on shipping from non-state territory

**Impact**:
- Highly variable depending on response
- Could trigger any of the above scenarios
- Attribution becomes key question
- Market volatility extreme

**Confirmation**:
- Official investigation into incident origin
- Attribution statements from governments
- Retaliatory actions (or lack thereof)
- Market reaction pattern diverging from fundamentals

---

## Probability Calibration

Monthly re-assessment based on:

| Signal Type | Weight | Source Type |
|-------------|--------|-------------|
| Official statements | High | Government |
| Naval movements | High | Satellite/OSINT |
| Shipping patterns | High | AIS/Industry |
| Insurance rates | Medium | Market |
| Social media | Low | Unverified |

---

## Signal Sources

### Authoritative

1. **UKMTO** (UK Maritime Trade Operations) - Maritime advisories
2. **MARAD/MSCI** (US Maritime Administration) - Risk advisories
3. **IEA** (International Energy Agency) - Energy statistics
4. **EIA** (US Energy Information Administration) - Chokepoint data

### Situation

1. **Reuters** - Shipping disruption coverage
2. **TankerTrackers** - Vessel tracking
3. **Marine Traffic** - AIS data
4. **Industry reports** - Major shipper announcements

### Context

1. **Regional media** - Local perspective
2. **Analyst reports** - Expert interpretation
3. **Government press** - Official framing

---

## Implementation in Mission Control

```typescript
interface HormuzScenario {
  scenario: 'managed' | 'controlled' | 'temporary' | 'prolonged' | 'wildcard';
  probability: { low: number; mid: number; high: number };
  triggers: string[];
  indicators: Indicator[];
  impact: ImpactLevel;
  horizon: string;
}

function assessScenario(signals: Signal[]): HormuzScenario {
  // Score incoming signals
  // Match against indicator patterns
  // Return most likely scenario with probability band
}
```

---

## References

- `research/hormuz-scenario-analysis.md` - Original scenario analysis
- `research/hormuz-risk-tracking-design.md` - Threat radar integration
- `packages/mission-control/docs/backend.md` - Mission Control backend
- `packages/sintel/CHARTER.md` - Perception layer
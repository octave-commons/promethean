// ---------------------------------------------------------------------------
// PersonalizationPanel — collapsible panel with dimension weight sliders
// and toggle switches for agency bias, critical thinking, and federation.
// ---------------------------------------------------------------------------

import { useState } from "react";
import type {
  Dimension,
  DimensionWeights,
  PersonalizationToggles,
} from "../hooks/usePersonalization";
import { DIMENSIONS } from "../hooks/usePersonalization";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PersonalizationPanelProps {
  readonly weights: DimensionWeights;
  readonly toggles: PersonalizationToggles;
  readonly onWeightChange: (dimension: Dimension, value: number) => void;
  readonly onToggleChange: (key: keyof PersonalizationToggles, value: boolean) => void;
  readonly onReset: () => void;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Dimension label mapping
// ---------------------------------------------------------------------------

const DIMENSION_LABELS: Record<Dimension, string> = {
  geopolitical: "Geopolitical",
  infrastructure: "Infrastructure",
  economic: "Economic",
  security: "Security",
  climate: "Climate",
  technology: "Technology",
};

// ---------------------------------------------------------------------------
// Toggle descriptions
// ---------------------------------------------------------------------------

const TOGGLE_INFO: Record<keyof PersonalizationToggles, { label: string; description: string }> = {
  agencyBias: {
    label: "Agency Bias",
    description: "Highlight actionable signals over informational ones",
  },
  criticalThinking: {
    label: "Critical Thinking",
    description: "Show more disagreement detail and source evaluation",
  },
  federation: {
    label: "Federation",
    description: "Enable Π lane federation with peer instances",
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WeightSlider({
  dimension,
  label,
  value,
  onChange,
}: {
  dimension: Dimension;
  label: string;
  value: number;
  onChange: (dimension: Dimension, value: number) => void;
}): JSX.Element {
  return (
    <div className="pz-slider-row" data-testid={`pz-slider-${dimension}`}>
      <label className="pz-slider-label" htmlFor={`pz-weight-${dimension}`}>
        {label}
      </label>
      <input
        id={`pz-weight-${dimension}`}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(dimension, Number(e.target.value))}
        className="pz-slider-input"
        data-testid={`pz-slider-input-${dimension}`}
        aria-label={`${label} weight`}
      />
      <span className="pz-slider-value" data-testid={`pz-slider-value-${dimension}`}>
        {value}
      </span>
    </div>
  );
}

function ToggleSwitch({
  toggleKey,
  label,
  description,
  checked,
  onChange,
}: {
  toggleKey: keyof PersonalizationToggles;
  label: string;
  description: string;
  checked: boolean;
  onChange: (key: keyof PersonalizationToggles, value: boolean) => void;
}): JSX.Element {
  return (
    <div className="pz-toggle-row" data-testid={`pz-toggle-${toggleKey}`}>
      <div className="pz-toggle-info">
        <span className="pz-toggle-label">{label}</span>
        <span className="pz-toggle-description">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`pz-toggle-switch ${checked ? "pz-toggle-on" : "pz-toggle-off"}`}
        data-testid={`pz-toggle-switch-${toggleKey}`}
        onClick={() => onChange(toggleKey, !checked)}
      >
        <span className="pz-toggle-thumb" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PersonalizationPanel({
  weights,
  toggles,
  onWeightChange,
  onToggleChange,
  onReset,
  className,
}: PersonalizationPanelProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`pz-panel ${collapsed ? "pz-panel--collapsed" : "pz-panel--expanded"} ${className ?? ""}`.trim()}
      data-testid="personalization-panel"
    >
      <button
        type="button"
        className="pz-panel-toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        data-testid="pz-panel-toggle"
      >
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 3v14M3 10h14" strokeLinecap="round" />
          {!collapsed && <path d="M3 10h14" strokeLinecap="round" />}
        </svg>
        <span>Personalization</span>
        <span className="pz-panel-chevron">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <div className="pz-panel-body" data-testid="pz-panel-body">
          {/* Weight sliders */}
          <div className="pz-section">
            <h4 className="pz-section-title">Dimension Weights</h4>
            <p className="pz-section-hint">
              Adjust how each dimension affects the overall score (0 = ignore, 50 = neutral, 100 = amplify)
            </p>
            {DIMENSIONS.map((dim) => (
              <WeightSlider
                key={dim}
                dimension={dim}
                label={DIMENSION_LABELS[dim]}
                value={weights[dim]}
                onChange={onWeightChange}
              />
            ))}
          </div>

          {/* Toggle switches */}
          <div className="pz-section">
            <h4 className="pz-section-title">Modes</h4>
            {(Object.keys(TOGGLE_INFO) as Array<keyof PersonalizationToggles>).map((key) => (
              <ToggleSwitch
                key={key}
                toggleKey={key}
                label={TOGGLE_INFO[key].label}
                description={TOGGLE_INFO[key].description}
                checked={toggles[key]}
                onChange={onToggleChange}
              />
            ))}
          </div>

          {/* Reset button */}
          <button
            type="button"
            className="pz-reset-btn"
            onClick={onReset}
            data-testid="pz-reset-btn"
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </aside>
  );
}

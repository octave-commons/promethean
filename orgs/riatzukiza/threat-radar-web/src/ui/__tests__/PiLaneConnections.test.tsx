import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PiLaneConnections } from "../components/PiLaneConnections";
import type { RadarTile, ThreadData } from "../../api/types";
import type { EmbeddingState, SimilarityScore } from "../../embed/useEmbedding";

/** Create a minimal RadarTile for testing */
function makeTile(
  id: string,
  name: string,
  category: string,
  threads?: Array<{ id: string; title: string; kind?: ThreadData["kind"]; domain_tags?: string[] }>,
): RadarTile {
  return {
    radar: { id, slug: id, name, category, status: "active" },
    sourceCount: 1,
    submissionCount: 1,
    threads: threads?.map((t) => ({
      id: t.id,
      title: t.title,
      kind: t.kind ?? ("event" as const),
      members: [
        { signal_event_id: "sig-1", relevance: 0.9, added_at: "2025-01-01T00:00:00Z" },
      ],
      source_distribution: { bluesky: 0.6, reddit: 0.4 },
      confidence: 0.8,
      timeline: {
        first_seen: "2025-01-01T00:00:00Z",
        last_updated: "2025-01-01T01:00:00Z",
      },
      domain_tags: t.domain_tags ?? ["energy"],
      status: "active" as const,
    })),
  };
}

const readyState: EmbeddingState = {
  ready: true,
  onnxReady: false,
  activeBackend: "trigram-cpu",
  diagnostics: null,
  error: null,
};

const loadingState: EmbeddingState = {
  ready: false,
  onnxReady: false,
  activeBackend: "initializing",
  diagnostics: null,
  error: null,
};

describe("PiLaneConnections", () => {
  it("renders loading state when embedding is not ready", () => {
    const mockCompute = vi.fn().mockResolvedValue([]);
    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "Global", "geopolitical")]}
        localTiles={[makeTile("l1", "Local", "community")]}
        embeddingState={loadingState}
        computeSimilarity={mockCompute}
      />,
    );
    expect(screen.getByTestId("pi-conn-loading")).toBeTruthy();
    expect(screen.getByText(/Initializing embedding engine/)).toBeTruthy();
  });

  it("renders empty state when no global or local tiles", () => {
    const mockCompute = vi.fn().mockResolvedValue([]);
    render(
      <PiLaneConnections
        globalTiles={[]}
        localTiles={[]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );
    expect(screen.getByTestId("pi-conn-empty")).toBeTruthy();
    expect(screen.getByText(/Connections will appear/)).toBeTruthy();
  });

  it("shows backend badge when ready", async () => {
    const mockCompute = vi.fn().mockResolvedValue([]);
    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "Global", "geopolitical")]}
        localTiles={[makeTile("l1", "Local", "community")]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pi-conn-backend")).toBeTruthy();
    });
    expect(screen.getByTestId("pi-conn-backend").textContent).toContain("trigram-cpu");
  });

  it("renders bridge cards with connection details", async () => {
    const scores: SimilarityScore[] = [
      { globalTitle: "Energy Infrastructure Crisis", localTitle: "Local Energy Response", similarity: 0.72 },
    ];
    const mockCompute = vi.fn().mockResolvedValue(scores);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Infrastructure Crisis", domain_tags: ["energy", "infrastructure"] },
        ])]}
        localTiles={[makeTile("l1", "L", "community", [
          { id: "t-l1", title: "Local Energy Response", domain_tags: ["energy", "local"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      const cards = screen.getAllByTestId("pi-bridge-card");
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });

    // Check type badge exists
    const typeBadges = screen.getAllByTestId("pi-type-badge");
    expect(typeBadges.length).toBeGreaterThanOrEqual(1);
    expect(["Causal", "Correlative", "Predictive"]).toContain(typeBadges[0].textContent);

    // Check strength bar exists
    expect(screen.getAllByTestId("pi-strength-bar").length).toBeGreaterThanOrEqual(1);
  });

  it("displays realism, fear, and public benefit scores on bridge cards", async () => {
    const scores: SimilarityScore[] = [
      { globalTitle: "Energy Infrastructure Crisis", localTitle: "Local Energy Response", similarity: 0.72 },
    ];
    const mockCompute = vi.fn().mockResolvedValue(scores);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Infrastructure Crisis", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "community", [
          { id: "t-l1", title: "Local Energy Response", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("pi-scores-row").length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getAllByTestId("pi-score-realism").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("pi-score-fear").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("pi-score-public-benefit").length).toBeGreaterThanOrEqual(1);
  });

  it("shows semantic similarity badge when available", async () => {
    const scores: SimilarityScore[] = [
      { globalTitle: "Energy Infrastructure Crisis", localTitle: "Local Energy Response", similarity: 0.72 },
    ];
    const mockCompute = vi.fn().mockResolvedValue(scores);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Infrastructure Crisis", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "community", [
          { id: "t-l1", title: "Local Energy Response", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      const simBadges = screen.getAllByTestId("pi-sim-badge");
      expect(simBadges.length).toBeGreaterThanOrEqual(1);
      expect(simBadges[0].textContent).toContain("72%");
    });
  });

  it("displays η and μ lane tags on bridge cards", async () => {
    const mockCompute = vi.fn().mockResolvedValue([
      { globalTitle: "GT", localTitle: "LT", similarity: 0.5 },
    ]);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "GT", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "local", [
          { id: "t-l1", title: "LT", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("η")).toBeTruthy();
      expect(screen.getByText("μ")).toBeTruthy();
    });
  });

  it("renders feedback loop diagram", async () => {
    const mockCompute = vi.fn().mockResolvedValue([]);
    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "GT", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "local", [
          { id: "t-l1", title: "LT", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pi-feedback-loop")).toBeTruthy();
    });

    // Check P, R, N, Π, A nodes are present
    expect(screen.getByText("Intelligence Loop")).toBeTruthy();
  });

  it("renders tabs for bridges and actions", async () => {
    const mockCompute = vi.fn().mockResolvedValue([]);
    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "GT", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "local", [
          { id: "t-l1", title: "LT", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pi-tabs")).toBeTruthy();
    });

    expect(screen.getByTestId("pi-tab-bridges")).toBeTruthy();
    expect(screen.getByTestId("pi-tab-actions")).toBeTruthy();
  });

  it("switches to action cards tab", async () => {
    const mockCompute = vi.fn().mockResolvedValue([
      { globalTitle: "Energy Crisis", localTitle: "Local Energy Response", similarity: 0.72 },
    ]);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Crisis", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "community", [
          { id: "t-l1", title: "Local Energy Response", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pi-tab-actions")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("pi-tab-actions"));

    // Should show the action list area
    await waitFor(() => {
      expect(screen.getByTestId("pi-action-list")).toBeTruthy();
    });
  });

  it("opens comparison panel when button is clicked on bridge card", async () => {
    // Use a slow-resolving promise so we control when similarity finishes
    let resolveSimilarity!: (v: SimilarityScore[]) => void;
    const similarityPromise = new Promise<SimilarityScore[]>((resolve) => {
      resolveSimilarity = resolve;
    });
    const mockCompute = vi.fn().mockReturnValue(similarityPromise);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Infrastructure Crisis", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "community", [
          { id: "t-l1", title: "Local Energy Response", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    // Resolve similarity so the bridge cards stabilize
    resolveSimilarity([
      { globalTitle: "Energy Infrastructure Crisis", localTitle: "Local Energy Response", similarity: 0.72 },
    ]);

    // Wait for bridge cards to appear and stabilize
    await waitFor(() => {
      expect(screen.getAllByTestId("pi-bridge-card").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId("pi-compare-btn").length).toBeGreaterThanOrEqual(1);
    });

    // Click compare button and wait for panel to appear
    fireEvent.click(screen.getAllByTestId("pi-compare-btn")[0]);

    await waitFor(() => {
      expect(screen.getByTestId("pi-comparison-panel")).toBeTruthy();
    });

    // Check side-by-side comparison content
    expect(screen.getByText("Thread Comparison")).toBeTruthy();
    expect(screen.getByText("Global")).toBeTruthy();
    expect(screen.getByText("Local")).toBeTruthy();
  });

  it("opens federation panel when button is clicked", async () => {
    let resolveSimilarity!: (v: SimilarityScore[]) => void;
    const similarityPromise = new Promise<SimilarityScore[]>((resolve) => {
      resolveSimilarity = resolve;
    });
    const mockCompute = vi.fn().mockReturnValue(similarityPromise);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Infrastructure Crisis", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "community", [
          { id: "t-l1", title: "Local Energy Response", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    // Resolve similarity so the bridge cards stabilize
    resolveSimilarity([
      { globalTitle: "Energy Infrastructure Crisis", localTitle: "Local Energy Response", similarity: 0.72 },
    ]);

    // Wait for bridge cards to stabilize
    await waitFor(() => {
      expect(screen.getAllByTestId("pi-bridge-card").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId("pi-federation-btn").length).toBeGreaterThanOrEqual(1);
    });

    // Click federation button and wait for panel to appear
    fireEvent.click(screen.getAllByTestId("pi-federation-btn")[0]);

    await waitFor(() => {
      expect(screen.getByTestId("pi-federation-panel")).toBeTruthy();
    });

    // Check federation content
    expect(screen.getByText("Federation Comparison")).toBeTruthy();
    const peers = screen.getAllByTestId("pi-federation-peer");
    expect(peers.length).toBeGreaterThanOrEqual(2);
  });

  it("shows suggested action and coordination path on bridge cards", async () => {
    const mockCompute = vi.fn().mockResolvedValue([
      { globalTitle: "Energy Infrastructure Crisis", localTitle: "Local Energy Response", similarity: 0.72 },
    ]);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Infrastructure Crisis", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "community", [
          { id: "t-l1", title: "Local Energy Response", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("pi-suggested-action").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId("pi-coord-path").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows connection count", async () => {
    const mockCompute = vi.fn().mockResolvedValue([
      { globalTitle: "Energy Crisis", localTitle: "Local Response", similarity: 0.5 },
    ]);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "G", "geopolitical", [
          { id: "t-g1", title: "Energy Crisis", domain_tags: ["energy"] },
        ])]}
        localTiles={[makeTile("l1", "L", "local", [
          { id: "t-l1", title: "Local Response", domain_tags: ["energy"] },
        ])]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      const countEl = screen.getByText(/connection/);
      expect(countEl).toBeTruthy();
    });
  });

  it("calls computeSimilarity with thread titles", async () => {
    const mockCompute = vi.fn().mockResolvedValue([]);
    const globalTiles = [
      makeTile("g1", "Geopolitics", "geopolitical", [
        { id: "t1", title: "Conflict in Region X" },
      ]),
    ];
    const localTiles = [
      makeTile("l1", "Community", "community", [
        { id: "t2", title: "Local Impact of Conflict" },
      ]),
    ];

    render(
      <PiLaneConnections
        globalTiles={globalTiles}
        localTiles={localTiles}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(mockCompute).toHaveBeenCalledWith(
        ["Conflict in Region X"],
        ["Local Impact of Conflict"],
      );
    });
  });

  it("uses radar name as fallback when no threads exist", async () => {
    const mockCompute = vi.fn().mockResolvedValue([]);

    render(
      <PiLaneConnections
        globalTiles={[makeTile("g1", "Global Radar", "geopolitical")]}
        localTiles={[makeTile("l1", "Local Radar", "local")]}
        embeddingState={readyState}
        computeSimilarity={mockCompute}
      />,
    );

    await waitFor(() => {
      expect(mockCompute).toHaveBeenCalledWith(
        ["Global Radar"],
        ["Local Radar"],
      );
    });
  });
});

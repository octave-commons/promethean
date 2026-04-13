import assert from "node:assert/strict"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import { LithNexusService } from "./service.js"

async function writeFixture(filePath: string, text: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${text.trim()}\n`, "utf8")
}

async function createFixtureRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "lith-nexus-"))
  await writeFixture(
    path.join(root, ".opencode", "promptdb", "demo.intent.lisp"),
    `
(packet
  (v "opencode.packet/v1")
  (id "demo:packet")
  (kind :intent)
  (title "Demo Packet")
  (tags [:demo :nexus])
  (routing (target :eta-mu-world) (handler :orchestrate) (mode :apply))
  (refs ["contracts/demo.contract.lisp"]))
    `,
  )
  await writeFixture(
    path.join(root, ".opencode", "promptdb", "contracts", "demo.contract.lisp"),
    `(contract "demo.contract/v1" (title "Demo Contract") (tags [:demo]))`,
  )
  await writeFixture(
    path.join(root, ".opencode", "protocol", "demo.v1.lisp"),
    `(protocol demo.v1 (required (demo :bool)))`,
  )
  await writeFixture(
    path.join(root, "contracts", "demo.contract.lisp"),
    `(contract "contracts.demo/v1" (title "Contracts Demo") (tags [:contract :demo]))`,
  )
  await writeFixture(
    path.join(root, "manifest.lith"),
    `(manifest (id "demo:manifest") (title "Demo Manifest") (tags [:manifest]))`,
  )
  await writeFixture(
    path.join(root, "specs", "demo.md"),
    `
# Demo

\`\`\`lith
(fact (ctx 世) (claim "spec fact") (source (path ".opencode/promptdb/demo.intent.lisp")))
\`\`\`
    `,
  )
  return root
}

test("service reads resources and queries canonical graph", async () => {
  const repoRoot = await createFixtureRepo()
  const pythonWorkdir = path.resolve(import.meta.dirname, "..", "..", "part64")
  const service = new LithNexusService(repoRoot, pythonWorkdir)

  try {
    const manifest = await service.readResource("lith://repo/manifest.lith")
    assert.equal(manifest.mimeType, "text/x-lith")
    assert.match(manifest.text, /demo:manifest/)

    const matches = await service.find({ query: "demo:packet", limit: 5 })
    assert.equal(matches[0]?.node.id, "demo:packet")

    const rows = await service.query(`(query (select [:id :kind :title]) (where (kind :packet) (tag :demo)) (limit 5))`)
    assert.equal(rows.length, 1)
    assert.equal(rows[0]?.id, "demo:packet")

    const node = await service.readResource("lith://graph/node/demo%3Apacket")
    assert.match(node.text, /Demo Packet/)
  } finally {
    await rm(repoRoot, { recursive: true, force: true })
  }
})

test("service writes deterministic facts and resources", async () => {
  const repoRoot = await createFixtureRepo()
  const pythonWorkdir = path.resolve(import.meta.dirname, "..", "..", "part64")
  const service = new LithNexusService(repoRoot, pythonWorkdir)

  try {
    const firstFact = await service.createFact({
      factLith: `(fact (id "demo:fact") (title "Demo Fact") (tags [:demo]))`,
    })
    const secondFact = await service.createFact({
      factLith: `(fact (id "demo:fact") (title "Demo Fact") (tags [:demo]))`,
    })
    assert.equal(firstFact.status, "created")
    assert.equal(secondFact.status, "noop")

    const createdResource = await service.createResource({
      kind: ":resource",
      title: "Cache Resource",
      tags: [":cache", ":demo"],
      links: [{ uri: "contracts/demo.contract.lisp", rel: ":depends_on" }],
    })
    assert.equal(createdResource.status, "created")

    const createdPath = path.join(repoRoot, String(createdResource.path))
    const createdText = await readFile(createdPath, "utf8")
    assert.match(createdText, /Cache Resource/)

    const matches = await service.find({ query: "Cache Resource", limit: 10 })
    assert.ok(matches.some((match) => match.node.title === "Cache Resource"))
  } finally {
    await rm(repoRoot, { recursive: true, force: true })
  }
})

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVICE = process.env.BLUESKY_SERVICE || 'https://bsky.social';
const IDENTIFIER = process.env.BLUESKY_IDENTIFIER;
const PASSWORD = process.env.BLUESKY_APP_PASSWORD;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundleRoot = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
const DRY_RUN = process.argv.includes('--dry-run') || !IDENTIFIER || !PASSWORD;
const payloadArg = args.find((arg) => !arg.startsWith('-'));
const payloadPath = payloadArg ? path.resolve(payloadArg) : path.resolve(bundleRoot, 'data/social_payloads.latest.json');
const payloads = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
const post = normalizePost(payloads.bluesky, payloadPath);

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

function normalizePost(rawPost, sourcePath) {
  if (!rawPost || typeof rawPost.text !== 'string' || rawPost.text.trim() === '') {
    throw new Error('Bluesky payload missing text');
  }

  if (!rawPost.image || typeof rawPost.image.path !== 'string' || rawPost.image.path.trim() === '') {
    throw new Error('Bluesky payload missing image metadata; rebuild it with build_social_payloads.mjs');
  }

  const payloadDir = path.dirname(sourcePath);
  const imagePath = path.isAbsolute(rawPost.image.path)
    ? rawPost.image.path
    : path.resolve(payloadDir, rawPost.image.path);

  return {
    text: rawPost.text,
    image: {
      ...rawPost.image,
      path: imagePath,
    },
    thread: Array.isArray(rawPost.thread)
      ? rawPost.thread.filter((entry) => typeof entry === 'string' && entry.trim() !== '')
      : [],
  };
}

async function expectOk(response, label) {
  if (response.ok) return response;
  const errBody = await response.text().catch(() => '');
  throw new Error(`${label}: ${response.status}${errBody ? ` ${errBody}` : ''}`);
}

function strongRefFrom(result, label) {
  if (!result || typeof result.uri !== 'string' || typeof result.cid !== 'string') {
    throw new Error(`${label} response missing uri/cid`);
  }

  return {
    uri: result.uri,
    cid: result.cid,
  };
}

async function createRecord(session, record, label) {
  const response = await fetch(`${SERVICE}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify(record),
  });

  await expectOk(response, label);
  return response.json();
}

if (DRY_RUN) {
  console.log(JSON.stringify({platform: 'bluesky', dryRun: true, service: SERVICE, payloadPath, post}, null, 2));
  process.exit(0);
}

const loginResp = await fetch(`${SERVICE}/xrpc/com.atproto.server.createSession`, {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify({identifier: IDENTIFIER, password: PASSWORD}),
});
await expectOk(loginResp, 'Bluesky login failed');
const session = await loginResp.json();

const bytes = fs.readFileSync(post.image.path);
const uploadResp = await fetch(`${SERVICE}/xrpc/com.atproto.repo.uploadBlob`, {
  method: 'POST',
  headers: {
    'content-type': post.image.mimeType || mimeFor(post.image.path),
    authorization: `Bearer ${session.accessJwt}`,
  },
  body: bytes,
});
await expectOk(uploadResp, 'Bluesky image upload failed');
const blob = await uploadResp.json();
const embed = {
  $type: 'app.bsky.embed.images',
  images: [{
    alt: post.image.alt || 'Hormuz Risk Clock image',
    image: blob.blob || blob,
  }],
};

const rootResult = await createRecord(session, {
  repo: session.did,
  collection: 'app.bsky.feed.post',
  record: {
    $type: 'app.bsky.feed.post',
    text: post.text,
    createdAt: new Date().toISOString(),
    embed,
  },
}, 'Bluesky post failed');

const rootRef = strongRefFrom(rootResult, 'Bluesky post');
const replies = [];
let parentRef = rootRef;

for (const text of post.thread) {
  const replyResult = await createRecord(session, {
    repo: session.did,
    collection: 'app.bsky.feed.post',
    record: {
      $type: 'app.bsky.feed.post',
      text,
      createdAt: new Date().toISOString(),
      reply: {
        root: rootRef,
        parent: parentRef,
      },
    },
  }, 'Bluesky thread reply failed');

  parentRef = strongRefFrom(replyResult, 'Bluesky thread reply');
  replies.push(replyResult);
}

console.log(JSON.stringify({root: rootResult, replies}, null, 2));

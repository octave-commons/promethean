import anyTest, { type TestFn } from 'ava';

import { isExpiredDiscordCdnImageUrl } from './assembler.js';

interface TestContext {}

const test = anyTest as TestFn<TestContext>;

test('detects expired Discord CDN image URLs', (t) => {
  const expiredAtMs = Date.parse('2026-03-27T06:33:45Z');
  const url = 'https://cdn.discordapp.com/attachments/1444189585373663417/1486614114141999104/image.png?ex=69c624c8&is=69c4d348&hm=81e70d73a2419d8e974ed81bebdb3c466ab69a015dd5694a3ecd54c954252ee1&';

  t.true(isExpiredDiscordCdnImageUrl(url, expiredAtMs));
});

test('keeps live Discord CDN image URLs eligible', (t) => {
  const beforeExpiryMs = Date.parse('2026-03-27T16:34:00Z');
  const url = 'https://cdn.discordapp.com/attachments/1444142673580658739/1486791757797658624/image.png?ex=69c6ca3a&is=69c578ba&hm=3fe5f108fb7b65257236e6b52e8afe79c32b272ff580c469a5fddeca434ce3b4&';

  t.false(isExpiredDiscordCdnImageUrl(url, beforeExpiryMs));
});

test('ignores non-Discord URLs', (t) => {
  t.false(isExpiredDiscordCdnImageUrl('https://example.com/cat.png', Date.now()));
});

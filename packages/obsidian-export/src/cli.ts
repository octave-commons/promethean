// GPL-3.0-only
import { convertVault } from './convert.js';

type Args = { src: string; out: string };
const parse = (argv: string[]): Args => {
  const get = (k: string, d?: string) => {
    const i = argv.indexOf(`--${k}`);
    return i >= 0 ? argv[i + 1] : d;
  };
  const src = get('src') ?? 'docs';
  const out = get('out') ?? 'docs.github';
  return { src, out };
};

const main = async () => {
  const { src, out } = parse(process.argv.slice(2));
  await convertVault({ srcDir: src, outDir: out });
  console.log(`Converted: ${src} → ${out}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Component Classification Script
 * Classifies discovered components into tiers and identifies extraction candidates
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');

// Classification rules
const PRIMITIVES = {
  // HTML-native elements wrapped
  button: ['Button', 'button', 'IconButton', 'Toggle'],
  input: ['Input', 'input', 'TextArea', 'TextField', 'Checkbox', 'Radio', 'Select', 'Switch'],
  icon: ['Icon', 'IconBox', 'SvgIcon'],
  badge: ['Badge', 'Chip', 'Tag', 'Label'],
  avatar: ['Avatar', 'UserAvatar'],
  image: ['Image', 'Img', 'Picture'],
  spinner: ['Spinner', 'Loader', 'Loading', 'Progress'],
  tooltip: ['Tooltip', 'Popover'],
  card: ['Card', 'Paper', 'Surface'],
  divider: ['Divider', 'Separator', 'Hr'],
  link: ['Link', 'A', 'Anchor'],
  text: ['Text', 'Typography', 'Heading', 'Title', 'Subtitle', 'Description', 'Paragraph', 'Span']
};

const COMPOSITES = {
  modal: ['Modal', 'Dialog', 'Drawer', 'Sheet', 'AlertDialog'],
  dropdown: ['Dropdown', 'Menu', 'ContextMenu', 'SelectMenu', 'Combobox'],
  tabs: ['Tabs', 'TabList', 'TabPanel', 'TabGroup'],
  table: ['Table', 'DataTable', 'DataGrid', 'List', 'VirtualList'],
  form: ['Form', 'FormField', 'FormControl', 'FormLabel', 'FormItem'],
  navigation: ['Nav', 'Navbar', 'Sidebar', 'Header', 'Footer', 'Menu', 'Breadcrumb'],
  search: ['SearchBar', 'SearchInput', 'Search'],
  command: ['CommandPalette', 'CommandMenu', 'Command', 'KeyboardShortcuts'],
  toast: ['Toast', 'Notification', 'Alert', 'Snackbar'],
  accordion: ['Accordion', 'Collapsible', 'Expandable'],
  calendar: ['Calendar', 'DatePicker', 'DateRange'],
  skeleton: ['Skeleton', 'SkeletonLoader', 'LoadingPlaceholder'],
  avatarGroup: ['AvatarGroup', 'UserStack'],
  code: ['Code', 'CodeBlock', 'SyntaxHighlighter']
};

const APP_SPECIFIC_PATTERNS = [
  /threat/i, /radar/i, /gates?[- ]?of[- ]?aker/i, /promethean/i,
  /ollama/i, /openai/i, /anthropic/i, /chat/i, /message/i,
  /session/i, /workspace/i, /project/i, /agent/i, /model/i,
  /usage/i, /quota/i, /billing/i, /subscription/i,
  /dashboard/i, /admin/i, /settings/i, /profile/i,
  /kanban/i, /board/i, /column/i, /task/i
];

// Framework detection
const FRAMEWORK_PATTERNS = {
  solidjs: ['Show', 'For', 'Match', 'Switch', 'Portal', 'Dynamic', 'Suspense', 'SuspenseList', 'ErrorBoundary'],
  react: ['useState', 'useEffect', 'useContext', 'useRef', 'useMemo', 'useCallback'],
  reagent: ['r/atom', 'reagent.core', 'ratom', 'reaction', 'create-class'],
  reframe: ['subscribe', 'dispatch', 'reg-event-db', 'reg-sub', '<sub', '>evt']
};

function classifyComponent(name, frequency) {
  const nameLower = name.toLowerCase();
  
  // Check if app-specific first
  for (const pattern of APP_SPECIFIC_PATTERNS) {
    if (pattern.test(name)) {
      return { tier: 'app-specific', category: 'domain', reason: `Matches domain pattern: ${pattern}` };
    }
  }
  
  // Check primitives
  for (const [category, names] of Object.entries(PRIMITIVES)) {
    for (const n of names) {
      if (nameLower === n.toLowerCase() || nameLower.includes(n.toLowerCase())) {
        return { tier: 'primitive', category, reason: `Matches primitive pattern: ${n}` };
      }
    }
  }
  
  // Check composites
  for (const [category, names] of Object.entries(COMPOSITES)) {
    for (const n of names) {
      if (nameLower === n.toLowerCase() || nameLower.includes(n.toLowerCase())) {
        return { tier: 'composite', category, reason: `Matches composite pattern: ${n}` };
      }
    }
  }
  
  // High frequency components likely to be reusable
  if (frequency >= 5) {
    return { tier: 'candidate', category: 'uncategorized', reason: `High frequency (${frequency}) suggests reusability` };
  }
  
  return { tier: 'unknown', category: 'uncategorized', reason: 'Does not match known patterns' };
}

function detectFramework(usages) {
  const detected = new Set();
  
  for (const usage of usages || []) {
    const source = usage.source || '';
    const file = usage.file || '';
    
    if (source.includes('solid-js') || file.includes('solid')) {
      detected.add('solidjs');
    }
    if (source.includes('react') || source.includes('React')) {
      detected.add('react');
    }
    if (file.endsWith('.cljs') || file.endsWith('.cljc')) {
      detected.add('cljs');
    }
  }
  
  return [...detected];
}

function analyze() {
  const freqPath = join(ROOT, 'tools', 'ui-audit', 'component-frequency.json');
  const freq = JSON.parse(readFileSync(freqPath, 'utf-8'));
  
  const classification = {
    generated: new Date().toISOString(),
    summary: {
      totalComponents: 0,
      byTier: {},
      byCategory: {},
      byFramework: {}
    },
    extractionCandidates: [],
    primitives: [],
    composites: [],
    appSpecific: [],
    unknown: []
  };
  
  // Process TSX/JSX components
  for (const comp of freq.frequency.tsxJsx.defined) {
    const { name, count, usages } = comp;
    const { tier, category, reason } = classifyComponent(name, count);
    const frameworks = detectFramework(usages);
    
    const entry = {
      name,
      frequency: count,
      tier,
      category,
      frameworks,
      reason,
      files: usages?.slice(0, 5).map(u => u.file) || []
    };
    
    classification.summary.totalComponents++;
    classification.summary.byTier[tier] = (classification.summary.byTier[tier] || 0) + 1;
    classification.summary.byCategory[category] = (classification.summary.byCategory[category] || 0) + 1;
    
    for (const fw of frameworks) {
      classification.summary.byFramework[fw] = (classification.summary.byFramework[fw] || 0) + 1;
    }
    
    if (tier === 'primitive') {
      classification.primitives.push(entry);
    } else if (tier === 'composite') {
      classification.composites.push(entry);
    } else if (tier === 'app-specific') {
      classification.appSpecific.push(entry);
    } else if (tier === 'candidate' || count >= 3) {
      classification.extractionCandidates.push(entry);
    } else {
      classification.unknown.push(entry);
    }
  }
  
  // Process used components (these are the real usage patterns)
  const usedComponents = {};
  for (const comp of freq.frequency.tsxJsx.used) {
    const { name, count, usages } = comp;
    const { tier, category, reason } = classifyComponent(name, count);
    
    if (!usedComponents[name]) {
      usedComponents[name] = {
        name,
        frequency: count,
        tier,
        category,
        reason,
        propPatterns: new Set(),
        files: []
      };
    }
    
    // Collect prop patterns
    for (const u of usages || []) {
      if (u.props) {
        for (const p of u.props) {
          usedComponents[name].propPatterns.add(p.name);
        }
      }
      if (usedComponents[name].files.length < 10) {
        usedComponents[name].files.push(u.file);
      }
    }
  }
  
  // Convert Sets to arrays
  for (const name of Object.keys(usedComponents)) {
    usedComponents[name].propPatterns = [...usedComponents[name].propPatterns];
  }
  
  // Sort by frequency
  classification.primitives.sort((a, b) => b.frequency - a.frequency);
  classification.composites.sort((a, b) => b.frequency - a.frequency);
  classification.extractionCandidates.sort((a, b) => b.frequency - a.frequency);
  classification.appSpecific.sort((a, b) => b.frequency - a.frequency);
  
  // Create used components summary
  classification.usedComponents = Object.values(usedComponents)
    .filter(c => c.tier !== 'unknown' || c.frequency >= 5)
    .sort((a, b) => b.frequency - a.frequency);
  
  // Write output
  const outPath = join(ROOT, 'tools', 'ui-audit', 'component-classification.json');
  writeFileSync(outPath, JSON.stringify(classification, null, 2));
  
  console.error('\n=== Classification Summary ===');
  console.error(`Total components: ${classification.summary.totalComponents}`);
  console.error('\nBy Tier:');
  for (const [tier, count] of Object.entries(classification.summary.byTier).sort((a, b) => b[1] - a[1])) {
    console.error(`  ${tier}: ${count}`);
  }
  console.error('\nBy Category:');
  for (const [cat, count] of Object.entries(classification.summary.byCategory).sort((a, b) => b[1] - a[1])) {
    console.error(`  ${cat}: ${count}`);
  }
  console.error('\nBy Framework:');
  for (const [fw, count] of Object.entries(classification.summary.byFramework).sort((a, b) => b[1] - a[1])) {
    console.error(`  ${fw}: ${count}`);
  }
  
  console.error('\n=== Top 20 Primitives ===');
  for (const c of classification.primitives.slice(0, 20)) {
    console.error(`  ${c.name}: ${c.frequency} files [${c.category}]`);
  }
  
  console.error('\n=== Top 20 Composites ===');
  for (const c of classification.composites.slice(0, 20)) {
    console.error(`  ${c.name}: ${c.frequency} files [${c.category}]`);
  }
  
  console.error('\n=== Top 20 Extraction Candidates ===');
  for (const c of classification.extractionCandidates.slice(0, 20)) {
    console.error(`  ${c.name}: ${c.frequency} files (${c.reason})`);
  }
  
  console.error('\n=== Top 30 Used Components ===');
  for (const c of classification.usedComponents.slice(0, 30)) {
    const props = c.propPatterns.slice(0, 5).join(', ');
    console.error(`  ${c.name}: ${c.frequency} usages [${c.tier}] props: ${props || 'none'}`);
  }
  
  console.error(`\nOutput written to: ${outPath}`);
  
  return classification;
}

analyze();

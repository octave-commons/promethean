import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { ExtractedData, Link, ProcessingContext } from '../types/index.js';

type MarkdownNode = {
  type: string;
  value?: string;
  children?: MarkdownNode[];
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
};

interface LinkNode extends MarkdownNode {
  type: 'link';
  url: string;
  children: MarkdownNode[];
}

interface WikilinkNode extends MarkdownNode {
  type: 'text';
  value: string;
}

interface WikilinkNode extends Node {
  type: 'text';
  value: string;
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export class MarkdownProcessor {
  private processor = unified().use(remarkParse).use(remarkGfm);

  async process(content: string, context: ProcessingContext): Promise<ExtractedData> {
    const tree = this.processor.parse(content);
    const links: Link[] = [];
    const wikilinks: Link[] = [];
    const visitTree = visit as unknown as (
      tree: unknown,
      test: string,
      visitor: (node: unknown) => void,
    ) => void;

    visitTree(tree, 'link', (node: unknown) => {
      const linkNode = node as LinkNode;
      if (linkNode.url && linkNode.position) {
        const link: Link = {
          url: linkNode.url,
          text: this.extractText(linkNode),
          type: this.getLinkType(linkNode.url),
          lineNumber: linkNode.position.start.line,
        };
        links.push(link);
      }
    });

    visitTree(tree, 'text', (node: unknown) => {
      const textNode = node as WikilinkNode;
      if (!textNode.value) {
        return;
      }
      const wikilinkMatches = this.extractWikilinks(textNode.value);
      for (const match of wikilinkMatches) {
        if (textNode.position) {
          const wikilink: Link = {
            url: match.link,
            text: match.text,
            type: 'wikilink',
            lineNumber: textNode.position.start.line,
          };
          wikilinks.push(wikilink);
        }
      }
    });

    return {
      links: [...links, ...wikilinks],
      imports: [],
      dependencies: [],
      metadata: {
        processingContext: context,
        processedAt: new Date().toISOString(),
      },
    };
  }

  private extractText(node: LinkNode): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }

    return node.children
      .map((child) => {
        if (child.type === 'text') {
          return (child as any).value;
        }
        return '';
      })
      .join('')
      .trim();
  }

  private getLinkType(url: string): 'markdown' | 'external' {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return 'external';
    }
    return 'markdown';
  }

  private extractWikilinks(text: string): Array<{ link: string; text: string }> {
    const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
    const matches: Array<{ link: string; text: string }> = [];

    let match: RegExpExecArray | null;
    while ((match = wikilinkRegex.exec(text)) !== null) {
      const rawContent = match[1];
      if (!rawContent) {
        continue;
      }
      const [link, displayText] = rawContent.split('|').map((segment) => segment.trim());
      const resolvedLink = link || rawContent;
      const resolvedText = displayText || link || rawContent;
      matches.push({
        link: resolvedLink,
        text: resolvedText,
      });
    }

    return matches;
  }
}

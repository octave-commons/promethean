import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { Node } from 'unist'
import { ExtractedData, Link, ProcessingContext } from '../../types/index.js'

interface LinkNode extends Node {
  type: 'link'
  url: string
  children: Node[]
  position?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
}

interface WikilinkNode extends Node {
  type: 'text'
  value: string
  position?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
}

export class MarkdownProcessor {
  private processor = unified()
    .use(remarkParse)
    .use(remarkGfm)

  async process(content: string, context: ProcessingContext): Promise<ExtractedData> {
    const tree = this.processor.parse(content)
    const links: Link[] = []
    const wikilinks: Link[] = []

    visit(tree, 'link', (node: LinkNode) => {
      if (node.url && node.position) {
        const link: Link = {
          url: node.url,
          text: this.extractText(node),
          type: this.getLinkType(node.url),
          lineNumber: node.position.start.line
        }
        links.push(link)
      }
    })

    visit(tree, 'text', (node: WikilinkNode) => {
      const wikilinkMatches = this.extractWikilinks(node.value)
      for (const match of wikilinkMatches) {
        if (node.position) {
          const wikilink: Link = {
            url: match.link,
            text: match.text,
            type: 'wikilink',
            lineNumber: node.position.start.line
          }
          wikilinks.push(wikilink)
        }
      }
    })

    return {
      links: [...links, ...wikilinks],
      imports: [],
      dependencies: [],
      metadata: {
        processingContext: context,
        processedAt: new Date().toISOString()
      }
    }
  }

  private extractText(node: LinkNode): string {
    if (!node.children || node.children.length === 0) {
      return ''
    }

    return node.children
      .map(child => {
        if (child.type === 'text') {
          return (child as any).value
        }
        return ''
      })
      .join('')
      .trim()
  }

  private getLinkType(url: string): 'markdown' | 'external' {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return 'external'
    }
    return 'markdown'
  }

  private extractWikilinks(text: string): Array<{ link: string; text: string }> {
    const wikilinkRegex = /\[\[([^\]]+)\]\]/g
    const matches: Array<{ link: string; text: string }> = []

    let match
    while ((match = wikilinkRegex.exec(text)) !== null) {
      const fullMatch = match[0]
      const content = match[1]
      
      const [link, displayText] = content.split('|').map(s => s.trim())
      matches.push({
        link: link || content,
        text: displayText || link || content
      })
    }

    return matches
  }
}
// TypeScript Version: 3.4

import {Component, ElementType, ReactNode} from 'react'
import {PluggableList} from 'unified'
import * as mdast from 'mdast'

declare namespace ReactMarkdown {
  interface Point {
    readonly line: number
    readonly column: number
    readonly offset?: number
  }

  interface Position {
    readonly start: Point
    readonly end: Point
    readonly indent?: number[]
  }

  type NodeType = mdast.Content['type']

  type AlignType = mdast.AlignType

  type ReferenceType = mdast.ReferenceType

  type LinkTargetResolver = (uri: string, text: string, title?: string) => string

  type Renderer<T> = (props: T) => ElementType<T>
  interface Renderers {
    [key: string]: string | Renderer<any>
  }

  interface ReactMarkdownProps {
    readonly className?: string
    readonly source?: string
    readonly sourcePos?: boolean
    readonly includeNodeIndex?: boolean
    readonly rawSourcePos?: boolean
    readonly escapeHtml?: boolean
    readonly skipHtml?: boolean
    readonly allowNode?: (node: mdast.Content, index: number, parent: NodeType) => boolean
    readonly allowedTypes?: NodeType[]
    readonly disallowedTypes?: NodeType[]
    readonly linkTarget?: string | LinkTargetResolver
    readonly transformLinkUri?:
      | ((uri: string, children?: ReactNode, title?: string) => string)
      | null
    readonly transformImageUri?:
      | ((uri: string, children?: ReactNode, title?: string, alt?: string) => string)
      | null
    readonly unwrapDisallowed?: boolean
    readonly renderers?: {[nodeType: string]: ElementType}
    readonly astPlugins?: PluggableList
    readonly plugins?: PluggableList
  }

  const types: NodeType[]
  const renderers: Renderers
  function uriTransformer(uri: string): string
}

declare class ReactMarkdown extends Component<ReactMarkdown.ReactMarkdownProps> {}

export = ReactMarkdown

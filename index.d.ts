// Type definitions for react-markdown v3.0.0-rc1
// Project: https://github.com/rexxars/react-markdown
// Definitions by: Ruslan Ibragimov <https://github.com/IRus>, Kohei Asai <me@axross.io>

import {Component, ReactElement, ReactNode, ReactType} from 'react'

declare class ReactMarkdown extends Component<ReactMarkdown.ReactMarkdownProps, {}> {}

declare namespace ReactMarkdown {
  interface AllowNode {
    readonly type: string
    readonly value?: string
    readonly depth?: number
    readonly children?: ReactNode[]
  }

  interface SourcePosition {
    readonly line: number
    readonly column: number
    readonly offset: number
  }

  interface NodePosition {
    readonly start: SourcePosition
    readonly end: SourcePosition
    readonly indent: number[]
  }

  export type NodeType =
    | 'root'
    | 'break'
    | 'paragraph'
    | 'emphasis'
    | 'strong'
    | 'thematicBreak'
    | 'blockquote'
    | 'delete'
    | 'link'
    | 'image'
    | 'linkReference'
    | 'imageReference'
    | 'table'
    | 'tableHead'
    | 'tableBody'
    | 'tableRow'
    | 'tableCell'
    | 'list'
    | 'listItem'
    | 'definition'
    | 'heading'
    | 'inlineCode'
    | 'code'
    | 'html'
    | 'virtualHtml'

  export interface ReactMarkdownProps {
    readonly className?: string
    readonly source: string
    readonly sourcePos?: boolean
    readonly escapeHtml?: boolean
    readonly skipHtml?: boolean
    readonly allowNode?: (node: AllowNode, index: number, parent: NodeType) => boolean
    readonly allowedTypes?: NodeType[]
    readonly disallowedTypes?: NodeType[]
    readonly transformLinkUri?: (uri: string, children?: ReactNode, title?: string) => string
    readonly transformImageUri?: (uri: string, children?: ReactNode, title?: string, alt?: string) => string
    readonly unwrapDisallowed?: boolean
    readonly renderers?: {[nodeType: string]: ReactType}
  }

  type Renderer<T> = (props: T) => ReactElement<T>
  interface Renderers {
    [key: string]: string | Renderer<any>
  }

  export var types: NodeType[]
  export var renderers: Renderers
  export var uriTransformer: (uri: string) => string
}

export = ReactMarkdown

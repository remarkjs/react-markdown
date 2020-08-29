// Type definitions for react-markdown > v3.3.0
// Project: https://github.com/rexxars/react-markdown
// Definitions by:
// - Ruslan Ibragimov <https://github.com/IRus>
// - Kohei Asai <me@axross.io>
// - ClassicDarkChocolate <https://github.com/ClassicDarkChocolate>
// - Espen Hovlandsdal <https://espen.codes/>
// - Ted Piotrowski <https://github.com/ted-piotrowski>

import { Component, ElementType, ReactNode } from 'react'

declare class ReactMarkdown extends Component<ReactMarkdown.ReactMarkdownProps, {}> {}

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

  interface RemarkParseOptions {
    gfm: boolean
    commonmark: boolean
    footnotes: boolean
    blocks: string[]
    pedantic: boolean
  }

  export type NodeType = keyof Renderers

  export type AlignType =
    | "left"
    | "right"
    | "center"
    | null

  export type ReferenceType =
    | "shortcut"
    | "collapsed"
    | "full"

  export type LinkTargetResolver = (uri: string, text: string, title?: string) => string

  export interface ReactMarkdownProps {
    readonly className?: string
    readonly source?: string
    readonly sourcePos?: boolean
    readonly includeNodeIndex?: boolean
    readonly rawSourcePos?: boolean
    readonly escapeHtml?: boolean
    readonly skipHtml?: boolean
    readonly allowNode?: (node: MarkdownAbstractSyntaxTree, index: number, parent: NodeType) => boolean
    readonly allowedTypes?: NodeType[]
    readonly disallowedTypes?: NodeType[]
    readonly linkTarget?: string | LinkTargetResolver
    readonly transformLinkUri?: ((uri: string, children?: ReactNode, title?: string) => string) | null
    readonly transformImageUri?: ((uri: string, children?: ReactNode, title?: string, alt?: string) => string) | null
    readonly unwrapDisallowed?: boolean
    readonly renderers?: Partial<Renderers>
    readonly astPlugins?: MdastPlugin[]
    readonly plugins?: any[] | (() => void)
    readonly parserOptions?: Partial<RemarkParseOptions>
  }

  interface RenderProps extends ReactMarkdownProps {
    readonly definitions?: object
  }

  type Renderer<P> = string | ElementType<P>

  interface Renderers {
    blockquote: Renderer<{
      children: ReactNode
    }>
    break: Renderer<{
      children: undefined
    }>
    code: Renderer<{
      children: ReactNode
      language: string | null
      value: string
    }>
    definition: Renderer<{
      children: undefined
      identifier: string
      src: string
      title: string
    }>
    delete: Renderer<{ children: ReactNode }>
    emphasis: Renderer<{ children: ReactNode }>
    heading: Renderer<{
      children: ReactNode
      level: 1 | 2 | 3 | 4 | 5 | 6
    }>
    html: Renderer<{
      children: undefined
      escapeHtml: boolean
      isBlock: boolean
      skipHtml: boolean
      value: string
    }>
    image: Renderer<{
      alt: string
      children: undefined
      src: string
      title: string
    }>
    imageReference: Renderer<{
      alt: string
      children: undefined
      src: string
      title: string
    }>
    inlineCode: Renderer<{
      children: string
      inline: boolean
      value: string
    }>
    link: Renderer<{
      children: ReactNode
      href: string
    }>
    linkReference: Renderer<{
      children: ReactNode
      href: string
    }>
    list: Renderer<
      {
        children: ReactNode
        tight: boolean
        depth: number
      } & (
        {
          start: number
          ordered: true
        } | {
          start: null
          ordered: false
        }
      )
    >
    listItem: Renderer<{
      checked: null | boolean
      children: ReactNode
      index: number
      ordered: boolean
      tight: boolean
    }>
    paragraph: Renderer<{
      children: undefined
    }>
    parsedHtml: Renderer<{
      children: undefined
      element: ReactNode
      escapeHtml: boolean
      skipHtml: boolean
      value: string
    }>
    root: Renderer<{
      children: ReactNode
    }>
    strong: Renderer<{
      children: ReactNode
    }>
    table: Renderer<{
      children: ReactNode
      columnAlignment: AlignType[]
    }>
    tableBody: Renderer<{
      children: ReactNode
      columnAlignment: AlignType[]
    }>
    tableCell: Renderer<{
      align: AlignType
      isHeader: boolean
    }>
    tableHead: Renderer<{
      children: ReactNode
      columnAlignment: AlignType[]
    }>
    tableRow: Renderer<{
      children: ReactNode
      columnAlignment: AlignType[]
      isHeader: boolean
    }>
    text: Renderer<{
      children: string
      nodeKey: string
      value: string
    }>
    thematicBreak: Renderer<{
      children: undefined
    }>
    virtualHtml: Renderer<{
      children: ReactNode
      tag: string
    }>
  }

  interface MarkdownAbstractSyntaxTree {
    align?: AlignType[]
    alt?: string | null
    checked?: boolean | null
    children?: MarkdownAbstractSyntaxTree[]
    data?: {[key: string]: any}
    index?: number
    depth?: number
    height?: number
    identifier?: string
    lang?: string | null
    loose?: boolean
    ordered?: boolean
    position?: Position
    referenceType?: ReferenceType
    start?: number | null
    title?: string | null
    type: string
    url?: string
    value?: string
    width?: number
  }

  type MdastPlugin = (node: MarkdownAbstractSyntaxTree, renderProps?: RenderProps) => MarkdownAbstractSyntaxTree

  export var types: NodeType[]
  export var renderers: Renderers
  export var uriTransformer: (uri: string) => string
}

export = ReactMarkdown


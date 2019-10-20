// Type definitions for react-markdown > v3.3.0
// Project: https://github.com/rexxars/react-markdown
// Definitions by:
// - Ruslan Ibragimov <https://github.com/IRus>
// - Kohei Asai <me@axross.io>
// - ClassicDarkChocolate <https://github.com/ClassicDarkChocolate>
// - Espen Hovlandsdal <https://espen.codes/>
// - Ted Piotrowski <https://github.com/ted-piotrowski>

import {Component, ReactElement, ReactNode, ReactType} from 'react'

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
    readonly renderers?: Renderers
    readonly astPlugins?: MdastPlugin[]
    readonly plugins?: any[] | (() => void)
    readonly parserOptions?: Partial<RemarkParseOptions>
  }

  interface RenderProps extends ReactMarkdownProps {
    readonly definitions?: object
  }

  type Renderer<T = any> = (props: T) => ReactElement<T> | string
  type RootRenderer = Renderer<{
    className: string
  }>

  type TextRenderer = Renderer<{
    nodeKey: string
  }>

  type HeadingRenderer = Renderer<{
    level: number
  }>

  interface Renderers {
    root?: RootRenderer
    text?: TextRenderer,
    break?: Renderer,
    paragraph?: Renderer,
    emphasis?: Renderer,
    strong?: Renderer,
    thematicBreak?: Renderer,
    blockquote?: Renderer,
    delete?: Renderer,
    link?: Renderer,
    image?: Renderer,
    linkReference?: Renderer,
    imageReference?: Renderer,
    table?: Renderer
    tableHead?: Renderer
    tableBody?: Renderer
    tableRow?: Renderer
    tableCell?: Renderer
    list?: ListRenderer,
    listItem?: Renderer,
    definition?: Renderer,
    heading?: HeadingRenderer,
    inlineCode?: Renderer,
    code?: Renderer
    html?:Renderer,
    virtualHtml?: Renderer,
    parsedHtml: Renderer
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

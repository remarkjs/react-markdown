// Type definitions for react-markdown > v3.3.0
// Project: https://github.com/rexxars/react-markdown
// Definitions by:
// - Ruslan Ibragimov <https://github.com/IRus>
// - Kohei Asai <me@axross.io>
// - ClassicDarkChocolate <https://github.com/ClassicDarkChocolate>
// - Espen Hovlandsdal <https://espen.codes/>
// - Christian Murphy <https://github.com/ChristianMurphy>

import {Component, ReactElement, ReactNode} from 'react'
import {PluggableList} from 'unified'
import {Content} from 'mdast'

declare namespace ReactMarkdown {
  export type NodeType = Content['type']

  export type LinkTargetResolver = (uri: string, text: string, title?: string) => string

  type Renderer<T> = (props: T) => ReactElement<T>
  interface Renderers {
    [key: string]: string | Renderer<any>
  }

  export interface ReactMarkdownProps {
    readonly className?: string
    readonly source?: string
    readonly sourcePos?: boolean
    readonly includeNodeIndex?: boolean
    readonly rawSourcePos?: boolean
    readonly escapeHtml?: boolean
    readonly skipHtml?: boolean
    readonly allowNode?: (node: Content, index: number, parent: NodeType) => boolean
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
    readonly renderers?: Renderers
    readonly astPlugins?: PluggableList
    readonly plugins?: PluggableList
  }

  export var types: NodeType[]
  export var renderers: Renderers
  export var uriTransformer: (uri: string) => string
}

declare class ReactMarkdown extends Component<ReactMarkdown.ReactMarkdownProps, {}> {}

export = ReactMarkdown

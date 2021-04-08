// TypeScript Version: 3.4

import {ElementType, ReactElement} from 'react'
import {PluggableList} from 'unified'
import * as unist from 'unist'
import * as hast from 'hast'

type Not<T> = {
  [key in keyof T]?: never
}

type MutuallyExclusive<T, U> = (T & Not<U>) | (U & Not<T>)

declare namespace ReactMarkdown {
  type Point = unist.Point

  type Position = unist.Position

  type LinkTargetResolver = (
    href: string,
    children: Array<hast.Element | hast.Comment | hast.Text>,
    title?: string
  ) => string

  type Component<T> = (props: T) => ElementType<T>
  interface Components {
    [key: string]: string | Component<any>
  }

  interface ReactMarkdownPropsBase {
    readonly className?: string
    readonly skipHtml?: boolean
    readonly sourcePos?: boolean
    readonly includeElementIndex?: boolean
    readonly rawSourcePos?: boolean
    readonly allowElement?: (
      node: hast.Element,
      index: number,
      parent: hast.Element | hast.Root
    ) => boolean
    readonly linkTarget?: string | LinkTargetResolver
    readonly transformLinkUri?:
      | ((
          href: string,
          children: Array<hast.Element | hast.Comment | hast.Text>,
          title?: string
        ) => string)
      | null
    readonly transformImageUri?: ((src: string, alt: string, title?: string) => string) | null
    readonly components?: {[tagName: string]: ElementType}
    readonly remarkPlugins?: PluggableList
    readonly rehypePlugins?: PluggableList
    readonly unwrapDisallowed?: boolean
  }

  interface ChildrenProp {
    readonly children: string
  }

  interface AllowedElementsProp {
    readonly allowedElements?: string[]
  }

  interface DisallowedElementsProp {
    readonly disallowedElements: string[]
  }

  type ReactMarkdownProps = ReactMarkdownPropsBase &
    ChildrenProp &
    MutuallyExclusive<AllowedElementsProp, DisallowedElementsProp>

  function uriTransformer(url: string): string
}

declare function ReactMarkdown(props: ReactMarkdown.ReactMarkdownProps): ReactElement

export = ReactMarkdown

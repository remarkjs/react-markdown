import {ReactNode} from 'react'
import {Position} from 'unist'
import {Element} from 'hast'

/* File for types which are not handled correctly in JSDoc mode */

export interface ReactMarkdownProps {
  node: Element
  key: string
  children: ReactNode[]
  /**
   * Passed when `options.rawSourcePos` is given
   */
  sourcePosition?: Position
  /**
   * Passed when `options.includeElementIndex` is given
   */
  index?: number
  /**
   * Passed when `options.includeElementIndex` is given
   */
  siblingCount?: number
}

export type NormalComponents = {
  [TagName in keyof JSX.IntrinsicElements]:
    | TagName
    | ((
        props: JSX.IntrinsicElements[TagName] & ReactMarkdownProps
      ) => ReactNode)
}

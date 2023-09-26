// File for types which are not handled correctly in JSDoc mode.
import type {Element} from 'hast'
import type {ComponentPropsWithoutRef, ComponentType, ReactNode} from 'react'
import type {Position} from 'unist'

/**
 * Props passed to components.
 */
export type ReactMarkdownProps = {
  /**
   * Passed when `options.sourcePos` is given.
   */
  'data-sourcepos': string | undefined
  /**
   * Passed when `options.includeElementIndex` is given
   */
  index?: number
  /**
   * Original hast node.
   */
  node: Element
  /**
   * Passed when `options.includeElementIndex` is given
   */
  siblingCount?: number
  /**
   * Passed when `options.rawSourcePos` is given
   */
  sourcePosition?: Position | undefined
}

export type NormalComponents = {
  [TagName in keyof JSX.IntrinsicElements]:
    | keyof JSX.IntrinsicElements
    | ComponentType<ComponentPropsWithoutRef<TagName> & ReactMarkdownProps>
}

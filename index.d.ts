// Type definitions for react-markdown > v3.3.0
// Project: https://github.com/rexxars/react-markdown
// Definitions by:
// - Ruslan Ibragimov <https://github.com/IRus>
// - Kohei Asai <me@axross.io>
// - ClassicDarkChocolate <https://github.com/ClassicDarkChocolate>
// - Espen Hovlandsdal <https://espen.codes/>
// - Ted Piotrowski <https://github.com/ted-piotrowski>
// - Luke Sanwick <https://github.com/lsanwick>

import { Component, ReactElement, ReactNode, ReactType } from "react";

declare class ReactMarkdown extends Component<
  ReactMarkdown.ReactMarkdownProps
> {}

declare namespace ReactMarkdown {
  interface Point {
    readonly line: number;
    readonly column: number;
    readonly offset?: number;
  }

  interface Position {
    readonly start: Point;
    readonly end: Point;
    readonly indent?: number[];
  }

  interface RemarkParseOptions {
    gfm: boolean;
    commonmark: boolean;
    footnotes: boolean;
    blocks: string[];
    pedantic: boolean;
  }

  export type NodeType =
    | "root"
    | "text"
    | "break"
    | "paragraph"
    | "emphasis"
    | "strong"
    | "thematicBreak"
    | "blockquote"
    | "delete"
    | "link"
    | "image"
    | "linkReference"
    | "imageReference"
    | "table"
    | "tableHead"
    | "tableBody"
    | "tableRow"
    | "tableCell"
    | "list"
    | "listItem"
    | "definition"
    | "heading"
    | "inlineCode"
    | "code"
    | "html"
    | "virtualHtml";

  export type AlignType = "left" | "right" | "center" | null;

  export type ReferenceType = "shortcut" | "collapsed" | "full";

  export type LinkTargetResolver = (
    uri: string,
    text: string,
    title?: string
  ) => string;

  export interface ReactMarkdownProps {
    /**
     *  Class name of the container element. If none is passed, a container will not be rendered.
     */
    readonly className?: string;
    /**
     * The Markdown source to parse
     */
    readonly source: string;
    /**
     * Setting to `true` will add `data-sourcepos` attributes to all elements, indicating where in
     * the markdown source they were rendered from (default: false).
     */
    readonly sourcePos?: boolean;
    /**
     * Setting to `true` will pass `index` and `parentChildCount` props to all renderers
     * (default: `false`).
     */
    readonly includeNodeIndex?: boolean;
    /**
     * Setting to `true` will pass a `sourcePosition` property to all renderers with structured
     * source position information (default: `false`).
     */
    readonly rawSourcePos?: boolean;
    /**
     * Setting to `false` will cause HTML to be rendered (see notes below about proper HTML
     * support). Be aware that setting this to `false` might cause security issues if the input is
     * user-generated. Use at your own risk. (default: `true`).
     */
    readonly escapeHtml?: boolean;
    /**
     * Setting to `true` will skip inlined and blocks of HTML (default: `false`).
     */
    readonly skipHtml?: boolean;
    /**
     * Function execute if in order to determine if the node should be allowed. Ran prior to
     * checking `allowedTypes`/`disallowedTypes`. Returning a truthy value will allow the node to
     * be included. Note that if this function returns `true` and the type is not in `allowedTypes`
     * (or specified as a `disallowedType`), it won't be included. The function will receive three
     * arguments argument (`node`, `index`, `parent`), where `node` contains different properties
     * depending on the node type.
     */
    readonly allowNode?: (
      node: MarkdownAbstractSyntaxTree,
      index: number,
      parent: NodeType
    ) => boolean;
    /**
     * Defines which types of nodes should be allowed (rendered). (default: all types).
     */
    readonly allowedTypes?: NodeType[];
    /**
     * Defines which types of nodes should be disallowed (not rendered). (default: none).
     */
    readonly disallowedTypes?: NodeType[];
    /**
     * Sets the default target attribute for links. If a function is provided, it will be called with `url`, `text`, and `title`
     * and should return a string (e.g. `_blank` for a new tab). Default is `undefined` (no target attribute).
     */
    readonly linkTarget?: string | LinkTargetResolver;
    /**
     * Function that gets called for each encountered link with a single argument - `uri`. The returned value is used in place
     * of the original. The default link URI transformer acts as an XSS-filter, neutralizing things like `javascript:`,
     * `vbscript:` and `file:` protocols. If you specify a custom function, this default filter won't be called, but you can
     * access it as `require('react-markdown').uriTransformer`. If you want to disable the default transformer, pass `null`
     * to this option.
     */
    readonly transformLinkUri?:
      | ((uri: string, children?: ReactNode, title?: string) => string)
      | null;
    /**
     * Function that gets called for each encountered image with a single argument - `uri`. The returned value is used in place
     * of the original.
     */
    readonly transformImageUri?:
      | ((
          uri: string,
          children?: ReactNode,
          title?: string,
          alt?: string
        ) => string)
      | null;
    readonly unwrapDisallowed?: boolean;
    /**
     * An object where the keys represent the node type and the value is a React component. The object is merged with the default
     * renderers. The props passed to the component varies based on the type of node.
     */
    readonly renderers?: { [nodeType: string]: ReactType };
    readonly astPlugins?: MdastPlugin[];
    /**
     * An array of unified/remark parser plugins. If you need to pass options to the plugin, pass an array with two elements, the
     * first being the plugin and the second being the options - for instance:
     * `{plugins: [[require('remark-shortcodes'), {your: 'options'}]]`.
     *
     * (default: `[]`)
     *
     * Note that [not all plugins can be used](https://github.com/rexxars/react-markdown/issues/188#issuecomment-404710893).
     */
    readonly plugins?: any[] | (() => void);
    /**
     * An object containing options to pass to
     * [remark-parse](https://github.com/remarkjs/remark/tree/master/packages/remark-parse).
     */
    readonly parserOptions?: Partial<RemarkParseOptions>;
  }

  interface RenderProps extends ReactMarkdownProps {
    readonly definitions?: object;
  }

  type Renderer<T> = (props: T) => ReactElement<T>;
  interface Renderers {
    [key: string]: string | Renderer<any>;
  }

  interface MarkdownAbstractSyntaxTree {
    align?: AlignType[];
    alt?: string | null;
    checked?: boolean | null;
    children?: MarkdownAbstractSyntaxTree[];
    data?: { [key: string]: any };
    index?: number;
    depth?: number;
    height?: number;
    identifier?: string;
    lang?: string | null;
    loose?: boolean;
    ordered?: boolean;
    position?: Position;
    referenceType?: ReferenceType;
    start?: number | null;
    title?: string | null;
    type: string;
    url?: string;
    value?: string;
    width?: number;
  }

  type MdastPlugin = (
    node: MarkdownAbstractSyntaxTree,
    renderProps?: RenderProps
  ) => MarkdownAbstractSyntaxTree;

  export var types: NodeType[];
  export var renderers: Renderers;
  export var uriTransformer: (uri: string) => string;
}

export = ReactMarkdown;

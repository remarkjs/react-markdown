// Type definitions for react-markdown v2.2.2
// Project: https://github.com/rexxars/react-markdown
// Definitions by: Ruslan Ibragimov <https://github.com/IRus>, Kohei Asai <me@axross.io>

import { Component, ReactElement, ReactNode } from 'react';

declare class ReactMarkdown extends Component<ReactMarkdown.ReactMarkdownProps, {}> {}

declare namespace ReactMarkdown {
  interface AllowNode {
    readonly type: string;
    readonly renderer: string;
    readonly props: any;
    readonly children: ReactNode[];
  }

  interface WalkerNode {
    readonly entering: boolean,
    readonly node: { type: string }
  }

  interface NodeWalker {
    next: () => WalkerNode;
  }

  export type NodeType = 'HtmlInline' | 'HtmlBlock' | 'Text' | 'Paragraph' | 'Heading' | 'Softbreak' | 'Hardbreak' | 'Link' | 'Image' | 'Emph' | 'Code' | 'CodeBlock' | 'BlockQuote' | 'List' | 'Item' | 'Strong' | 'ThematicBreak';

  export interface ReactMarkdownProps {
    readonly className?: string;
    readonly containerProps?: any;
    readonly source: string;
    readonly containerTagName?: string;
    readonly childBefore?: any;
    readonly childAfter?: any;
    readonly sourcePos?: boolean;
    readonly escapeHtml?: boolean;
    readonly skipHtml?: boolean;
    readonly softBreak?: string;
    readonly allowNode?: (node: AllowNode) => boolean;
    readonly allowedTypes?: NodeType[];
    readonly disallowedTypes?: NodeType[];
    readonly transformLinkUri?: (uri: string) => string;
    readonly transformImageUri?: (uri: string) => string;
    readonly unwrapDisallowed?: boolean;
    readonly renderers?: {[nodeType: string]: Component<any, any>};
    readonly walker?: NodeWalker;
  }

  type Renderer<T> = (props: T) => ReactElement<T>;
  interface Renderers {
    [key: string]: string | Renderer<any>;
  }

  export var types: NodeType[];
  export var renderers: Renderers;
  export var uriTransformer: (uri: string) => string;
}

export = ReactMarkdown;

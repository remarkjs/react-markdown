// Type definitions for react-markdown v2.2.2
// Project: https://github.com/rexxars/react-markdown
// Definitions by: Ruslan Ibragimov <https://github.com/IRus>

import {Component, ReactNode} from 'react';

declare namespace __ReactMarkdown {

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

    type NodeType = 'HtmlInline' | 'HtmlBlock' | 'Text' | 'Paragraph' | 'Heading' | 'Softbreak' | 'Hardbreak' | 'Link' | 'Image' | 'Emph' | 'Code' | 'CodeBlock' | 'BlockQuote' | 'List' | 'Item' | 'Strong' | 'ThematicBreak';

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

    export default class ReactMarkdown extends Component<ReactMarkdownProps, {}> {
    }
}

export = __ReactMarkdown;

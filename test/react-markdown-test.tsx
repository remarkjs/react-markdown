/// <reference path="../react-markdown.d.ts" />

import ReactMarkdown, {NodeType} from 'react-markdown';

const text = "# Hello";

const ex1: JSX.Element = (
    <ReactMarkdown source={text}/>
);


const allowedTypes: NodeType[] = ['BlockQuote', 'Code'];

const ex2: JSX.Element = (
    <ReactMarkdown
        source={text}
        allowedTypes={allowedTypes}
    />
);

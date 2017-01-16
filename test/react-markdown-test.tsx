import * as ReactMarkdown from '../';

const text = "# Hello";

const ex1: JSX.Element = (
    <ReactMarkdown source={text} />
);

const allowedTypes: ReactMarkdown.NodeType[] = ['BlockQuote', 'Code'];

const ex2: JSX.Element = (
    <ReactMarkdown
        source={text}
        allowedTypes={allowedTypes}
    />
);

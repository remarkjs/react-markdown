'use strict';

var React = require('react');
var Parser = require('commonmark').Parser;
var ReactRenderer = require('commonmark-react-renderer');

var parser = new Parser();
var propTypes = React.PropTypes;

var ReactMarkdown = React.createClass({
    displayName: 'ReactMarkdown',

    propTypes: {
        className: propTypes.string,
        containerProps: propTypes.object,
        source: propTypes.string.isRequired,
        containerTagName: propTypes.string,
        childBefore: propTypes.object,
        childAfter: propTypes.object,
        sourcePos: propTypes.bool,
        escapeHtml: propTypes.bool,
        skipHtml: propTypes.bool,
        softBreak: propTypes.string,
        allowNode: propTypes.func,
        allowedTypes: propTypes.array,
        disallowedTypes: propTypes.array,
        transformLinkUri: propTypes.func,
        transformImageUri: propTypes.func,
        unwrapDisallowed: propTypes.bool,
        renderers: propTypes.object,
        walker: propTypes.func
    },

    getDefaultProps: function() {
        return {
            containerTagName: 'div'
        };
    },

    render: function() {
        var containerProps = this.props.containerProps || {};
        var renderer = new ReactRenderer(this.props);
        var ast = parser.parse(this.props.source || '');

        if (this.props.walker) {
            var walker = ast.walker();
            var event;

            while ((event = walker.next())) {
                this.props.walker.call(this, event, walker);
            }
        }

        if (this.props.className) {
            containerProps.className = this.props.className;
        }

        return React.createElement.apply(React,
            [this.props.containerTagName, containerProps, this.props.childBefore]
                .concat(renderer.render(ast).concat(
                    [this.props.childAfter]
                ))
        );
    }
});

ReactMarkdown.types = ReactRenderer.types;
ReactMarkdown.renderers = ReactRenderer.renderers;
ReactMarkdown.uriTransformer = ReactRenderer.uriTransformer;

module.exports = ReactMarkdown;

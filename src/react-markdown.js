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
        source: propTypes.string.isRequired,
        containerTagName: propTypes.string,
        sourcePos: propTypes.bool,
        escapeHtml: propTypes.bool,
        skipHtml: propTypes.bool,
        softBreak: propTypes.string,
        allowNode: propTypes.func,
        allowedTypes: propTypes.array,
        disallowedTypes: propTypes.array
    },

    getDefaultProps: function() {
        return {
            containerTagName: 'div'
        };
    },

    render: function() {
        var containerProps = {};
        var renderer = new ReactRenderer(this.props);
        var ast = parser.parse(this.props.source || '');

        if (this.props.className) {
            containerProps.className = this.props.className;
        }

        return React.createElement.apply(React,
            [this.props.containerTagName, containerProps]
                .concat(renderer.render(ast))
        );
    }
});

module.exports = ReactMarkdown;

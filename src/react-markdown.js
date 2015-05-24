'use strict';

var React = require('react');
var Parser = require('commonmark').Parser;
var ReactRenderer = require('commonmark-react-renderer');

var parser = new Parser();

var ReactMarkdown = React.createClass({
    displayName: 'ReactMarkdown',

    propTypes: {
        className: React.PropTypes.string,
        source: React.PropTypes.string.isRequired,
        containerTagName: React.PropTypes.string,
        sourcePos: React.PropTypes.bool,
        escapeHtml: React.PropTypes.bool,
        skipHtml: React.PropTypes.bool,
        softBreak: React.PropTypes.string,
        highlight: React.PropTypes.func
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

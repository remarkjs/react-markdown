'use strict';

var React = require('react');
var Parser = require('commonmark').Parser;
var ReactRenderer = require('commonmark-react-renderer');

var parser = new Parser();

var ReactMarkdown = React.createClass({
    displayName: 'ReactMarkdown',

    propTypes: {
        source: React.PropTypes.string.isRequired,
        containerTagName: React.PropTypes.string,
        sourcePos: React.PropTypes.bool,
        escapeHtml: React.PropTypes.bool,
        skipHtml: React.PropTypes.bool,
        softBreak: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            containerTagName: 'div'
        };
    },

    render: function() {
        var renderer = new ReactRenderer(this.props);
        var ast = parser.parse(this.props.source || '');

        return React.createElement.apply(React,
            [this.props.containerTagName, null]
                .concat(renderer.render(ast))
        );
    }
});

module.exports = ReactMarkdown;

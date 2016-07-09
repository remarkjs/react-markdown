'use strict';

var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var hljs = window.hljs;
var h = React.createElement;

var CodeBlock = React.createClass({
    displayName: 'CodeBlock',
    mixins: [PureRenderMixin],
    propTypes: {
        literal: React.PropTypes.string,
        language: React.PropTypes.string
    },

    componentDidMount: function() {
        this.highlightCode();
    },

    componentDidUpdate: function() {
        this.highlightCode();
    },

    highlightCode: function() {
        hljs.highlightBlock(this.refs.code);
    },

    render: function() {
        return (
            h('pre', null,
                h('code', {
                    ref: 'code',
                    className: this.props.language
                }, this.props.literal)
            )
        );
    }
});

module.exports = React.createFactory(CodeBlock);

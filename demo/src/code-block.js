'use strict';

var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var hljs = window.hljs;

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
            <pre>
                <code ref="code" className={this.props.language}>{this.props.literal}</code>
            </pre>
        );
    }
});

module.exports = React.createFactory(CodeBlock);

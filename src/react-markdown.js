'use strict';

var React = require('react');

var ReactMarkdown = React.createClass({
    displayName: 'ReactMarkdown',

    propTypes: {
        text: React.PropTypes.string.isRequired
    },

    render: function() {
        return <div>{this.props.text}</div>;
    }
});

module.exports = ReactMarkdown;

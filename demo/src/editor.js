'use strict';

var React = require('react');
var CodeMirror = window.CodeMirrorEditor;

module.exports = React.createClass({
    displayName: 'Editor',

    propTypes: {
        onChange: React.PropTypes.func.isRequired,
        value: React.PropTypes.string
    },

    onInputChange: function(e) {
        this.props.onChange(e.target.value);
    },

    render: function() {
        return (
            <form className="editor pure-form">
                <CodeMirror
                    mode="markdown"
                    theme="monokai"
                    value={this.props.value}
                    onChange={this.onInputChange}
                />
            </form>
        );
    }
});

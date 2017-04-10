'use strict';

var React = require('react');
var PropTypes = require('prop-types');
var CodeMirror = window.CodeMirrorEditor;
var h = React.createElement;

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(e) {
        this.props.onChange(e.target.value);
    }

    render() {
        return (
            h('form', {className: 'editor pure-form'},
                h(CodeMirror, {
                    mode: 'markdown',
                    theme: 'monokai',
                    value: this.props.value,
                    onChange: this.onInputChange
                })
            )
        );
    }
}

Editor.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string
};

module.exports = Editor;

'use strict';

var React = require('react');
var h = React.createElement;

module.exports = React.createClass({
    displayName: 'MarkdownControls',

    propTypes: {
        mode: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            mode: 'raw'
        };
    },

    onChange: function(e) {
        this.props.onChange(e.target.value);
    },

    render: function() {
        var rawChecked = this.props.mode === 'raw',
            skipChecked = this.props.mode === 'skip',
            escapeChecked = this.props.mode === 'escape';

        return (
            h('div', {className: 'markdown-controls'},
                h('form', {className: 'pure-form pure-form-inline'},
                    h('fieldset', null,
                        h('legend', null, 'HTML mode'),

                        h('label', {htmlFor: 'raw-html', className: 'pure-checkbox'},
                            'Raw ',
                            h('input', {
                                id: 'raw-html',
                                name: 'html-mode',
                                type: 'radio',
                                value: 'raw',
                                checked: rawChecked,
                                onChange: this.onChange
                            })
                        ),

                        h('label', {htmlFor: 'escape-html', className: 'pure-checkbox'},
                            'Escape ',
                            h('input', {
                                id: 'escape-html',
                                name: 'html-mode',
                                type: 'radio',
                                value: 'escape',
                                checked: escapeChecked,
                                onChange: this.onChange
                            })
                        ),

                        h('label', {htmlFor: 'skip-html', className: 'pure-checkbox'},
                            'Skip ',
                            h('input', {
                                id: 'skip-html',
                                name: 'html-mode',
                                type: 'radio',
                                value: 'skip',
                                checked: skipChecked,
                                onChange: this.onChange
                            })
                        )
                    )
                )
            )
        );
    }
});

'use strict';

var React = require('react');
var PropTypes = require('prop-types');
var h = React.createElement;

class MarkdownControls extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.props.onChange(e.target.value);
    }

    render() {
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
}

MarkdownControls.propTypes = {
    mode: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

MarkdownControls.defaultProps = {
    mode: 'raw'
};

module.exports = MarkdownControls;

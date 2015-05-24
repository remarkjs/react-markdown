'use strict';

var React = require('react/addons'),
    jsdom = require('mocha-jsdom'),
    expect = require('chai').expect,
    ReactMarkdown = require('../');

var TestUtils = React.addons.TestUtils;

describe('ReactMarkdown', function() {
    jsdom();

    var testDate = (new Date()).toString();
    var testMarkdown = [
        '# Demo\n\n',
        'I was *rendered* using __React__ at ' + testDate,
        ' and it was so much FUN!', '\n\n',
        'Lets do it <i>again</i>!\nYeah?'
    ].join('');

    it('should not set a class on container if no className is passed as prop', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown })
        );

        expect(rendered.getDOMNode().getAttribute('class')).to.equal(null);
    });

    it('should set a class on container if className is passed as prop', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, className: 'foo bar' })
        );

        expect(rendered.getDOMNode().getAttribute('class')).to.equal('foo bar');
    });

    it('should have rendered a div with the right children', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown })
        );

        expect(rendered.getDOMNode().tagName).to.equal('DIV');
        expect(rendered.getDOMNode().innerHTML).to.contain(testDate);

        var h1 = TestUtils.findRenderedDOMComponentWithTag(rendered, 'h1');
        expect(h1.getDOMNode().innerHTML).to.equal('Demo');

        var em = TestUtils.findRenderedDOMComponentWithTag(rendered, 'em');
        expect(em.getDOMNode().innerHTML).to.equal('rendered');

        var strong = TestUtils.findRenderedDOMComponentWithTag(rendered, 'strong');
        expect(strong.getDOMNode().innerHTML).to.equal('React');

        var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p');
        expect(ps).to.have.length(2);
    });

    it('can specify different container tag name', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, containerTagName: 'section' })
        );

        expect(rendered.getDOMNode().tagName).to.equal('SECTION');
    });

    it('can be told to use <br> for soft-breaks', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, softBreak: 'br' })
        );

        var strong = TestUtils.findRenderedDOMComponentWithTag(rendered, 'br');
        expect(strong).to.be.ok;
    });

    it('can be told to output sourcemaps as data attributes', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, sourcePos: true })
        );

        var h1 = TestUtils.findRenderedDOMComponentWithTag(rendered, 'h1');
        expect(h1.getDOMNode().getAttribute('data-sourcepos')).to.equal('1:1-1:6');
    });

    it('can be told to escape html', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, escapeHtml: true })
        );

        var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p');
        expect(ps[1].getDOMNode().innerHTML).to.contain('&lt;i&gt;');
    });

    it('can be told to skip HTML', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, skipHtml: true })
        );

        var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p');
        expect(ps[1].getDOMNode().innerHTML).to.not.contain('<i>');
        expect(ps[1].getDOMNode().innerHTML).to.not.contain('&lt;i&gt;');
    });

    it('does not blow up if no source is given', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, {})
        );

        expect(rendered.getDOMNode().innerHTML).to.equal('');
    });
});

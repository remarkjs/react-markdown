'use strict';

var React = require('react'),
    ReactDom = require('react-dom'),
    TestUtils = require('react-addons-test-utils'),
    jsdom = require('mocha-jsdom'),
    expect = require('chai').expect,
    ReactMarkdown = require('../');

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

        expect(ReactDom.findDOMNode(rendered).getAttribute('class')).to.equal(null);
    });

    it('should set a class on container if className is passed as prop', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, className: 'foo bar' })
        );

        expect(ReactDom.findDOMNode(rendered).getAttribute('class')).to.equal('foo bar');
    });

    it('should have rendered a div with the right children', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown })
        );

        expect(ReactDom.findDOMNode(rendered).tagName).to.equal('DIV');
        expect(ReactDom.findDOMNode(rendered).innerHTML).to.contain(testDate);

        var h1 = TestUtils.findRenderedDOMComponentWithTag(rendered, 'h1');
        expect(ReactDom.findDOMNode(h1).innerHTML).to.equal('Demo');

        var em = TestUtils.findRenderedDOMComponentWithTag(rendered, 'em');
        expect(ReactDom.findDOMNode(em).innerHTML).to.equal('rendered');

        var strong = TestUtils.findRenderedDOMComponentWithTag(rendered, 'strong');
        expect(ReactDom.findDOMNode(strong).innerHTML).to.equal('React');

        var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p');
        expect(ps).to.have.length(2);
    });

    it('can specify different container tag name', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, containerTagName: 'section' })
        );

        expect(ReactDom.findDOMNode(rendered).tagName).to.equal('SECTION');
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
        expect(ReactDom.findDOMNode(h1).getAttribute('data-sourcepos')).to.equal('1:1-1:6');
    });

    it('can be told to escape html', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, escapeHtml: true })
        );

        var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p');
        expect(ReactDom.findDOMNode(ps[1]).innerHTML).to.contain('&lt;i&gt;');
    });

    it('can be told to skip HTML', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: testMarkdown, skipHtml: true })
        );

        var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p');
        expect(ReactDom.findDOMNode(ps[1]).innerHTML).to.not.contain('<i>');
        expect(ReactDom.findDOMNode(ps[1]).innerHTML).to.not.contain('&lt;i&gt;');
    });

    it('can be given a node filtering function', function() {
        var input = 'I accidentally **removed** the whole word';
        var filter = function(node) {
            return node.type !== 'Strong';
        };
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, { source: input, allowNode: filter })
        );

        var main = ReactDom.findDOMNode(rendered).innerHTML;
        expect(main).to.not.contain('<strong');
    });

    it('does not blow up if no source is given', function() {
        var rendered = TestUtils.renderIntoDocument(
            React.createElement(ReactMarkdown, {})
        );

        expect(ReactDom.findDOMNode(rendered).innerHTML).to.equal('');
    });
});

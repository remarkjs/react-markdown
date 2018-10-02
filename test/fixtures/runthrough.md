# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
1. bar

Loose lists?

- foo

- bar


## Code

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

```
Sample text here...
```

Syntax highlighting

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

## Tables

| Tag    | Use         |
| ------ | ----------- |
| p      | Paragraph   |
| table  | Table       |
| em     | Emphasis    |

Left/right aligned columns

| Project | Stars |
| :------ | -----------:|
| React | 80 759 |
| Vue.js | 73 322 |
| sse-channel | 50 |


## Links

[Espen.Codes](https://espen.codes/)

[Sanity](https://www.sanity.io/ "Sanity, the headless CMS and PaaS")

Autoconverted link https://github.com/rexxars/react-markdown

[Link references][React]

[React]: https://reactjs.org "React, A JavaScript library for building user interfaces"


## Images

![React Markdown](https://espen.codes/assets/projects/react-markdown/320x180.png)
![Mead](https://espen.codes/assets/projects/mead/320x180.png "Mead, on-the-fly image transformer")

Like links, Images also have a footnote style syntax

![Alt text][someref]

With a reference later in the document defining the URL location:

[somref]: https://public.sanity.io/modell_@2x.png  "Headless CMS"

## Hard breaks

Yeah, hard breaks  
can be useful too.

## HTML entities

Some characters, like &aelig;, &amp; and similar should be handled properly.

## HTML

Does anyone actually like the fact that you can embed HTML in markdown?

<iframe
  src="https://foo.bar/"
  width="640"
  height="480"
/>

We used to have a known bug where inline HTML wasn't handled well. You can do basic tags like
<code>code</code>, as long as it doesn't contain any <span class="attrs">attributes</span>. If you
have weird ordering on your tags, it won't work either. It does support <strong>nested
<em>tags</em>, however</strong>. And with the <code class="name">html-parser</code> plugin, it can now properly handle HTML! Which is pretty sweet.

<hr /><hr />

Cool, eh?

#[Atomic Lab.](http://steelydylan.github.io/atomic-lab/)
Template sharing and coding environment based on atomic design

## Screenshot
<img src="https://raw.github.com/steelydylan/atomic-lab/master/screenshot.png"></img>

## Features

- You can use template engines like haml, ejs and jade.
- You can use css preprocessors like scss, less and stylus
- You can share components you have created with others by sharing shortened URL

## Usage

### preview
```html
<!--@preview
code here
-->
```

### note
```html
<!--@note
markdown here
-->
```

### make template

define template
```html
<!--@template -->
code here
<!--@/template -->
```

set default variable
```html
<!--@template text="hoge" -->
<p>{text}</p>
<!--@/template -->
```

### use template
supporse that component's name is "main-visual"
```html
<!--@import parts="main-visual" -->
<main-visual image="hoge.png"></main-visual>
```

## Attribution
We use some icons created by http://patternlab.io/
## License
MIT License

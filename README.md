#[Atomic Lab.](http://steelydylan.github.io/atomic-lab/)
Template sharing and coding environment based on atomic design

## Screenshot
<img src="https://raw.github.com/steelydylan/atomic-lab/master/about/images/Feature-browser.png"></img>

## Features

- You can use template engines like haml, ejs and jade.
- You can use css preprocessors like scss, less and stylus
- You can share components you have created with others by sharing shortened URL

## Installation

```
npm install atomic-lab
./node_modules/.bin/atomic-lab init
./node_modules/.bin/atomic-lab build
```

## Use with gulp

```js
var gulp = require('gulp');
var atomic = require('atomic-lab');
var bs = require('browser-sync').create();

gulp.task('atomic-init', function(){
		bs.init({
			server: "./styleguide"
		});
		atomic.init({
			dist:"styleguide"
		}).then(bs.reload());
});

gulp.task('atomic', function(){
		atomic.build({
			src:"./components",
			dist:"./styleguide/resources/setting.json",
			markup:"ejs"
		}).then(bs.reload());
});

gulp.task('default', function () {
    bs.init({
        server: "./"
    });
    gulp.watch('components/**',['atomic']);
});
```

## Usage


### document
```html
<!--@doc
# @category atom
# @name common
# @css ./common.sass
-->
```

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

## Config
You can update settings via config.js

```js
var config = {
	/*
		read data from jsonfile
		instead of localstorage
	*/
	read_from_local_file:true,
	/*
		run js on preview mode
	*/
	run_script:true,
	/*
		used for Google URL shortener
	*/
	key:"AIzaSyDNu-_s700JSm7SXzLWVt3Rku5ZwbpaQZA"
}
```

## Attribution
We use some icons created by http://patternlab.io/
## License
MIT License

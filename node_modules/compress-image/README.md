# compress-image

> Minify image  using [tinypng](https://tinypng.com/)



## Install

Install with [npm](https://npmjs.org/package/compress-image)

```
npm install --save-dev compress-image
```


## Example

```js
var compressImage = require('compress-image');

compressImage('inputDir','outputDir',{
	tinifyApiKey: 'xxxxxxx' // tinypng developer apikey
	compresssPercent: 10 // limit compress scale
});
```


## License

MIT © [zhiyingzzhou](https://github.com/zhiyingzzhou)

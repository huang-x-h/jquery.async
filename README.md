# jquery.async
> add utilities function to control async flow in jquery

## Usage

```html
<script src="path/jquery.js"></script>
<script src="path/jquery.async.js"></script>
```

## API
### `$.series([deferreds], [initialValue])`

Run deferreds collection of functions in series, each function consumes the return value of the previous function

```js
$.series(() => {
  return fetchUrl('defer1.json');
}, (result) => {
  return { name: 'i am pure function' };
}, (result) => {
  return fetchUrl('defer2.json');
}).then((result) => {
  // do something
});
```
### `$.parallel(...deferreds)`

Run deferreds collection of functions in parallel, and return a promise that is fulfilled when all the items in the array are fulfilled

```js
$.parallel(() => {
  return fetchUrl('defer1.json');
}, fetchUrl('defer2.json'), ['one', 'two']).then((v1, v2, v3) => {
  ...
});
```

### `$.promisify(value)`

Return a promise that will wrap the given value

```js
$.promisify(1).then(function(data) {
  console.log(data); // output: 1
});
```

### `$.asyncEach(coll, iteratee)`

Iterate over an array, with given `iteratee` function return 循环数组进行函数调用处理，返回各自调用结果

```js
$.asyncEach([1, 2, 3], function(item, coll) {
  var defer = $.Deferred();
  setTimeout(function() {
    defer.resolve(item + 1);
  }, 100);
  return defer.promise();
}).then(function(data) {
  console.log(data); //output: 2, 3, 4
});
```

### `$.polling(func, wait)`

According to `wait` time polling implement the given `func` function

```js
var polling = $.polling(function() {
  console.log('polling');
}, 1000);

// start polling
polling.start();

// stop polling
polling.stop();

// polling times
polling.times();
```

## [Changelog](CHANGELOG.md)

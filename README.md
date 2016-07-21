# jquery.async
> add `$.series/$.parallel` function to control async flow in jquery

## Usage

```html
<script src="path/jquery.js"></script>
<script src="path/jquery.async.js"></script>
```

```js
$.series(defer1, defer2, defer3)
or
$.series([defer1, defer2, defer3])

$.parallel(defer1, defer2, defer3)
or
$.parallel([defer1, defer2, defer3])
```

## Example

### $.series(deferreds)

```js
function one() {
  var defer = $.Deferred();
  setTimeout(function() {
    defer.resolve('one');
  });
  return defer.promise();
}

function two(one) {
  console.log('function two input value is', one);
  var defer = $.Deferred();
  setTimeout(function() {
    defer.resolve('two');
  });
  return defer.promise();
}

function three(two) {
  console.log('functoin three input value is', two);
  var defer = $.Deferred();
  setTimeout(function() {
    defer.resolve('three');
  });
  return defer.promise();
}

var defer = $.series(one, two, three);
defer.then(function(result) {
  console.log('result value is', result);
});

// output
// function two input value is one
// functoin three input value is two
// result value is three
```
### $.parallel(deferreds)

```js
function one() {
  var defer = $.Deferred();
  setTimeout(function() {
    defer.resolve('one');
  });
  return defer.promise();
}

function two() {
  var defer = $.Deferred();
  setTimeout(function() {
    defer.resolve('two');
  });
  return defer.promise();
}

function three() {
  var defer = $.Deferred();
  setTimeout(function() {
    defer.resolve('three');
  });
  return defer.promise();
}

var defer = $.parallel(one, two, three);
defer.then(function(result) {
  console.log('result value is', result);
});

// output
// result value is ["one", "two", "three"]
```

## API
### `$.series(deferreds)`

run deferreds collection of functions in series, each function consumes the return value of the previous function

### `$.parallel(deferreds)`

run deferreds collection of functions in parallel

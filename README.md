# jquery.async
> add utilities function to control async flow in jquery

## Usage

```html
<script src="path/jquery.js"></script>
<script src="path/jquery.async.js"></script>
```

## API
### `$.series(...deferreds)`

串行执行异步函数处理，每个函数会以前一个函数返回值作为入参

### `$.series([deferreds], initialValue)`

串行执行异步函数，提供第一个函数初始入参

### `$.parallel(...deferreds)`

并行执行异步函数

### `$.promisify(value)`

包装对象返回 promise 对象

### `$.asyncEach(coll, iteratee)`

循环数组进行函数调用处理，返回各自调用结果

### `$.polling(func, wait)`

根据给定的时间和参数轮询执行函数

## [Changelog](CHANGELOG.md)

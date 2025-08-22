# Pools.Dynamic.aquire

## arguments

buckets

## description

returns an object from the pool for use.
```js
var tacoPool = Pools.Dynamic.construct(Taco);
var taco = tacoPool.aquire("chiken");
taco.init(val1, val2)

```
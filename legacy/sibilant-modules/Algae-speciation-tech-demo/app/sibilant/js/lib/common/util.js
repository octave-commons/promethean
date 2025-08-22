const create = (object, r) => (...args) => ((r = Object.create(object)), r.init(...args), r);
const defined = (value) => (!(value === undefined));

function mixin(sources, target = {}) {
    sources = Array.isArray(sources) ? sources : [sources];
    sources.forEach(source => {
        let descriptors = Object.keys(source)
            .reduce((descriptors, key) => {
                descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
                return descriptors;
            }, {});
        // by default, Object.assign copies enumerable Symbols too
        Object.getOwnPropertySymbols(source)
            .forEach(sym => {
                let descriptor = Object.getOwnPropertyDescriptor(source, sym);
                if (descriptor.enumerable) {
                    descriptors[sym] = descriptor;
                }
            });
        Object.defineProperties(target, descriptors);
    });
    return target;
}

function extend(proto, extension) {
    return mixin(extension, Object.create(proto));
}

function hasProperties(object, key, ...keys) {
    let hasKey = object.hasOwnProperty(key)
    return !(keys.length) ? (hasKey) : (hasKey && hasProperties(object, ...keys));
}

function curry(f, args = [], this_var = null) {
    if (args.length === f.length) {
        return f.apply(this_var, args);
    } else {
        return function(...newArgs) {
            return f.curry([...args, ...newArgs], this_var || this)
        }
    }
}
const ceil = (n) => ((~~n) + ((~~n) !== n));
const floor = (n) => (n | 0)
const Fun = {
    curry,
}
const Obj = {
    hasProperties,
    extend,
    create,
    mixin,
    keys: Object.keys,
    map(o, f, target = {}, keys = Obj.keys(o)) {
        return Arr.mapto(keys, (k) => f(o[k], k, o, target, keys), target);
    },
    product(o, f, target = {}, keys) {
        Obj.keys(o).each(k => target[k] = f[k](o[k], k, o, target));
        return target;
    },
    Product(f) {
        return (o) => Obj.product(o, f)
    },
    symbolize(
        structure = {},
        symbolNames = Object.keys(structure),
        $ = Sym.Namespace(symbolNames),
        target = {
            init: structure.init,
            $: $
        }
    ) {
        symbolNames.each((name) => target[$[name]] = structure[name]);
        return target;
    }

}
const Arr = {
    mapto(keys, f, o = {}) {

        return keys.each((k) => o[k] = f(k));
    },
    mixin,
}
const Sym = {
    //An object whos members are symbols.
    Namespace(symbolNames) {
        return (Array.isArray(symbolNames) ?
            Arr.mapto(symbolNames, Symbol) :
            Obj.map(symbolNames, Symbol));
    },
    //Given an object whos members are indexed by strings
}



module.exports = {Obj, Sym, Arr, Fun, create, defined, extend, mixin, curry};

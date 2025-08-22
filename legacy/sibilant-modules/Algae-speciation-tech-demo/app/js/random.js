function weightedRandomElement(collection, f) {

    var count = 0,
        memoMap = (new Map());
    collection.each((el) => {
        let sub =f(el);
        memoMap.set(el, sub);
        return count += sub;
    });
    var rand = (count * Math.random()),
        sum = 0;
    let r = null;
    for (let el of collection) {
        sum += memoMap.get(el);
        if (rand < sum) {
            r = el;
            return r;
        }
    }
    throw new Error("failed to select a weighted random element")

};
var weightedRandomFromProp = (function weightedRandomFromProp$(collection, key) {
    /* weighted-random-from-prop eval.sibilant:91:0 */

    return weightedRandomElement(collection, (el) => {

        return el[key];

    });
});
module.exports.weightedRandomElement = weightedRandomElement;

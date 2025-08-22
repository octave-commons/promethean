require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/aaron/devel/apps/game-of-life/client/modules/tensors/image.js":[function(require,module,exports){
var rgb = (function rgb$(r, g, b) {
    /* rgb eval.sibilant:2:0 */

    return {
        r,
        g,
        b
    };
});
var createGrayscaleImage = (function createGrayscaleImage$(t) {
    /* create-grayscale-image inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return field(t).mul(dl.scalar(255, "float32"));

    }));
});
var randomGrayscale = (function randomGrayscale$(w, h) {
    /* random-grayscale inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return createGrayscaleImage(bitField(w, h));

    }));
});
var grayscaleToRgba = (function grayscaleToRgba$(imgs) {
    /* grayscale-to-rgba inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return imgs.tile([1, 1, 1, 4]);

    }));
});
var grayscaleToRgb = (function grayscaleToRgb$(imgs) {
    /* grayscale-to-rgb inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return imgs.tile([1, 1, 1, 3]);

    }));
});

function uint8c(arr) {

    return Uint8ClampedArray.from(arr);

};
async function image(t) {

    return (new ImageData(uint8c(await t.data()), t.shape[1], t.shape[2]));

};
},{}]},{},[]);

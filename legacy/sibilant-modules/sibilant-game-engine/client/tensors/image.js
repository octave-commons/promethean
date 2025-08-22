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

function(uint8c, arr(),
    return Uint8ClampedArray.from(arr);
);
async function image(t) {

    return (new ImageData(uint8c(await t.data()), t.shape[1], t.shape[2]));

};
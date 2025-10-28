export const left = (value) => ({ tag: 'left', value });
export const right = (value) => ({ tag: 'right', value });
export const isLeft = (either) => either.tag === 'left';
export const isRight = (either) => either.tag === 'right';
export const mapRight = (either, fn) => isRight(either) ? right(fn(either.value)) : either;
export const mapLeft = (either, fn) => isLeft(either) ? left(fn(either.value)) : either;
//# sourceMappingURL=either.js.map
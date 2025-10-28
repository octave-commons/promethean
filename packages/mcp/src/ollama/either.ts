export type Either<L, R> = Readonly<Left<L>> | Readonly<Right<R>>;

export type Left<L> = { readonly tag: 'left'; readonly value: L };
export type Right<R> = { readonly tag: 'right'; readonly value: R };

export const left = <L, R = never>(value: L): Either<L, R> => ({ tag: 'left', value });
export const right = <R, L = never>(value: R): Either<L, R> => ({ tag: 'right', value });

export const isLeft = <L, R>(either: Either<L, R>): either is Readonly<Left<L>> =>
  either.tag === 'left';
export const isRight = <L, R>(either: Either<L, R>): either is Readonly<Right<R>> =>
  either.tag === 'right';

export const mapRight = <L, A, B>(either: Either<L, A>, fn: (value: A) => B): Either<L, B> =>
  isRight(either) ? right(fn(either.value)) : either;

export const mapLeft = <L, R, B>(either: Either<L, R>, fn: (value: L) => B): Either<B, R> =>
  isLeft(either) ? left(fn(either.value)) : either;

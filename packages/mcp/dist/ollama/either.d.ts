export type Either<L, R> = Readonly<Left<L>> | Readonly<Right<R>>;
export type Left<L> = {
    readonly tag: 'left';
    readonly value: L;
};
export type Right<R> = {
    readonly tag: 'right';
    readonly value: R;
};
export declare const left: <L, R = never>(value: L) => Either<L, R>;
export declare const right: <R, L = never>(value: R) => Either<L, R>;
export declare const isLeft: <L, R>(either: Either<L, R>) => either is Readonly<Left<L>>;
export declare const isRight: <L, R>(either: Either<L, R>) => either is Readonly<Right<R>>;
export declare const mapRight: <L, A, B>(either: Either<L, A>, fn: (value: A) => B) => Either<L, B>;
export declare const mapLeft: <L, R, B>(either: Either<L, R>, fn: (value: L) => B) => Either<B, R>;
//# sourceMappingURL=either.d.ts.map
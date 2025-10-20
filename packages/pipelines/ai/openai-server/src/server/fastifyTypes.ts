import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyTypeProviderDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";

type DefaultFastifyInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
>;

type FastifyMethod<TName extends keyof DefaultFastifyInstance> =
  DefaultFastifyInstance[TName];

export type FastifyApp = {
  readonly register: FastifyMethod<"register">;
  readonly after: FastifyMethod<"after">;
  readonly get: FastifyMethod<"get">;
  readonly post: FastifyMethod<"post">;
  readonly swagger: FastifyMethod<"swagger">;
};

export type FastifyStaticApp = {
  readonly register: FastifyMethod<"register">;
  readonly get: FastifyMethod<"get">;
};

export type FastifyHealthApp = {
  readonly get: FastifyMethod<"get">;
};

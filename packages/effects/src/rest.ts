import type { ReadonlyDeep } from 'type-fest';

export type RestRequestPayload<TBody> = {
    readonly provider: string;
    readonly tenant: string;
    readonly route: string;
    readonly body: TBody;
};

export function restRequest<TBody>(
    provider: string,
    tenant: string,
    route: string,
    body: ReadonlyDeep<TBody>,
): RestRequestPayload<ReadonlyDeep<TBody>> {
    // stub: publish to bus
    return { provider, tenant, route, body };
}

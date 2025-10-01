export type MongoConnection = {
    readonly tenant: string;
    readonly db: string;
};

export function mongoForTenant(tenant: string, db: string): MongoConnection {
    // stubbed
    return { db, tenant };
}

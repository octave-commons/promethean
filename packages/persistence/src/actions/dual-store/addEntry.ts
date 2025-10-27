/**
 * Add an entry to the dual store (functional API)
 */
export async function addEntry(managerOrName: any, entry: DualStoreEntry<any, any>): Promise<void> {
    return insert(managerOrName, entry);
}

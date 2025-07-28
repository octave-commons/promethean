import { Message } from "ollama";
import {  CollectionEntry, CollectionManager } from "./collectionManager";

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')
export const formatMessage = (m: CollectionEntry<"text", "timestamp">): string =>
    `${m.metadata?.userName === "Duck" ? "You" : m.metadata.userName} ${m.metadata.isThought ? "thought" : "said"} (${timeAgo.format(new Date(m.timestamp).getTime()) }): ${m.text}`

export type GenericEntry = CollectionEntry<"text", "timestamp">

export class ContextManager {
    collections: Map<string, CollectionManager<string, string>>;
    constructor() {
        this.collections = new Map();
    }
    async createCollection(
        name: string,
        textKey: string,
        timeStampKey:string,
    ): Promise<CollectionManager<string, string>> {
        if (this.collections.has(name)) {
            throw new Error(`Collection ${name} already exists`);
        }
        const collectionManager = await CollectionManager.create<string, string>(name, textKey, timeStampKey);
        this.collections.set(name, collectionManager);
        return collectionManager;
    }
    async getAllRelatedDocuments(
        querys: string[],
        limit: number = 100
    ): Promise<CollectionEntry<"text", "timestamp">[]> {
        console.log("Getting related documents for querys:", querys.length, "with limit:", limit);
        const results = []
        for (const collection of this.collections.values()) {
            results.push(await collection.getMostRelevant(querys, limit))
        }
        return results.flat()
    }
    async getLatestDocuments(limit: number = 100): Promise<CollectionEntry<"text","timestamp">[]> {
        const result = [];
        for (const collection of this.collections.values()) {
            result.push(await collection.getMostRecent(limit))
        }
        console.log("Getting latest documents from collections:", this.collections.size);
        return result.flat()
    }
    getCollection(name: string): CollectionManager<string, string>  {
        if(!this.collections.has(name)) throw new Error(`Collection ${name} does not exist`);
        console.log("Getting collection:", name);
        return this.collections.get(name)  as CollectionManager<string, string>;
    }
    async compileContext(
        texts: string[] = [],
        recentLimit: number = 10, // how many recent documents to include
        queryLimit: number = 5, // how many of the recent documents to use in the query
        limit: number = 20 , // how many documents to return in total
        formatAssistantMessages = false
    ): Promise<Message[]> {
        console.log("Compiling context with texts:", texts.length, "and limit:", limit);
        const latest = await this.getLatestDocuments(recentLimit);
        const query = [...texts,...latest.map(doc => doc.text)].slice(-queryLimit)
        const related = await this.getAllRelatedDocuments(query, limit)
        const uniqueThoughts = new Set<string>();
        return Promise.all([related, latest]).then(([relatedDocs, latestDocs]) => {
            let results = [...relatedDocs, ...latestDocs]
                .filter(doc => {
                    if (!doc.text) return false; // filter out undefined text
                    if (uniqueThoughts.has(doc.text)) return false; // filter out duplicates
                    if(!doc.metadata) return false
                    uniqueThoughts.add(doc.text);
                    return true;
                })
                              .sort((a: GenericEntry, b: GenericEntry) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            console.log("You won't believe this but... the results are this long:", results.length)
            console.log("The limit was", limit)
            if (results.length > limit * this.collections.size * 2) {
                results = results.slice(-(limit * this.collections.size * 2))

            }

            // for(let r of results) {
            //     console.log(r)
            // }

            return results
                .map((m: CollectionEntry<"text", "timestamp">) => ({
                    role: m.metadata?.userName === "Duck" ? m.metadata?.isThought ? "system" : "assistant" : "user",
                    content: (
                        m.metadata?.userName === "Duck" ? (
                            formatAssistantMessages ?
                                formatMessage(m) :
                                m.text
                        ) : formatMessage(m))
                }))

        });
    }
}



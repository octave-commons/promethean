#!/usr/bin/env node

/**
 * Test script to verify unified content model implementation
 */

import {
    transformDualStoreEntry,
    transformIndexedFile,
    transformDiscordMessage,
    transformOpencodeEvent,
    validateIndexableContent,
    type IndexableContent,
    type ContentType,
    type ContentSource,
} from './unified-content-model.js';

async function testUnifiedContentModel() {
    console.log('🧪 Testing Unified Content Model...');

    try {
        // Test 1: Transform DualStoreEntry
        console.log('✅ Test 1: Transform DualStoreEntry');
        const dualStoreEntry = {
            id: 'test-dual-1',
            text: 'Test content from dual store',
            timestamp: Date.now(),
            metadata: {
                type: 'file',
                userName: 'test-user',
                vectorWriteSuccess: true,
                message_id: 'msg-test-1', // Add required message_id for message type
            },
        };

        const transformed1 = transformDualStoreEntry(dualStoreEntry);
        console.log('Transformed DualStoreEntry:', {
            id: transformed1.id,
            type: transformed1.type,
            source: transformed1.source,
            contentLength: transformed1.content.length,
            hasMetadata: !!transformed1.metadata,
        });

        // Test 2: Transform IndexedFile
        console.log('✅ Test 2: Transform IndexedFile');
        const indexedFile = {
            path: '/test/example.txt',
            content: 'Test file content',
        };

        const transformed2 = transformIndexedFile(indexedFile);
        console.log('Transformed IndexedFile:', {
            id: transformed2.id,
            type: transformed2.type,
            source: transformed2.source,
            path: (transformed2.metadata as any).path,
            contentLength: transformed2.content.length,
        });

        // Test 3: Transform Discord Message
        console.log('✅ Test 3: Transform Discord Message');
        const discordMessage = {
            id: 'discord-msg-1',
            content: 'Hello from Discord!',
            author_urn: 'discord:user:123',
            space_urn: 'discord:server:456',
            created_at: Date.now(),
            attachments: [
                {
                    urn: 'discord:attachment:789',
                    url: 'https://example.com/image.png',
                    content_type: 'image/png',
                    size: 1024,
                    sha256: 'abc123',
                },
            ],
        };

        const transformed3 = transformDiscordMessage(discordMessage);
        console.log('Transformed Discord Message:', {
            id: transformed3.id,
            type: transformed3.type,
            source: transformed3.source,
            contentLength: transformed3.content.length,
            hasAttachments: transformed3.attachments && transformed3.attachments.length > 0,
            attachmentCount: transformed3.attachments?.length || 0,
        });

        // Test 4: Transform OpenCode Event
        console.log('✅ Test 4: Transform OpenCode Event');
        const opencodeEvent = {
            id: 'opencode-event-1',
            type: 'session.created',
            timestamp: Date.now(),
            data: {
                sessionId: 'session-123',
                userId: 'user-456',
            },
            properties: {
                info: {
                    id: 'event-prop-1',
                    sessionID: 'session-123',
                },
            },
        };

        const transformed4 = transformOpencodeEvent(opencodeEvent);
        console.log('Transformed OpenCode Event:', {
            id: transformed4.id,
            type: transformed4.type,
            source: transformed4.source,
            contentLength: transformed4.content.length,
            eventType: (transformed4.metadata as any).event_type,
        });

        // Test 5: Validation
        console.log('✅ Test 5: Content Validation');

        // Valid content
        const validContent: IndexableContent = {
            id: 'valid-1',
            type: 'file',
            source: 'filesystem',
            content: 'Valid content',
            timestamp: Date.now(),
            metadata: {
                type: 'file',
                source: 'filesystem',
                path: '/valid/path.txt',
            },
        };

        const validResult = validateIndexableContent(validContent);
        console.log('Valid content validation:', {
            valid: validResult.valid,
            errorCount: validResult.errors.length,
            errors: validResult.errors,
        });

        // Invalid content (missing required fields)
        const invalidContent = {
            id: '', // Invalid empty ID
            type: 'invalid-type' as ContentType, // Invalid type
            source: 'filesystem',
            content: 'Content',
            timestamp: -1, // Invalid timestamp
            metadata: {
                type: 'file',
                source: 'filesystem',
            },
        } as IndexableContent;

        const invalidResult = validateIndexableContent(invalidContent);
        console.log('Invalid content validation:', {
            valid: invalidResult.valid,
            errorCount: invalidResult.errors.length,
            errors: invalidResult.errors,
        });

        // Test 6: Content Type Coverage
        console.log('✅ Test 6: Content Type Coverage');
        const contentTypes: ContentType[] = [
            'file',
            'message',
            'event',
            'session',
            'attachment',
            'thought',
            'document',
        ];

        const sources: ContentSource[] = ['filesystem', 'discord', 'opencode', 'agent', 'user', 'system', 'external'];

        console.log('Supported content types:', contentTypes.length);
        console.log('Supported content sources:', sources.length);

        // Verify all transformations produce valid content
        const allTransformed = [transformed1, transformed2, transformed3, transformed4];
        const validationResults = allTransformed.map(validateIndexableContent);

        // Debug each transformation
        allTransformed.forEach((transformed, index) => {
            const validation = validationResults[index];
            if (validation) {
                console.log(`Transformation ${index + 1} validation:`, {
                    id: transformed.id,
                    type: transformed.type,
                    source: transformed.source,
                    valid: validation.valid,
                    errors: validation.errors,
                });
            }
        });

        const allValid = validationResults.every((result) => result.valid);
        const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0);

        console.log('Transformation validation results:', {
            totalTransformed: allTransformed.length,
            allValid,
            totalErrors,
        });

        if (validResult.valid && !invalidResult.valid && allValid && totalErrors === 0) {
            console.log('🎉 All tests passed! Unified content model is working correctly.');
        } else {
            console.log('❌ Some tests failed!');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testUnifiedContentModel();
}

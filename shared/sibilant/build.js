// SPDX-License-Identifier: GPL-3.0-only
console.log('yo');
import lith from './dist/lang/sibilant.js';
import { mirrorWithHandler } from '@shared/ts/dist/fs/mirrorWrite.js';
import { dirname } from 'path';
import { promises } from 'fs';
const writeFile = promises.writeFile;
var injectHeaders = function injectHeaders$(source, relativeFile) {
    /* inject-headers dev/build.sibilant:15:0 */

    return (
        '(namespace hack)' +
        '(include "@shared/sibilant/headers/core.sibilant")' +
        '(import-namespace kit)' +
        '(include "@shared/sibilant/headers/interface.sibilant")' +
        '(import-namespace interface)' +
        '(include "@shared/sibilant/inc/litteral.sibilant")' +
        '(import-namespace rand)' +
        '(include "@shared/sibilant/inc/docs.sibilant")' +
        '(import-namespace docs)' +
        '(include "@shared/sibilant/inc/misc.sibilant")' +
        '(import-namespace misc)' +
        '(include "@shared/sibilant/inc/generators.sibilant")' +
        '(import-namespace generators)' +
        '(include "@shared/sibilant/inc/rand.sibilant")' +
        '(import-namespace async)' +
        function () {
            if (relativeFile) {
                return (
                    '(meta (assign sibilant.dir "' + dirname('./src/' + relativeFile) + '" ) null)'
                );
            } else {
                return '';
            }
        }.call(this) +
        source +
        function () {
            if (relativeFile) {
                return '(meta (assign sibilant.dir ".") null)';
            } else {
                return '';
            }
        }.call(this)
    );
};
async function transpile(file) {
    console.log(file.relPath);
    const source = await file.text();
    (function () {
        try {
            return function () {
                if (file.ext.toLowerCase() === '.sibilant') {
                    const { js, map } = lith(injectHeaders(source, file.srcPath), {
                        map: true,
                    });
                    const outRel = file.relPath.replace('.sibilant', '.js');
                    return {
                        path: outRel,
                        content: js,
                        encoding: 'utf8',
                    };
                }
            }.call(this);
        } catch (e) {
            return console.log(e);
        }
    }).call(this);
    if (file.ext.endsWith('.draft')) {
        return 'skip';
    }
    return 'copy';
}
const mirrorConfig = {
    concurrency: 16,
    overWrite: 'if-newer',
    hashCompoare: true,
    deleteExtra: 'files',
    dryRun: true,
    deleteFilter: (_abs, rel) => {
        return !rel.startsWith('.cache/');
    },
    predicate: (_abs, d) => {
        return !(d.isDirectory && (d.name === 'node_modules' || d.name === '.git'));
    },
};
await mirrorWithHandler('./src', './dist', transpile, mirrorConfig);

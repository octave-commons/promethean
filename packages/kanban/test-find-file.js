import { readdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function findTaskFilePath(tasksDir, taskUuid) {
  try {
    const files = await readdir(tasksDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.md')) {
        continue;
      }

      const filePath = path.join(tasksDir, file.name);
      try {
        const content = await readFile(filePath, 'utf8');
        if (content.includes(`uuid: "${taskUuid}"`) || content.includes(`uuid: '${taskUuid}'`)) {
          return filePath;
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Test with the UUID from the audit
const taskUuid = '2c7e9d46-09b2-4670-a3ac-381cb4f0c21e';
const tasksDir = '/home/err/devel/promethean/docs/agile/tasks';

const filePath = await findTaskFilePath(tasksDir, taskUuid);
console.log(`Found task file: ${filePath}`);

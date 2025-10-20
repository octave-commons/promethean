import { viewFile } from './packages/mcp/dist/files.js';

try {
  const result = await viewFile(process.cwd(), 'AGENTS.md');
  console.log('✅ Success: true');
  console.log('📁 Path:', result.path);
  console.log('📄 Total lines:', result.totalLines);
  console.log('📖 First 100 chars:', result.snippet.substring(0, 100) + '...');
} catch (error) {
  console.log('❌ Error:', error.message);
}

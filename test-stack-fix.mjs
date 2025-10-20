import { viewFile } from './packages/mcp/dist/files.js';

try {
  console.log('🔍 Testing AGENTS.md...');
  const result = await viewFile(process.cwd(), 'AGENTS.md');
  console.log('✅ Success!');
  console.log('📁 Path:', result.path);
  console.log('📄 Total lines:', result.totalLines);
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack:', error.stack);
}

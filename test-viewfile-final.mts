import { viewFile } from './packages/mcp/src/files.ts';

async function testViewFile() {
  try {
    console.log('🔍 Testing viewFile with AGENTS.md...');
    const result = await viewFile(process.cwd(), 'AGENTS.md');
    console.log('✅ Success!');
    console.log('📁 Path:', result.path);
    console.log('📄 Total lines:', result.totalLines);
    console.log('📖 First 100 chars:', result.snippet.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testViewFile();

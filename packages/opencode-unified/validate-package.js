#!/usr/bin/env node

// Simple test validation script
console.log('🧪 Running basic package validation...');

async function testBasicImports() {
  try {
    console.log('✅ Testing schemas import...');
    const { SCHEMAS_VERSION } = await import('./dist/schemas/index.js');
    console.log(`   Schemas version: ${SCHEMAS_VERSION}`);
    
    if (SCHEMAS_VERSION !== '1.0.0') {
      throw new Error(`Expected version 1.0.0, got ${SCHEMAS_VERSION}`);
    }
    
    console.log('✅ Testing main package import...');
    const { VERSION } = await import('./dist/typescript/index.js');
    console.log(`   Package version: ${VERSION}`);
    
    if (VERSION !== '1.0.0') {
      throw new Error(`Expected version 1.0.0, got ${VERSION}`);
    }
    
    console.log('✅ All basic imports working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Import test failed:', error.message);
    return false;
  }
}

async function testPackageStructure() {
  try {
    console.log('✅ Testing package structure...');
    const fs = await import('fs');
    const path = await import('path');
    
    const packageDir = './dist';
    const requiredFiles = [
      'typescript/index.js',
      'typescript/server/index.js',
      'typescript/client/index.js', 
      'typescript/shared/index.js',
      'typescript/electron/index.js',
      'schemas/index.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(packageDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required file: ${file}`);
      }
      console.log(`   ✓ ${file}`);
    }
    
    console.log('✅ All required files present!');
    return true;
  } catch (error) {
    console.error('❌ Structure test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('📦 Package: @promethean/opencode-unified');
  console.log('🎯 Testing consolidated package functionality\n');
  
  const results = await Promise.all([
    testBasicImports(),
    testPackageStructure()
  ]);
  
  const allPassed = results.every(r => r === true);
  
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${results.filter(r => r === true).length}/${results.length}`);
  
  if (allPassed) {
    console.log('🎉 All tests passed! Package consolidation successful.');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed. Check output above.');
    process.exit(1);
  }
}

main().catch(console.error);
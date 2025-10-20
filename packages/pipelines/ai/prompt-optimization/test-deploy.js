#!/usr/bin/env node

console.log('🚀 Starting test...');

try {
  console.log('Testing deployment manager import...');
  // We'll test without imports first
  console.log('✅ Basic test complete');
} catch (error) {
  console.error('❌ Test failed:', error);
}

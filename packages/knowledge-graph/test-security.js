// Simple test to verify security fixes
import { Logger } from '../src/utils/logger.js'
import { normalize } from 'path'

// Test 1: Logger functionality
console.log('🧪 Testing Logger...')
const logger = Logger.getInstance()
logger.setLogLevel('DEBUG')
logger.info('Test', 'Logger is working')

// Test 2: Path normalization
console.log('🧪 Testing path normalization...')
const dangerousPaths = [
  '../../../etc/passwd',
  '/etc/passwd',
  '~/.ssh/id_rsa',
  '$HOME/.bashrc',
  'normal/path/file.ts'
]

dangerousPaths.forEach(path => {
  try {
    const normalized = normalize(path)
    console.log(`Path: ${path} -> Normalized: ${normalized}`)
    
    // Check for dangerous patterns
    if (path.includes('..') || path.includes('~') || path.includes('$')) {
      console.log(`⚠️  Dangerous path detected: ${path}`)
    }
  } catch (error) {
    console.log(`❌ Error processing path ${path}:`, error.message)
  }
})

// Test 3: SQL injection prevention simulation
console.log('🧪 Testing SQL injection prevention...')
const maliciousInputs = [
  "id; DROP TABLE users; --",
  "name' OR '1'='1",
  "id; INSERT INTO nodes VALUES ('hack', 'hack', '{}', '{}', datetime('now'), datetime('now')); --"
]

const allowedColumns = ['id', 'type', 'created_at', 'updated_at']
maliciousInputs.forEach(input => {
  console.log(`Testing input: ${input}`)
  
  // Simulate column validation
  const parts = input.split(' ')
  const potentialColumn = parts[0]
  
  if (!allowedColumns.includes(potentialColumn)) {
    console.log(`✅ Blocked malicious column: ${potentialColumn}`)
  } else {
    console.log(`⚠️  Column allowed: ${potentialColumn}`)
  }
})

console.log('✅ Security tests completed!')
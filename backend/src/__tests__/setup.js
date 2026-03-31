// Runs before any module is loaded — set test-specific env vars here.
const fs = require('fs');

process.env.UPLOAD_DIR = '/tmp/agro-test-uploads';
process.env.AI_SERVICE_URL = 'http://test-ai-service.invalid:9999';
process.env.NODE_ENV = 'test';

// Ensure test upload directory exists
if (!fs.existsSync('/tmp/agro-test-uploads')) {
  fs.mkdirSync('/tmp/agro-test-uploads', { recursive: true });
}

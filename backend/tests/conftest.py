import os

# Test configuration never reads production secrets or sends real messages.
os.environ['DATABASE_URL'] = os.getenv('TEST_DATABASE_URL', 'postgresql://test:test@127.0.0.1:65432/test')
os.environ['JWT_SECRET'] = 'test-secret-only-not-for-deployment'
os.environ['ADMIN_EMAIL'] = 'test@example.com'
os.environ['ADMIN_PASSWORD'] = 'test-password'
os.environ['ENVIRONMENT'] = 'test'
os.environ['AUTOMATION_ENABLED'] = 'false'
os.environ['SMS_GATEWAY_LOGIN'] = ''
os.environ['SMS_GATEWAY_PASSWORD'] = ''

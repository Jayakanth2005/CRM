-- Create test database if it doesn't exist
SELECT 'CREATE DATABASE fastor7_crm_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fastor7_crm_test')\gexec

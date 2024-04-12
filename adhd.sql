\echo 'Delete and recreate adhd db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE adhd;
CREATE DATABASE adhd;
\connect adhd

\i adhd-schema.sql
\i adhd-seed.sql

-- \echo 'Delete and recreate adhd_test db?'
-- \prompt 'Return for yes or control-C to cancel > ' foo

-- DROP DATABASE adhd_test;
-- CREATE DATABASE adhd_test;
-- \connect adhd_test

\i adhd-schema.sql
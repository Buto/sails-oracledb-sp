--
-- create_Sails_schema.sql
--
--
-- create sails tablespace
--
CREATE TABLESPACE sails DATAFILE 'tbs_f2.dbf' SIZE 150M AUTOEXTEND ON MAXSIZE 150M;
--
-- create the sails user
--
CREATE USER sails   IDENTIFIED BY "sailspw"  DEFAULT TABLESPACE sails;
--
-- make sails dba
--
GRANT DBA TO sails;
--

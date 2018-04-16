FROM wnameless/oracle-xe-11g

MAINTAINER Ben Adams <nethoncho@gmail.com>

ADD init.sql /docker-entrypoint-initdb.d/

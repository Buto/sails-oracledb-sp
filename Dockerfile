FROM wnameless/oracle-xe-11g

MAINTAINER Ben Adams <nethoncho@gmail.com>

ADD test-init.sql /docker-entrypoint-initdb.d/

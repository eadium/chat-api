FROM ubuntu:18.04

LABEL Andryukhov Artem

ENV DEBIAN_FRONTEND 'noninteractive'
ENV PGVER 10
RUN echo 'Europe/Moscow' > '/etc/timezone'

RUN apt-get -y update
RUN apt-get -y install wget
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main' >> /etc/apt/sources.list.d/pgdg.list
RUN apt-get install -y  gnupg2
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get -y update
RUN apt-get install -y sysstat
RUN apt-get install -y postgresql-10
RUN wget -qO- https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

ENV WORK /opt/chat-api
WORKDIR $WORK

COPY database/schema.pgsql schema.pgsql

USER postgres

RUN /etc/init.d/postgresql start &&\
    psql --echo-all --command "CREATE USER manager WITH SUPERUSER PASSWORD 'manager';" &&\
    createdb -O manager chat &&\
    psql --dbname=chat --echo-all --command 'CREATE EXTENSION IF NOT EXISTS citext;' &&\
    psql chat -f schema.pgsql &&\
    /etc/init.d/postgresql stop

RUN echo "local all  all    trust" >> /etc/postgresql/$PGVER/main/pg_hba.conf

RUN echo "listen_addresses='*'" >> /etc/postgresql/$PGVER/main/postgresql.conf

USER root

ADD . $WORK/

RUN npm install
EXPOSE 9000

CMD service postgresql start && npm start

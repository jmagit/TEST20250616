# Curso de Pruebas de rendimiento

## Instalación de herramientas

- [JDK](https://www.oracle.com/java/technologies/downloads/)
- [JMeter](https://jmeter.apache.org/download_jmeter.cgi)
- [SoapUI](https://www.soapui.org/downloads/soapui/)

### JDBC Drivers

- [MySQL Connector Java](https://repo1.maven.org/maven2/mysql/mysql-connector-java/5.1.49/mysql-connector-java-5.1.49.jar)
- [MariaDB](https://repo1.maven.org/maven2/org/mariadb/jdbc/mariadb-java-client/3.5.0/mariadb-java-client-3.5.0.jar)
- [PostgreSQL JDBC Driver](https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.7/postgresql-42.7.7.jar)
- [Microsoft JDBC Driver for SQL Server](https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.10.0.jre8/mssql-jdbc-12.10.0.jre8.jar)
- [Oracle JDBC Driver](https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc8/23.2.0.0/ojdbc8-23.2.0.0.jar)

## Instalación Docker Desktop

- [WSL 2 feature on Windows](https://learn.microsoft.com/es-es/windows/wsl/install)
- [Docker Desktop](https://www.docker.com/get-started/)

### Configuración de puertos dinámicos en Windows

    netsh int ipv4 set dynamic tcp start=51000 num=14536

### Alternativas a Docker Desktop

- [Podman](https://podman.io/docs/installation)
- [Rancher Desktop](https://rancherdesktop.io/)

### Crear una red en Docker

    docker network create testing

## Desplegar contenedores

### Control de calidad

#### Servidor de correo electrónico

    docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog

    docker network connect testing mailhog

#### SonarQube

    docker run -d --name sonarQube --publish 9000:9000 --network testing sonarqube:latest

#### Web4Testing (Simulación de servidor web)

    docker run -d --name web-for-testing -p 8181:8181 jamarton/web-for-testing

### Bases de datos

#### MySQL

    podman run -d --name mysql-sakila -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 jamarton/mysql-sakila

#### MongoDB

    podman run -d --name mongodb -p 27017:27017 -v .:/externo jamarton/mongodb-contactos

#### Redis

    podman run -d --name redis -p 6379:6379 -p 6380:8001 -v .:/data redis/redis-stack:latest

#### Apache Cassandra

    docker run -d --name cassandra -p 9042:9042 -v .:/externo jamarton/cassandra-videodb
      
    docker exec -it cassandra sh -c /init-db.sh

### Agentes de Mensajería

#### RabbitMQ (AMQP)

    docker run -d --name rabbitmq -p 4369:4369 -p 5671:5671 -p 5672:5672 -p 15671:15671 -p 15672:15672 -p 25672:25672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=curso rabbitmq:management-alpine

#### Kafka (docker compose)

Fichero docker-compose.yml:

    services:
    zookeeper:
        image: confluentinc/cp-zookeeper:latest
        container_name: zookeeper
        environment:
        ZOOKEEPER_CLIENT_PORT: 2181
        ZOOKEEPER_TICK_TIME: 2000
        ports:
        - 2181:2181
    
    kafka:
        image: confluentinc/cp-kafka:latest
        container_name: kafka
        depends_on:
        - zookeeper
        ports:
        - 9092:9092
        environment:
        KAFKA_BROKER_ID: 1
        KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
        KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
        KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    
    kafka-ui:
        image: provectuslabs/kafka-ui
        container_name: kafka-ui
        depends_on:
        - kafka
        ports:
        - 9091:8080
        environment:
        - KAFKA_CLUSTERS_0_NAME=local
        - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:29092
        - KAFKA_CLUSTERS_0_ZOOKEEPER=localhost:2181

Comando:

    cd docker-compose\kafka && docker compose up -d

#### Apache ActiveMQ o Artemis (JMS)

    docker run -d --name activemq -p 1883:1883 -p 5672:5672 -p 8161:8161 -p 61613:61613 -p 61614:61614 -p 61616:61616 jamarton/activemq

    docker run -d --name artemis -p 1883:1883 -p 5445:5445 -p 5672:5672 -p 8161:8161 -p 9404:9404 -p 61613:61613 -p 61616:61616 jamarton/artemis

### Monitorización, supervisión y trazabilidad

#### Prometheus + Grafana (Monitorización)

Comando:

      cd docker-compose\prometheus && docker compose up -d

#### Prometheus (Monitorización)

    docker run -d -p 9090:9090 --network testing --name prometheus -v ./config-dir/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus

#### Grafana (Monitorización)

    docker run -d -p 3000:3000 --network testing --name grafana grafana/grafana

#### Influxdb (Monitorización)

    docker run -d --name influxdb --network testing -p 8086:8086 -e INFLUXDB_DB=jmeter influxdb:1.11

#### Zipkin (Trazabilidad)

    docker run -d -p 9411:9411 --network testing --name zipkin openzipkin/zipkin-slim

#### ELK (supervisión)

Stack:
- Elasticsearch
- Logstash
- Kibana
- MetricBeat
- FileBeat

Comando:

      cd docker-compose\elk && docker compose up -d

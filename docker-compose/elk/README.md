# Getting started with the Elastic Stack and Docker Compose: Part 2
## Elastic Agent, Fleet, and Elastic APM

This repo is in reference to the blog [Getting Started with the Elastic Stack and Docker Compose: Part 2](https://www.elastic.co/blog/getting-started-with-the-elastic-stack-and-docker-compose-part-2)

You can read the first blog: [Getting Started with the Elastic Stack and Docker Compose](https://www.elastic.co/blog/getting-started-with-the-elastic-stack-and-docker-compose) or visit it's [GitHub repo](https://github.com/elkninja/elastic-stack-docker-part-one)

Please feel free to ask any questions via issues [here](https://github.com/elkninja/elastic-stack-docker-part-two/issues), our [Community Slack](https://ela.st/slack), or over in our [Discuss Forums](https://discuss.elastic.co/).

Pull Requests welcome :)

 
## Resources:
### Fleet/Agent

Overview: https://www.elastic.co/guide/en/fleet/current/fleet-overview.html

Policy Creation, No UI: https://www.elastic.co/guide/en/fleet/current/create-a-policy-no-ui.html

Adding Fleet On-Prem: https://www.elastic.co/guide/en/fleet/current/add-fleet-server-on-prem.html

Agent in a Container: https://www.elastic.co/guide/en/fleet/current/elastic-agent-container.html

Air Gapped: https://www.elastic.co/guide/en/fleet/current/air-gapped.html

Secure Fleet: https://www.elastic.co/guide/en/fleet/current/secure-connections.html

### APM:

APM:
https://www.elastic.co/guide/en/apm/guide/current/upgrade-to-apm-integration.html

On Prem: https://www.elastic.co/guide/en/apm/guide/current/apm-integration-upgrade-steps.html

Fleet-Managed: https://www.elastic.co/guide/en/fleet/8.8/install-fleet-managed-elastic-agent.html

Queue Full Error:
https://www.elastic.co/guide/en/apm/server/current/common-problems.html#queue-full

## Configuraciones manuales

### Configurar Feet salida y agregar certificado en Kibana

Para obtener el Elasticsearch CA trusted fingerprint (huella del certificado):

    openssl x509 -fingerprint -sha256 -noout -in /certs/ca/ca.crt  | awk -F"=" {' print $2 '} | sed s/://g

Para obtener el certificado completo en formato texto:

    cat /certs/ca/ca.crt

Navegar a Kibana -> Fleet -> Settings (Configuración), sección Outputs (Salidas) y haremos clic en el botón Edit (Editar) debajo del encabezado Actions (Acciones).

**Hosts:** https://es01:9200

**Elasticsearch CA trusted fingerprint:** (copiar y pegar)

**Advanced YAML configuration**

    ssl:
      certificate_authorities:
      - |
        -----BEGIN CERTIFICATE-----
        (copiar y pegar)
        -----END CERTIFICATE-----

### Habilitar CORS en ElasticSearch (inseguro)

Editar /usr/share/elasticsearch/config/elasticsearch.yml y añadir:

    http.cors.enabled: true
    http.cors.allow-origin: '*'
    http.cors.allow-methods: "OPTIONS, HEAD, GET, POST, PUT, DELETE"
    http.cors.allow-credentials: true
    http.cors.allow-headers: "X-Requested-With, Content-Type, Content-Length,accept, authorization"

### Ejecutar manualmente

    docker run --rm -it --network elastic -v %cd%/logstash/:/usr/share/logstash/pipeline/ -v %cd%/logstash/ingest_data/:/usr/share/logstash/ingest_data/ -v %cd%/certs:/usr/share/logstash/certs -v %cd%/logstash/lib:/usr/share/logstash/pipeline_lib -e ELASTIC_USER=elastic -e ELASTIC_PASSWORD=microservicios -e ELASTIC_HOSTS=https://es01:9200 docker.elastic.co/logstash/logstash:8.15.0 sh

    logstash -f ./pipeline/pipeline7.conf --config.reload.automatic

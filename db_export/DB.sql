-- reestructuracion.cat_capacidad definition

-- Drop table

-- DROP TABLE reestructuracion.cat_capacidad;

CREATE TABLE reestructuracion.cat_capacidad (
	id_capacidad int4 DEFAULT nextval('reestructuracion.seq_capacidad'::regclass) NOT NULL, -- Identificador único auto-incremental de la capacidad de negocio
	nombre varchar(100) NOT NULL, -- Nombre descriptivo de la capacidad de negocio (ej: Gestión de Clientes, Procesamiento de Pagos)
	nivel varchar(50) NULL, -- Nivel jerárquico de la capacidad dentro de la taxonomía organizacional
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro. Se establece automáticamente al insertar
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de última modificación. Se actualiza automáticamente mediante trigger
	CONSTRAINT pk_capacidad PRIMARY KEY (id_capacidad)
);
COMMENT ON TABLE reestructuracion.cat_capacidad IS 'Catálogo de capacidades de negocio de nivel 1. Define las capacidades estratégicas principales de la organización según el marco de referencia de arquitectura empresarial.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_capacidad.id_capacidad IS 'Identificador único auto-incremental de la capacidad de negocio';
COMMENT ON COLUMN reestructuracion.cat_capacidad.nombre IS 'Nombre descriptivo de la capacidad de negocio (ej: Gestión de Clientes, Procesamiento de Pagos)';
COMMENT ON COLUMN reestructuracion.cat_capacidad.nivel IS 'Nivel jerárquico de la capacidad dentro de la taxonomía organizacional';
COMMENT ON COLUMN reestructuracion.cat_capacidad.fecha_creacion IS 'Fecha y hora de creación del registro. Se establece automáticamente al insertar';
COMMENT ON COLUMN reestructuracion.cat_capacidad.fecha_modificacion IS 'Fecha y hora de última modificación. Se actualiza automáticamente mediante trigger';

-- Table Triggers

create trigger trg_capacidad_fecha_mod before
update
    on
    reestructuracion.cat_capacidad for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_comp_logico_tipo_atributo definition

-- Drop table

-- DROP TABLE reestructuracion.cat_comp_logico_tipo_atributo;

CREATE TABLE reestructuracion.cat_comp_logico_tipo_atributo (
	id_comp_logico_tipo_atributo int4 DEFAULT nextval('reestructuracion.seq_comp_logico_tipo_atributo'::regclass) NOT NULL, -- Identificador único auto-incremental del tipo de atributo
	categoria varchar(50) NULL, -- Categoría de agrupación del atributo (ej: Técnico, Seguridad, Compliance)
	nombre varchar(100) NOT NULL, -- Nombre del atributo (ej: Puerto, Protocolo, TimeoutSegundos)
	descripcion varchar(500) NOT NULL, -- Descripción detallada del propósito y uso del atributo
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_comp_logico_tipo_atributo PRIMARY KEY (id_comp_logico_tipo_atributo)
);
COMMENT ON TABLE reestructuracion.cat_comp_logico_tipo_atributo IS 'Catálogo de tipos de atributos dinámicos para componentes lógicos. Implementa el patrón EAV (Entity-Attribute-Value) permitiendo extensibilidad en las propiedades de los componentes.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_comp_logico_tipo_atributo.id_comp_logico_tipo_atributo IS 'Identificador único auto-incremental del tipo de atributo';
COMMENT ON COLUMN reestructuracion.cat_comp_logico_tipo_atributo.categoria IS 'Categoría de agrupación del atributo (ej: Técnico, Seguridad, Compliance)';
COMMENT ON COLUMN reestructuracion.cat_comp_logico_tipo_atributo.nombre IS 'Nombre del atributo (ej: Puerto, Protocolo, TimeoutSegundos)';
COMMENT ON COLUMN reestructuracion.cat_comp_logico_tipo_atributo.descripcion IS 'Descripción detallada del propósito y uso del atributo';
COMMENT ON COLUMN reestructuracion.cat_comp_logico_tipo_atributo.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_comp_logico_tipo_atributo.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_comp_logico_tipo_atrib_fecha_mod before
update
    on
    reestructuracion.cat_comp_logico_tipo_atributo for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_componente_despliegue_tipo definition

-- Drop table

-- DROP TABLE reestructuracion.cat_componente_despliegue_tipo;

CREATE TABLE reestructuracion.cat_componente_despliegue_tipo (
	id_componente_despliegue_tipo int4 DEFAULT nextval('reestructuracion.seq_componente_despliegue_tipo'::regclass) NOT NULL, -- Identificador único auto-incremental del tipo de despliegue
	nombre_tipo varchar(100) NOT NULL, -- Nombre del tipo de despliegue (ej: Container, Virtual Machine, Serverless Function)
	descripcion varchar(500) NULL, -- Descripción de las características técnicas del tipo de despliegue
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_componente_despliegue_tipo PRIMARY KEY (id_componente_despliegue_tipo)
);
COMMENT ON TABLE reestructuracion.cat_componente_despliegue_tipo IS 'Catálogo de tipos de componentes de despliegue. Define las modalidades de implementación física (ej: Container Docker, Pod Kubernetes, VM, Lambda Function, Azure Function).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_componente_despliegue_tipo.id_componente_despliegue_tipo IS 'Identificador único auto-incremental del tipo de despliegue';
COMMENT ON COLUMN reestructuracion.cat_componente_despliegue_tipo.nombre_tipo IS 'Nombre del tipo de despliegue (ej: Container, Virtual Machine, Serverless Function)';
COMMENT ON COLUMN reestructuracion.cat_componente_despliegue_tipo.descripcion IS 'Descripción de las características técnicas del tipo de despliegue';
COMMENT ON COLUMN reestructuracion.cat_componente_despliegue_tipo.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_componente_despliegue_tipo.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_componente_despliegue_tipo_fecha_mod before
update
    on
    reestructuracion.cat_componente_despliegue_tipo for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_componente_logico_tipo definition

-- Drop table

-- DROP TABLE reestructuracion.cat_componente_logico_tipo;

CREATE TABLE reestructuracion.cat_componente_logico_tipo (
	id_componente_logico_tipo int4 DEFAULT nextval('reestructuracion.seq_componente_logico_tipo'::regclass) NOT NULL, -- Identificador único auto-incremental del tipo de componente lógico
	nombre_tipo varchar(100) NOT NULL, -- Nombre del tipo de componente (ej: Microservicio REST, API GraphQL, Base de Datos Relacional)
	descripcion varchar(500) NULL, -- Descripción de las características y uso típico del tipo de componente
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_componente_logico_tipo PRIMARY KEY (id_componente_logico_tipo)
);
COMMENT ON TABLE reestructuracion.cat_componente_logico_tipo IS 'Catálogo de tipos de componentes lógicos. Define las categorías arquitectónicas de componentes (ej: Microservicio, API Gateway, Base de Datos, Message Queue, Cache).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_componente_logico_tipo.id_componente_logico_tipo IS 'Identificador único auto-incremental del tipo de componente lógico';
COMMENT ON COLUMN reestructuracion.cat_componente_logico_tipo.nombre_tipo IS 'Nombre del tipo de componente (ej: Microservicio REST, API GraphQL, Base de Datos Relacional)';
COMMENT ON COLUMN reestructuracion.cat_componente_logico_tipo.descripcion IS 'Descripción de las características y uso típico del tipo de componente';
COMMENT ON COLUMN reestructuracion.cat_componente_logico_tipo.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_componente_logico_tipo.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_componente_logico_tipo_fecha_mod before
update
    on
    reestructuracion.cat_componente_logico_tipo for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_entorno definition

-- Drop table

-- DROP TABLE reestructuracion.cat_entorno;

CREATE TABLE reestructuracion.cat_entorno (
	id_entorno int4 DEFAULT nextval('reestructuracion.seq_entorno'::regclass) NOT NULL, -- Identificador único auto-incremental del entorno
	nombre varchar(100) NOT NULL, -- Nombre del entorno (ej: DEV, QA, UAT, PROD)
	descripcion varchar(500) NULL, -- Descripción del propósito y características del entorno
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_entorno PRIMARY KEY (id_entorno)
);
COMMENT ON TABLE reestructuracion.cat_entorno IS 'Catálogo de entornos de despliegue en el ciclo de vida del software (ej: Desarrollo, QA, UAT, Staging, Producción).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_entorno.id_entorno IS 'Identificador único auto-incremental del entorno';
COMMENT ON COLUMN reestructuracion.cat_entorno.nombre IS 'Nombre del entorno (ej: DEV, QA, UAT, PROD)';
COMMENT ON COLUMN reestructuracion.cat_entorno.descripcion IS 'Descripción del propósito y características del entorno';
COMMENT ON COLUMN reestructuracion.cat_entorno.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_entorno.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_entorno_fecha_mod before
update
    on
    reestructuracion.cat_entorno for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_estado definition

-- Drop table

-- DROP TABLE reestructuracion.cat_estado;

CREATE TABLE reestructuracion.cat_estado (
	id_estado int4 DEFAULT nextval('reestructuracion.seq_estado'::regclass) NOT NULL, -- Identificador único auto-incremental del estado
	nombre varchar(100) NOT NULL, -- Nombre del estado (ej: Activo, Inactivo, Deprecated, En Desarrollo)
	descripcion varchar(500) NULL, -- Descripción del significado y criterios del estado
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_estado PRIMARY KEY (id_estado)
);
COMMENT ON TABLE reestructuracion.cat_estado IS 'Catálogo de estados del ciclo de vida de aplicaciones y componentes (ej: En Desarrollo, Activo, Deprecated, Retirado, En Mantenimiento).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_estado.id_estado IS 'Identificador único auto-incremental del estado';
COMMENT ON COLUMN reestructuracion.cat_estado.nombre IS 'Nombre del estado (ej: Activo, Inactivo, Deprecated, En Desarrollo)';
COMMENT ON COLUMN reestructuracion.cat_estado.descripcion IS 'Descripción del significado y criterios del estado';
COMMENT ON COLUMN reestructuracion.cat_estado.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_estado.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_estado_fecha_mod before
update
    on
    reestructuracion.cat_estado for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_interface_atributo definition

-- Drop table

-- DROP TABLE reestructuracion.cat_interface_atributo;

CREATE TABLE reestructuracion.cat_interface_atributo (
	id_interface_atributo int4 DEFAULT nextval('reestructuracion.seq_interface_atributo'::regclass) NOT NULL, -- Identificador único auto-incremental del atributo de interfaz
	nombre_atributo varchar(100) NOT NULL, -- Nombre del atributo (ej: Puerto, Protocolo, Timeout, Authentication)
	descripcion varchar(500) NULL, -- Descripción del propósito y uso del atributo
	tipo varchar(50) NULL, -- Tipo de dato del atributo (ej: String, Number, Boolean, JSON)
	orden int4 NULL, -- Orden de presentación del atributo en formularios o interfaces de usuario
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	obligatorio varchar(10) NULL, -- Indica si el atributo es obligatorio para la interfaz
	CONSTRAINT pk_interface_atributo PRIMARY KEY (id_interface_atributo)
);
COMMENT ON TABLE reestructuracion.cat_interface_atributo IS 'Catálogo de atributos configurables para interfaces. Define metadatos extensibles para caracterizar interfaces (ej: Puerto, Protocolo, ContentType, Autenticación).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_interface_atributo.id_interface_atributo IS 'Identificador único auto-incremental del atributo de interfaz';
COMMENT ON COLUMN reestructuracion.cat_interface_atributo.nombre_atributo IS 'Nombre del atributo (ej: Puerto, Protocolo, Timeout, Authentication)';
COMMENT ON COLUMN reestructuracion.cat_interface_atributo.descripcion IS 'Descripción del propósito y uso del atributo';
COMMENT ON COLUMN reestructuracion.cat_interface_atributo.tipo IS 'Tipo de dato del atributo (ej: String, Number, Boolean, JSON)';
COMMENT ON COLUMN reestructuracion.cat_interface_atributo.orden IS 'Orden de presentación del atributo en formularios o interfaces de usuario';
COMMENT ON COLUMN reestructuracion.cat_interface_atributo.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_interface_atributo.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';
COMMENT ON COLUMN reestructuracion.cat_interface_atributo.obligatorio IS 'Indica si el atributo es obligatorio para la interfaz';

-- Table Triggers

create trigger trg_interface_atributo_fecha_mod before
update
    on
    reestructuracion.cat_interface_atributo for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_linea_negocio_principal definition

-- Drop table

-- DROP TABLE reestructuracion.cat_linea_negocio_principal;

CREATE TABLE reestructuracion.cat_linea_negocio_principal (
	id_linea_negocio_principal int4 DEFAULT nextval('reestructuracion.seq_linea_negocio_principal'::regclass) NOT NULL, -- Identificador único auto-incremental de la línea de negocio principal
	descripcion varchar(500) NOT NULL, -- Descripción de la línea de negocio principal y su alcance
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_linea_negocio_principal PRIMARY KEY (id_linea_negocio_principal)
);
COMMENT ON TABLE reestructuracion.cat_linea_negocio_principal IS 'Catálogo de líneas de negocio principales de la organización. Representa las divisiones de negocio de más alto nivel (ej: Banca Retail, Banca Corporativa, Seguros).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_linea_negocio_principal.id_linea_negocio_principal IS 'Identificador único auto-incremental de la línea de negocio principal';
COMMENT ON COLUMN reestructuracion.cat_linea_negocio_principal.descripcion IS 'Descripción de la línea de negocio principal y su alcance';
COMMENT ON COLUMN reestructuracion.cat_linea_negocio_principal.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_linea_negocio_principal.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_linea_negocio_principal_fecha_mod before
update
    on
    reestructuracion.cat_linea_negocio_principal for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_macroproceso definition

-- Drop table

-- DROP TABLE reestructuracion.cat_macroproceso;

CREATE TABLE reestructuracion.cat_macroproceso (
	id_macroproceso int4 DEFAULT nextval('reestructuracion.seq_macroproceso'::regclass) NOT NULL, -- Identificador único auto-incremental del macroproceso
	nombre varchar(300) NOT NULL, -- Nombre del macroproceso (ej: Gestión Comercial, Operaciones, Gestión Financiera)
	categoria varchar(50) NULL, -- Categoría del macroproceso (Estratégico, Misional, Apoyo)
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_macroproceso PRIMARY KEY (id_macroproceso)
);
COMMENT ON TABLE reestructuracion.cat_macroproceso IS 'Catálogo de macroprocesos de negocio según clasificación estándar (Estratégicos, Misionales/Core, Apoyo/Soporte). Nivel más alto de la jerarquía de procesos.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_macroproceso.id_macroproceso IS 'Identificador único auto-incremental del macroproceso';
COMMENT ON COLUMN reestructuracion.cat_macroproceso.nombre IS 'Nombre del macroproceso (ej: Gestión Comercial, Operaciones, Gestión Financiera)';
COMMENT ON COLUMN reestructuracion.cat_macroproceso.categoria IS 'Categoría del macroproceso (Estratégico, Misional, Apoyo)';
COMMENT ON COLUMN reestructuracion.cat_macroproceso.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_macroproceso.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_macroproceso_fecha_mod before
update
    on
    reestructuracion.cat_macroproceso for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_modelo_servicio definition

-- Drop table

-- DROP TABLE reestructuracion.cat_modelo_servicio;

CREATE TABLE reestructuracion.cat_modelo_servicio (
	id_modelo_servicio int4 DEFAULT nextval('reestructuracion.seq_modelo_servicio'::regclass) NOT NULL, -- Identificador único auto-incremental del modelo de servicio
	nombre varchar(100) NOT NULL, -- Nombre del modelo de servicio (ej: SaaS, PaaS, On-Premise)
	descripcion varchar(500) NULL, -- Descripción de las características y responsabilidades del modelo
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_modelo_servicio PRIMARY KEY (id_modelo_servicio)
);
COMMENT ON TABLE reestructuracion.cat_modelo_servicio IS 'Catálogo de modelos de servicio y delivery de aplicaciones (ej: SaaS, PaaS, IaaS, On-Premise, Híbrido, Outsourcing).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_modelo_servicio.id_modelo_servicio IS 'Identificador único auto-incremental del modelo de servicio';
COMMENT ON COLUMN reestructuracion.cat_modelo_servicio.nombre IS 'Nombre del modelo de servicio (ej: SaaS, PaaS, On-Premise)';
COMMENT ON COLUMN reestructuracion.cat_modelo_servicio.descripcion IS 'Descripción de las características y responsabilidades del modelo';
COMMENT ON COLUMN reestructuracion.cat_modelo_servicio.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_modelo_servicio.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_modelo_servicio_fecha_mod before
update
    on
    reestructuracion.cat_modelo_servicio for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_plataforma definition

-- Drop table

-- DROP TABLE reestructuracion.cat_plataforma;

CREATE TABLE reestructuracion.cat_plataforma (
	id_plataforma int4 DEFAULT nextval('reestructuracion.seq_plataforma'::regclass) NOT NULL, -- Identificador único auto-incremental de la plataforma
	nombre varchar(100) NOT NULL, -- Nombre de la plataforma (ej: AWS, Azure, Google Cloud Platform)
	descripcion varchar(500) NULL, -- Descripción de las características y servicios de la plataforma
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_plataforma PRIMARY KEY (id_plataforma)
);
COMMENT ON TABLE reestructuracion.cat_plataforma IS 'Catálogo de plataformas de infraestructura y cloud providers (ej: AWS, Azure, GCP, On-Premise DataCenter, IBM Cloud).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_plataforma.id_plataforma IS 'Identificador único auto-incremental de la plataforma';
COMMENT ON COLUMN reestructuracion.cat_plataforma.nombre IS 'Nombre de la plataforma (ej: AWS, Azure, Google Cloud Platform)';
COMMENT ON COLUMN reestructuracion.cat_plataforma.descripcion IS 'Descripción de las características y servicios de la plataforma';
COMMENT ON COLUMN reestructuracion.cat_plataforma.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_plataforma.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_plataforma_fecha_mod before
update
    on
    reestructuracion.cat_plataforma for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_tecnologia definition

-- Drop table

-- DROP TABLE reestructuracion.cat_tecnologia;

CREATE TABLE reestructuracion.cat_tecnologia (
	id_tecnologia int4 DEFAULT nextval('reestructuracion.seq_tecnologia'::regclass) NOT NULL, -- Identificador único auto-incremental de la tecnología
	nombre varchar(100) NOT NULL, -- Nombre de la tecnología (ej: Java 17, Python 3.11, React 18, PostgreSQL 15)
	descripcion varchar(500) NULL, -- Descripción de las características y uso de la tecnología
	categoria varchar(50) NULL, -- Categoría de la tecnología (ej: Lenguaje, Framework, Base de Datos, Orquestación, Mensajería)
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_tecnologia PRIMARY KEY (id_tecnologia)
);
COMMENT ON TABLE reestructuracion.cat_tecnologia IS 'Catálogo de tecnologías, lenguajes de programación, frameworks y herramientas (ej: Java, Python, React, PostgreSQL, Docker, Kubernetes).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_tecnologia.id_tecnologia IS 'Identificador único auto-incremental de la tecnología';
COMMENT ON COLUMN reestructuracion.cat_tecnologia.nombre IS 'Nombre de la tecnología (ej: Java 17, Python 3.11, React 18, PostgreSQL 15)';
COMMENT ON COLUMN reestructuracion.cat_tecnologia.descripcion IS 'Descripción de las características y uso de la tecnología';
COMMENT ON COLUMN reestructuracion.cat_tecnologia.categoria IS 'Categoría de la tecnología (ej: Lenguaje, Framework, Base de Datos, Orquestación, Mensajería)';
COMMENT ON COLUMN reestructuracion.cat_tecnologia.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_tecnologia.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_tecnologia_fecha_mod before
update
    on
    reestructuracion.cat_tecnologia for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_tipo_interfaz definition

-- Drop table

-- DROP TABLE reestructuracion.cat_tipo_interfaz;

CREATE TABLE reestructuracion.cat_tipo_interfaz (
	id_tipo_interfaz int4 DEFAULT nextval('reestructuracion.seq_tipo_interfaz'::regclass) NOT NULL, -- Identificador único auto-incremental del tipo de interfaz
	nombre_tipo varchar(100) NOT NULL, -- Nombre del tipo de interfaz (ej: REST, SOAP, GraphQL, gRPC)
	descripcion varchar(500) NULL, -- Descripción de las características y protocolos del tipo de interfaz
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_tipo_interfaz PRIMARY KEY (id_tipo_interfaz)
);
COMMENT ON TABLE reestructuracion.cat_tipo_interfaz IS 'Catálogo de tipos de interfaces de integración (ej: REST API, SOAP Web Service, GraphQL, gRPC, WebSocket, Message Queue, FTP).';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_tipo_interfaz.id_tipo_interfaz IS 'Identificador único auto-incremental del tipo de interfaz';
COMMENT ON COLUMN reestructuracion.cat_tipo_interfaz.nombre_tipo IS 'Nombre del tipo de interfaz (ej: REST, SOAP, GraphQL, gRPC)';
COMMENT ON COLUMN reestructuracion.cat_tipo_interfaz.descripcion IS 'Descripción de las características y protocolos del tipo de interfaz';
COMMENT ON COLUMN reestructuracion.cat_tipo_interfaz.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_tipo_interfaz.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_tipo_interfaz_fecha_mod before
update
    on
    reestructuracion.cat_tipo_interfaz for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_capacidad_nivel_2 definition

-- Drop table

-- DROP TABLE reestructuracion.cat_capacidad_nivel_2;

CREATE TABLE reestructuracion.cat_capacidad_nivel_2 (
	id_capacidad_nivel_2 int4 DEFAULT nextval('reestructuracion.seq_capacidad_nivel_2'::regclass) NOT NULL, -- Identificador único auto-incremental de la capacidad de nivel 2
	id_capacidad int4 NOT NULL, -- Referencia a la capacidad de nivel 1 padre
	nombre varchar(100) NOT NULL, -- Nombre descriptivo de la sub-capacidad de negocio
	nivel varchar(50) NULL, -- Nivel jerárquico específico de esta capacidad
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_capacidad_nivel_2 PRIMARY KEY (id_capacidad_nivel_2),
	CONSTRAINT fk_capacidad_nvl2_capacidad FOREIGN KEY (id_capacidad) REFERENCES reestructuracion.cat_capacidad(id_capacidad)
);
COMMENT ON TABLE reestructuracion.cat_capacidad_nivel_2 IS 'Catálogo de capacidades de negocio de nivel 2. Descompone las capacidades principales en sub-capacidades más específicas.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_2.id_capacidad_nivel_2 IS 'Identificador único auto-incremental de la capacidad de nivel 2';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_2.id_capacidad IS 'Referencia a la capacidad de nivel 1 padre';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_2.nombre IS 'Nombre descriptivo de la sub-capacidad de negocio';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_2.nivel IS 'Nivel jerárquico específico de esta capacidad';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_2.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_2.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_capacidad_nivel_2_fecha_mod before
update
    on
    reestructuracion.cat_capacidad_nivel_2 for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_capacidad_nivel_3 definition

-- Drop table

-- DROP TABLE reestructuracion.cat_capacidad_nivel_3;

CREATE TABLE reestructuracion.cat_capacidad_nivel_3 (
	id_capacidad_nivel_3 int4 DEFAULT nextval('reestructuracion.seq_capacidad_nivel_3'::regclass) NOT NULL, -- Identificador único auto-incremental de la capacidad de nivel 3
	id_capacidad_nivel_2 int4 NOT NULL, -- Referencia a la capacidad de nivel 2 padre
	nombre varchar(300) NOT NULL, -- Nombre descriptivo de la capacidad detallada de negocio
	nivel varchar(50) NULL, -- Nivel jerárquico específico de esta capacidad
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_capacidad_nivel_3 PRIMARY KEY (id_capacidad_nivel_3),
	CONSTRAINT fk_capacidad_nvl3_nvl2 FOREIGN KEY (id_capacidad_nivel_2) REFERENCES reestructuracion.cat_capacidad_nivel_2(id_capacidad_nivel_2)
);
COMMENT ON TABLE reestructuracion.cat_capacidad_nivel_3 IS 'Catálogo de capacidades de negocio de nivel 3. Representa el nivel más detallado de descomposición de capacidades, directamente relacionado con procesos y aplicaciones.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_3.id_capacidad_nivel_3 IS 'Identificador único auto-incremental de la capacidad de nivel 3';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_3.id_capacidad_nivel_2 IS 'Referencia a la capacidad de nivel 2 padre';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_3.nombre IS 'Nombre descriptivo de la capacidad detallada de negocio';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_3.nivel IS 'Nivel jerárquico específico de esta capacidad';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_3.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_capacidad_nivel_3.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_capacidad_nivel_3_fecha_mod before
update
    on
    reestructuracion.cat_capacidad_nivel_3 for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_linea_negocio definition

-- Drop table

-- DROP TABLE reestructuracion.cat_linea_negocio;

CREATE TABLE reestructuracion.cat_linea_negocio (
	id_linea_negocio int4 DEFAULT nextval('reestructuracion.seq_linea_negocio'::regclass) NOT NULL, -- Identificador único auto-incremental de la línea de negocio
	id_linea_negocio_principal int4 NOT NULL, -- Referencia a la línea de negocio principal padre
	tipo_linea_negocio varchar(100) NOT NULL, -- Tipo o nombre específico de la línea de negocio (ej: Tarjetas de Crédito, Préstamos Hipotecarios)
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_linea_negocio PRIMARY KEY (id_linea_negocio),
	CONSTRAINT fk_linea_negocio_principal FOREIGN KEY (id_linea_negocio_principal) REFERENCES reestructuracion.cat_linea_negocio_principal(id_linea_negocio_principal)
);
COMMENT ON TABLE reestructuracion.cat_linea_negocio IS 'Catálogo de líneas de negocio específicas agrupadas por línea principal. Representa sub-divisiones o productos específicos dentro de cada línea principal.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_linea_negocio.id_linea_negocio IS 'Identificador único auto-incremental de la línea de negocio';
COMMENT ON COLUMN reestructuracion.cat_linea_negocio.id_linea_negocio_principal IS 'Referencia a la línea de negocio principal padre';
COMMENT ON COLUMN reestructuracion.cat_linea_negocio.tipo_linea_negocio IS 'Tipo o nombre específico de la línea de negocio (ej: Tarjetas de Crédito, Préstamos Hipotecarios)';
COMMENT ON COLUMN reestructuracion.cat_linea_negocio.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_linea_negocio.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_linea_negocio_fecha_mod before
update
    on
    reestructuracion.cat_linea_negocio for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_proceso definition

-- Drop table

-- DROP TABLE reestructuracion.cat_proceso;

CREATE TABLE reestructuracion.cat_proceso (
	id_proceso int4 DEFAULT nextval('reestructuracion.seq_proceso'::regclass) NOT NULL, -- Identificador único auto-incremental del proceso
	id_macroproceso int4 NOT NULL, -- Referencia al macroproceso padre
	nombre varchar(300) NOT NULL, -- Nombre del proceso (ej: Originación de Crédito, Atención al Cliente, Cobranza)
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_proceso PRIMARY KEY (id_proceso),
	CONSTRAINT fk_proceso_macroproceso FOREIGN KEY (id_macroproceso) REFERENCES reestructuracion.cat_macroproceso(id_macroproceso)
);
COMMENT ON TABLE reestructuracion.cat_proceso IS 'Catálogo de procesos de negocio agrupados por macroproceso. Segundo nivel de la jerarquía de procesos.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_proceso.id_proceso IS 'Identificador único auto-incremental del proceso';
COMMENT ON COLUMN reestructuracion.cat_proceso.id_macroproceso IS 'Referencia al macroproceso padre';
COMMENT ON COLUMN reestructuracion.cat_proceso.nombre IS 'Nombre del proceso (ej: Originación de Crédito, Atención al Cliente, Cobranza)';
COMMENT ON COLUMN reestructuracion.cat_proceso.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_proceso.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_proceso_fecha_mod before
update
    on
    reestructuracion.cat_proceso for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.cat_subproceso definition

-- Drop table

-- DROP TABLE reestructuracion.cat_subproceso;

CREATE TABLE reestructuracion.cat_subproceso (
	id_subproceso int4 DEFAULT nextval('reestructuracion.seq_subproceso'::regclass) NOT NULL, -- Identificador único auto-incremental del subproceso
	id_proceso int4 NOT NULL, -- Referencia al proceso padre
	nivel varchar(50) NULL, -- Nivel de detalle del subproceso dentro de su jerarquía
	nombre varchar(500) NULL, -- Nombre del subproceso (ej: Validación de Identidad, Evaluación Crediticia, Desembolso)
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_subproceso PRIMARY KEY (id_subproceso),
	CONSTRAINT fk_subproceso_proceso FOREIGN KEY (id_proceso) REFERENCES reestructuracion.cat_proceso(id_proceso)
);
COMMENT ON TABLE reestructuracion.cat_subproceso IS 'Catálogo de subprocesos de negocio agrupados por proceso. Nivel más detallado de la jerarquía de procesos, directamente soportado por aplicaciones.';

-- Column comments

COMMENT ON COLUMN reestructuracion.cat_subproceso.id_subproceso IS 'Identificador único auto-incremental del subproceso';
COMMENT ON COLUMN reestructuracion.cat_subproceso.id_proceso IS 'Referencia al proceso padre';
COMMENT ON COLUMN reestructuracion.cat_subproceso.nivel IS 'Nivel de detalle del subproceso dentro de su jerarquía';
COMMENT ON COLUMN reestructuracion.cat_subproceso.nombre IS 'Nombre del subproceso (ej: Validación de Identidad, Evaluación Crediticia, Desembolso)';
COMMENT ON COLUMN reestructuracion.cat_subproceso.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.cat_subproceso.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_subproceso_fecha_mod before
update
    on
    reestructuracion.cat_subproceso for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.rel_subproceso_capacidad_nvl_3 definition

-- Drop table

-- DROP TABLE reestructuracion.rel_subproceso_capacidad_nvl_3;

CREATE TABLE reestructuracion.rel_subproceso_capacidad_nvl_3 (
	id_subproceso_capacidad_nvl_3 int4 DEFAULT nextval('reestructuracion.seq_subproceso_capacidad_nvl_3'::regclass) NOT NULL, -- Identificador único auto-incremental de la relación
	id_subproceso int4 NOT NULL, -- Referencia al subproceso
	id_capacidad_nivel_3 int4 NOT NULL, -- Referencia a la capacidad de negocio de nivel 3
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_subproceso_capacidad_nvl_3 PRIMARY KEY (id_subproceso_capacidad_nvl_3),
	CONSTRAINT fk_subproc_cap_nvl3_capacidad FOREIGN KEY (id_capacidad_nivel_3) REFERENCES reestructuracion.cat_capacidad_nivel_3(id_capacidad_nivel_3),
	CONSTRAINT fk_subproc_cap_nvl3_subproc FOREIGN KEY (id_subproceso) REFERENCES reestructuracion.cat_subproceso(id_subproceso)
);
COMMENT ON TABLE reestructuracion.rel_subproceso_capacidad_nvl_3 IS 'Relación muchos-a-muchos entre subprocesos y capacidades de nivel 3. Mapea qué subprocesos requieren qué capacidades.';

-- Column comments

COMMENT ON COLUMN reestructuracion.rel_subproceso_capacidad_nvl_3.id_subproceso_capacidad_nvl_3 IS 'Identificador único auto-incremental de la relación';
COMMENT ON COLUMN reestructuracion.rel_subproceso_capacidad_nvl_3.id_subproceso IS 'Referencia al subproceso';
COMMENT ON COLUMN reestructuracion.rel_subproceso_capacidad_nvl_3.id_capacidad_nivel_3 IS 'Referencia a la capacidad de negocio de nivel 3';
COMMENT ON COLUMN reestructuracion.rel_subproceso_capacidad_nvl_3.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.rel_subproceso_capacidad_nvl_3.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_subproceso_capacidad_nvl_3_fecha_mod before
update
    on
    reestructuracion.rel_subproceso_capacidad_nvl_3 for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.rel_subproceso_linea_negocio definition

-- Drop table

-- DROP TABLE reestructuracion.rel_subproceso_linea_negocio;

CREATE TABLE reestructuracion.rel_subproceso_linea_negocio (
	id_subproceso_linea_negocio int4 DEFAULT nextval('reestructuracion.seq_subproceso_linea_negocio'::regclass) NOT NULL, -- Identificador único auto-incremental de la relación
	id_subproceso int4 NOT NULL, -- Referencia al subproceso
	id_linea_negocio int4 NOT NULL, -- Referencia a la línea de negocio
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_subproceso_linea_negocio PRIMARY KEY (id_subproceso_linea_negocio),
	CONSTRAINT fk_subproc_ln_linea_negocio FOREIGN KEY (id_linea_negocio) REFERENCES reestructuracion.cat_linea_negocio(id_linea_negocio),
	CONSTRAINT fk_subproc_ln_subproceso FOREIGN KEY (id_subproceso) REFERENCES reestructuracion.cat_subproceso(id_subproceso)
);
COMMENT ON TABLE reestructuracion.rel_subproceso_linea_negocio IS 'Relación muchos-a-muchos entre subprocesos y líneas de negocio. Mapea qué subprocesos pertenecen a qué líneas de negocio.';

-- Column comments

COMMENT ON COLUMN reestructuracion.rel_subproceso_linea_negocio.id_subproceso_linea_negocio IS 'Identificador único auto-incremental de la relación';
COMMENT ON COLUMN reestructuracion.rel_subproceso_linea_negocio.id_subproceso IS 'Referencia al subproceso';
COMMENT ON COLUMN reestructuracion.rel_subproceso_linea_negocio.id_linea_negocio IS 'Referencia a la línea de negocio';
COMMENT ON COLUMN reestructuracion.rel_subproceso_linea_negocio.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.rel_subproceso_linea_negocio.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_subproceso_linea_negocio_fecha_mod before
update
    on
    reestructuracion.rel_subproceso_linea_negocio for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.tbl_aplicacion definition

-- Drop table

-- DROP TABLE reestructuracion.tbl_aplicacion;

CREATE TABLE reestructuracion.tbl_aplicacion (
	id_aplicacion int4 DEFAULT nextval('reestructuracion.seq_aplicacion'::regclass) NOT NULL, -- Identificador único auto-incremental de la aplicación
	id_modelo_servicio int4 NOT NULL, -- Referencia al modelo de servicio (SaaS, On-Premise, etc)
	id_estado int4 NOT NULL, -- Referencia al estado actual de la aplicación
	nombre varchar(100) NOT NULL, -- Nombre de la aplicación (ej: Sistema de Originación Digital, CRM Salesforce)
	descripcion varchar(500) NULL, -- Descripción detallada del propósito y funcionalidad de la aplicación
	proveedor varchar(200) NULL, -- Nombre del proveedor o vendor de la aplicación (si aplica)
	fabricante varchar(200) NULL, -- Nombre del fabricante original del software (si difiere del proveedor)
	criticidad varchar(50) NULL, -- Nivel de criticidad de la aplicación (Alta, Media, Baja) según impacto en el negocio
	responsable varchar(200) NULL, -- Nombre del responsable o líder técnico de la aplicación
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_aplicacion PRIMARY KEY (id_aplicacion),
	CONSTRAINT fk_aplicacion_estado FOREIGN KEY (id_estado) REFERENCES reestructuracion.cat_estado(id_estado),
	CONSTRAINT fk_aplicacion_modelo_servicio FOREIGN KEY (id_modelo_servicio) REFERENCES reestructuracion.cat_modelo_servicio(id_modelo_servicio)
);
CREATE INDEX idx_aplicacion_estado ON reestructuracion.tbl_aplicacion USING btree (id_estado);
CREATE INDEX idx_aplicacion_fecha_mod ON reestructuracion.tbl_aplicacion USING btree (fecha_modificacion);
CREATE INDEX idx_aplicacion_nombre ON reestructuracion.tbl_aplicacion USING btree (nombre);
COMMENT ON TABLE reestructuracion.tbl_aplicacion IS 'Tabla principal del portafolio de aplicaciones de la organización. Contiene el inventario completo de sistemas y aplicaciones de software.';

-- Column comments

COMMENT ON COLUMN reestructuracion.tbl_aplicacion.id_aplicacion IS 'Identificador único auto-incremental de la aplicación';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.id_modelo_servicio IS 'Referencia al modelo de servicio (SaaS, On-Premise, etc)';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.id_estado IS 'Referencia al estado actual de la aplicación';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.nombre IS 'Nombre de la aplicación (ej: Sistema de Originación Digital, CRM Salesforce)';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.descripcion IS 'Descripción detallada del propósito y funcionalidad de la aplicación';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.proveedor IS 'Nombre del proveedor o vendor de la aplicación (si aplica)';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.fabricante IS 'Nombre del fabricante original del software (si difiere del proveedor)';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.criticidad IS 'Nivel de criticidad de la aplicación (Alta, Media, Baja) según impacto en el negocio';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.responsable IS 'Nombre del responsable o líder técnico de la aplicación';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.tbl_aplicacion.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_aplicacion_fecha_mod before
update
    on
    reestructuracion.tbl_aplicacion for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.tbl_componente_despliegue definition

-- Drop table

-- DROP TABLE reestructuracion.tbl_componente_despliegue;

CREATE TABLE reestructuracion.tbl_componente_despliegue (
	id_componente_despliegue int4 DEFAULT nextval('reestructuracion.seq_componente_despliegue'::regclass) NOT NULL, -- Identificador único auto-incremental de la instancia de despliegue
	id_componente_despliegue_tipo int4 NOT NULL, -- Referencia al tipo de despliegue (Container, VM, etc)
	id_entorno int4 NOT NULL, -- Referencia al entorno donde está desplegado (DEV, QA, PROD)
	id_plataforma int4 NOT NULL, -- Referencia a la plataforma de infraestructura (AWS, Azure, etc)
	replicas int2 NULL, -- Número de réplicas o instancias del componente en el entorno (para alta disponibilidad)
	componente varchar(200) NULL, -- Nombre específico de la instancia de despliegue
	descripcion varchar(500) NULL, -- Descripción de características específicas de esta instancia de despliegue
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_componente_despliegue PRIMARY KEY (id_componente_despliegue),
	CONSTRAINT fk_comp_desp_entorno FOREIGN KEY (id_entorno) REFERENCES reestructuracion.cat_entorno(id_entorno),
	CONSTRAINT fk_comp_desp_plataforma FOREIGN KEY (id_plataforma) REFERENCES reestructuracion.cat_plataforma(id_plataforma),
	CONSTRAINT fk_comp_desp_tipo FOREIGN KEY (id_componente_despliegue_tipo) REFERENCES reestructuracion.cat_componente_despliegue_tipo(id_componente_despliegue_tipo)
);
CREATE INDEX idx_comp_desp_entorno_plat ON reestructuracion.tbl_componente_despliegue USING btree (id_entorno, id_plataforma);
COMMENT ON TABLE reestructuracion.tbl_componente_despliegue IS 'Instancias físicas de despliegue de componentes lógicos. Representa cómo y dónde están desplegados los componentes en la infraestructura.';

-- Column comments

COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.id_componente_despliegue IS 'Identificador único auto-incremental de la instancia de despliegue';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.id_componente_despliegue_tipo IS 'Referencia al tipo de despliegue (Container, VM, etc)';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.id_entorno IS 'Referencia al entorno donde está desplegado (DEV, QA, PROD)';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.id_plataforma IS 'Referencia a la plataforma de infraestructura (AWS, Azure, etc)';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.replicas IS 'Número de réplicas o instancias del componente en el entorno (para alta disponibilidad)';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.componente IS 'Nombre específico de la instancia de despliegue';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.descripcion IS 'Descripción de características específicas de esta instancia de despliegue';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.tbl_componente_despliegue.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_componente_despliegue_fecha_mod before
update
    on
    reestructuracion.tbl_componente_despliegue for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.tbl_componente_logico definition

-- Drop table

-- DROP TABLE reestructuracion.tbl_componente_logico;

CREATE TABLE reestructuracion.tbl_componente_logico (
	id_componente_logico int4 DEFAULT nextval('reestructuracion.seq_componente_logico'::regclass) NOT NULL, -- Identificador único auto-incremental del componente lógico
	id_aplicacion int4 NOT NULL, -- Referencia a la aplicación padre que contiene este componente
	id_tecnologia int4 NULL, -- Referencia a la tecnología principal utilizada en el componente
	id_componente_logico_tipo int4 NULL, -- Referencia al tipo de componente lógico
	nombre varchar(100) NOT NULL, -- Nombre del componente (ej: API Gateway, User Service, Payment Processor)
	descripcion varchar(500) NULL, -- Descripción de la funcionalidad y responsabilidad del componente
	estado int2 NULL, -- Estado operativo del componente (1=Activo, 0=Inactivo)
	"version" varchar(50) NULL, -- Versión actual del componente (ej: 1.2.3, v2.0)
	repositorio varchar(500) NULL, -- URL del repositorio de código fuente (ej: GitHub, GitLab, Bitbucket)
	url_documentacion varchar(500) NULL, -- URL de la documentación técnica del componente
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	is_contiene_datos_personales varchar(10) NULL, -- Indica si el componente procesa o almacena datos personales (para cumplimiento GDPR/LOPD)
	CONSTRAINT chk_componente_logico_estado CHECK ((estado = ANY (ARRAY[0, 1]))),
	CONSTRAINT pk_componente_logico PRIMARY KEY (id_componente_logico),
	CONSTRAINT fk_comp_log_aplicacion FOREIGN KEY (id_aplicacion) REFERENCES reestructuracion.tbl_aplicacion(id_aplicacion),
	CONSTRAINT fk_comp_log_tecnologia FOREIGN KEY (id_tecnologia) REFERENCES reestructuracion.cat_tecnologia(id_tecnologia),
	CONSTRAINT fk_comp_log_tipo FOREIGN KEY (id_componente_logico_tipo) REFERENCES reestructuracion.cat_componente_logico_tipo(id_componente_logico_tipo)
);
CREATE INDEX idx_comp_log_aplicacion ON reestructuracion.tbl_componente_logico USING btree (id_aplicacion);
CREATE INDEX idx_comp_logico_fecha_mod ON reestructuracion.tbl_componente_logico USING btree (fecha_modificacion);
CREATE INDEX idx_componente_logico_estado ON reestructuracion.tbl_componente_logico USING btree (estado);
CREATE INDEX idx_componente_logico_nombre ON reestructuracion.tbl_componente_logico USING btree (nombre);
COMMENT ON TABLE reestructuracion.tbl_componente_logico IS 'Componentes lógicos que conforman las aplicaciones. Representa la arquitectura interna de cada aplicación, descompuesta en componentes reutilizables.';

-- Column comments

COMMENT ON COLUMN reestructuracion.tbl_componente_logico.id_componente_logico IS 'Identificador único auto-incremental del componente lógico';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.id_aplicacion IS 'Referencia a la aplicación padre que contiene este componente';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.id_tecnologia IS 'Referencia a la tecnología principal utilizada en el componente';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.id_componente_logico_tipo IS 'Referencia al tipo de componente lógico';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.nombre IS 'Nombre del componente (ej: API Gateway, User Service, Payment Processor)';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.descripcion IS 'Descripción de la funcionalidad y responsabilidad del componente';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.estado IS 'Estado operativo del componente (1=Activo, 0=Inactivo)';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico."version" IS 'Versión actual del componente (ej: 1.2.3, v2.0)';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.repositorio IS 'URL del repositorio de código fuente (ej: GitHub, GitLab, Bitbucket)';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.url_documentacion IS 'URL de la documentación técnica del componente';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';
COMMENT ON COLUMN reestructuracion.tbl_componente_logico.is_contiene_datos_personales IS 'Indica si el componente procesa o almacena datos personales (para cumplimiento GDPR/LOPD)';

-- Table Triggers

create trigger trg_componente_logico_fecha_mod before
update
    on
    reestructuracion.tbl_componente_logico for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.tbl_interfaz definition

-- Drop table

-- DROP TABLE reestructuracion.tbl_interfaz;

CREATE TABLE reestructuracion.tbl_interfaz (
	id_interfaz int4 DEFAULT nextval('reestructuracion.seq_interfaz'::regclass) NOT NULL, -- Identificador único auto-incremental de la interfaz
	id_componente_logico int4 NULL, -- Referencia al componente que expone esta interfaz (puede ser NULL para interfaces externas)
	id_tipo_interfaz int4 NOT NULL, -- Referencia al tipo de interfaz (REST, SOAP, etc)
	nombre_interfaz varchar(100) NOT NULL, -- Nombre de la interfaz (ej: /api/v1/users, GetCustomerInfo, UserCreatedEvent)
	descripcion varchar(500) NULL, -- Descripción de la funcionalidad y contrato de la interfaz
	estado varchar(50) NULL, -- Estado de la interfaz (Activa, Deprecated, En Desarrollo)
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	id_aplicacion int4 NULL, -- Referencia a la aplicación propietaria de la interfaz
	CONSTRAINT pk_interfaz PRIMARY KEY (id_interfaz),
	CONSTRAINT fk_interfaz_aplicacion FOREIGN KEY (id_aplicacion) REFERENCES reestructuracion.tbl_aplicacion(id_aplicacion),
	CONSTRAINT fk_interfaz_componente_logico FOREIGN KEY (id_componente_logico) REFERENCES reestructuracion.tbl_componente_logico(id_componente_logico),
	CONSTRAINT fk_interfaz_tipo_interfaz FOREIGN KEY (id_tipo_interfaz) REFERENCES reestructuracion.cat_tipo_interfaz(id_tipo_interfaz)
);
CREATE INDEX idx_interfaz_componente ON reestructuracion.tbl_interfaz USING btree (id_componente_logico);
CREATE INDEX idx_interfaz_nombre ON reestructuracion.tbl_interfaz USING btree (nombre_interfaz);
COMMENT ON TABLE reestructuracion.tbl_interfaz IS 'Interfaces expuestas o consumidas por los componentes lógicos. Representa los puntos de integración entre componentes y sistemas.';

-- Column comments

COMMENT ON COLUMN reestructuracion.tbl_interfaz.id_interfaz IS 'Identificador único auto-incremental de la interfaz';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.id_componente_logico IS 'Referencia al componente que expone esta interfaz (puede ser NULL para interfaces externas)';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.id_tipo_interfaz IS 'Referencia al tipo de interfaz (REST, SOAP, etc)';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.nombre_interfaz IS 'Nombre de la interfaz (ej: /api/v1/users, GetCustomerInfo, UserCreatedEvent)';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.descripcion IS 'Descripción de la funcionalidad y contrato de la interfaz';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.estado IS 'Estado de la interfaz (Activa, Deprecated, En Desarrollo)';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';
COMMENT ON COLUMN reestructuracion.tbl_interfaz.id_aplicacion IS 'Referencia a la aplicación propietaria de la interfaz';

-- Table Triggers

create trigger trg_interfaz_fecha_mod before
update
    on
    reestructuracion.tbl_interfaz for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.tbl_interfaz_atributo_valor definition

-- Drop table

-- DROP TABLE reestructuracion.tbl_interfaz_atributo_valor;

CREATE TABLE reestructuracion.tbl_interfaz_atributo_valor (
	id_interfaz_atributo_valor int4 DEFAULT nextval('reestructuracion.seq_interfaz_atributo_valor'::regclass) NOT NULL, -- Identificador único auto-incremental del valor de atributo
	id_interface_atributo int4 NOT NULL, -- Referencia al tipo de atributo de interfaz
	id_interfaz int4 NOT NULL, -- Referencia a la interfaz que tiene este atributo
	valor text NULL, -- Valor del atributo. Puede contener texto, JSON u otros formatos
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_interfaz_atributo_valor PRIMARY KEY (id_interfaz_atributo_valor),
	CONSTRAINT fk_interfaz_atrib_val_atrib FOREIGN KEY (id_interface_atributo) REFERENCES reestructuracion.cat_interface_atributo(id_interface_atributo),
	CONSTRAINT fk_interfaz_atrib_val_interfaz FOREIGN KEY (id_interfaz) REFERENCES reestructuracion.tbl_interfaz(id_interfaz)
);
COMMENT ON TABLE reestructuracion.tbl_interfaz_atributo_valor IS 'Valores de atributos dinámicos para interfaces. Implementa patrón EAV para metadatos extensibles de interfaces.';

-- Column comments

COMMENT ON COLUMN reestructuracion.tbl_interfaz_atributo_valor.id_interfaz_atributo_valor IS 'Identificador único auto-incremental del valor de atributo';
COMMENT ON COLUMN reestructuracion.tbl_interfaz_atributo_valor.id_interface_atributo IS 'Referencia al tipo de atributo de interfaz';
COMMENT ON COLUMN reestructuracion.tbl_interfaz_atributo_valor.id_interfaz IS 'Referencia a la interfaz que tiene este atributo';
COMMENT ON COLUMN reestructuracion.tbl_interfaz_atributo_valor.valor IS 'Valor del atributo. Puede contener texto, JSON u otros formatos';
COMMENT ON COLUMN reestructuracion.tbl_interfaz_atributo_valor.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.tbl_interfaz_atributo_valor.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_interfaz_atributo_valor_fecha_mod before
update
    on
    reestructuracion.tbl_interfaz_atributo_valor for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.rel_com_interfaz_consumo definition

-- Drop table

-- DROP TABLE reestructuracion.rel_com_interfaz_consumo;

CREATE TABLE reestructuracion.rel_com_interfaz_consumo (
	id_interfaz_consumo int4 DEFAULT nextval('reestructuracion.seq_com_interfaz_consumo'::regclass) NOT NULL, -- Identificador único auto-incremental de la relación de consumo
	id_interfaz int4 NOT NULL, -- Referencia a la interfaz consumida
	id_componente_logico int4 NOT NULL, -- Referencia al componente que consume la interfaz
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_com_interfaz_consumo PRIMARY KEY (id_interfaz_consumo),
	CONSTRAINT fk_consumo_interfaz FOREIGN KEY (id_interfaz) REFERENCES reestructuracion.tbl_interfaz(id_interfaz),
	CONSTRAINT fk_consumo_interfaz_comp_log FOREIGN KEY (id_componente_logico) REFERENCES reestructuracion.tbl_componente_logico(id_componente_logico)
);
COMMENT ON TABLE reestructuracion.rel_com_interfaz_consumo IS 'Relación de consumo de interfaces por componentes lógicos. Mapea qué componentes consumen qué interfaces (dependencias).';

-- Column comments

COMMENT ON COLUMN reestructuracion.rel_com_interfaz_consumo.id_interfaz_consumo IS 'Identificador único auto-incremental de la relación de consumo';
COMMENT ON COLUMN reestructuracion.rel_com_interfaz_consumo.id_interfaz IS 'Referencia a la interfaz consumida';
COMMENT ON COLUMN reestructuracion.rel_com_interfaz_consumo.id_componente_logico IS 'Referencia al componente que consume la interfaz';
COMMENT ON COLUMN reestructuracion.rel_com_interfaz_consumo.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.rel_com_interfaz_consumo.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_com_interfaz_consumo_fecha_mod before
update
    on
    reestructuracion.rel_com_interfaz_consumo for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.rel_componente_log_despliegue definition

-- Drop table

-- DROP TABLE reestructuracion.rel_componente_log_despliegue;

CREATE TABLE reestructuracion.rel_componente_log_despliegue (
	id_componente_log_despliegue int4 DEFAULT nextval('reestructuracion.seq_componente_log_despliegue'::regclass) NOT NULL, -- Identificador único auto-incremental de la relación
	id_componente_logico int4 NOT NULL, -- Referencia al componente lógico
	id_componente_despliegue int4 NOT NULL, -- Referencia a la instancia de despliegue
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_componente_log_despliegue PRIMARY KEY (id_componente_log_despliegue),
	CONSTRAINT fk_comp_log_desp_comp_desp FOREIGN KEY (id_componente_despliegue) REFERENCES reestructuracion.tbl_componente_despliegue(id_componente_despliegue),
	CONSTRAINT fk_comp_log_desp_comp_log FOREIGN KEY (id_componente_logico) REFERENCES reestructuracion.tbl_componente_logico(id_componente_logico)
);
COMMENT ON TABLE reestructuracion.rel_componente_log_despliegue IS 'Relación muchos-a-muchos entre componentes lógicos y sus instancias de despliegue. Un componente lógico puede tener múltiples despliegues en diferentes entornos.';

-- Column comments

COMMENT ON COLUMN reestructuracion.rel_componente_log_despliegue.id_componente_log_despliegue IS 'Identificador único auto-incremental de la relación';
COMMENT ON COLUMN reestructuracion.rel_componente_log_despliegue.id_componente_logico IS 'Referencia al componente lógico';
COMMENT ON COLUMN reestructuracion.rel_componente_log_despliegue.id_componente_despliegue IS 'Referencia a la instancia de despliegue';
COMMENT ON COLUMN reestructuracion.rel_componente_log_despliegue.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.rel_componente_log_despliegue.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_componente_log_despliegue_fecha_mod before
update
    on
    reestructuracion.rel_componente_log_despliegue for each row execute function reestructuracion.actualizar_fecha_modificacion();


-- reestructuracion.rel_componente_log_subproceso definition

-- Drop table

-- DROP TABLE reestructuracion.rel_componente_log_subproceso;

CREATE TABLE reestructuracion.rel_componente_log_subproceso (
	id_componente_log_subproceso int4 DEFAULT nextval('reestructuracion.seq_componente_log_capacidad_nvl_3'::regclass) NOT NULL, -- Identificador único auto-incremental de la relación
	id_componente_logico int4 NOT NULL, -- Referencia al componente logico
	id_subproceso int4 NOT NULL, -- Referencia al subproceso
	tipo_relacion varchar(100) NOT NULL, -- Tipo de relación entre el componente y el subproceso (ej: soporta, automatiza, ejecuta)
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_id_componente_log_subproceso PRIMARY KEY (id_componente_log_subproceso),
	CONSTRAINT fk_componente_log_subproceso_componente_log FOREIGN KEY (id_componente_logico) REFERENCES reestructuracion.tbl_componente_logico(id_componente_logico),
	CONSTRAINT fk_componente_log_subproceso_subproceso FOREIGN KEY (id_subproceso) REFERENCES reestructuracion.cat_subproceso(id_subproceso)
);
CREATE INDEX idx_componente_log_subcapacidad_logico ON reestructuracion.rel_componente_log_subproceso USING btree (id_componente_logico);
CREATE INDEX idx_componente_log_subcapacidad_subproceso ON reestructuracion.rel_componente_log_subproceso USING btree (id_subproceso);
COMMENT ON TABLE reestructuracion.rel_componente_log_subproceso IS 'Relación muchos-a-muchos entre componentes logicos y subprocesos. Mapea qué componentes logicos soportan los subprocesos de negocio.';

-- Column comments

COMMENT ON COLUMN reestructuracion.rel_componente_log_subproceso.id_componente_log_subproceso IS 'Identificador único auto-incremental de la relación';
COMMENT ON COLUMN reestructuracion.rel_componente_log_subproceso.id_componente_logico IS 'Referencia al componente logico';
COMMENT ON COLUMN reestructuracion.rel_componente_log_subproceso.id_subproceso IS 'Referencia al subproceso';
COMMENT ON COLUMN reestructuracion.rel_componente_log_subproceso.tipo_relacion IS 'Tipo de relación entre el componente y el subproceso (ej: soporta, automatiza, ejecuta)';
COMMENT ON COLUMN reestructuracion.rel_componente_log_subproceso.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.rel_componente_log_subproceso.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';


-- reestructuracion.tbl_com_logico_atributo_valor definition

-- Drop table

-- DROP TABLE reestructuracion.tbl_com_logico_atributo_valor;

CREATE TABLE reestructuracion.tbl_com_logico_atributo_valor (
	id_com_logico_atributo_valor int4 DEFAULT nextval('reestructuracion.seq_com_logico_atributo_valor'::regclass) NOT NULL, -- Identificador único auto-incremental del valor de atributo
	id_componente_logico int4 NOT NULL, -- Referencia al componente lógico que tiene este atributo
	id_comp_logico_tipo_atributo int4 NOT NULL, -- Referencia al tipo de atributo
	valor text NULL, -- Valor del atributo. Puede contener texto, JSON u otros formatos
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de creación del registro
	fecha_modificacion timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Fecha y hora de la última modificación del registro
	CONSTRAINT pk_com_logico_atributo_valor PRIMARY KEY (id_com_logico_atributo_valor),
	CONSTRAINT fk_com_log_atrib_val_comp_log FOREIGN KEY (id_componente_logico) REFERENCES reestructuracion.tbl_componente_logico(id_componente_logico),
	CONSTRAINT fk_com_log_atrib_val_tipo FOREIGN KEY (id_comp_logico_tipo_atributo) REFERENCES reestructuracion.cat_comp_logico_tipo_atributo(id_comp_logico_tipo_atributo)
);
COMMENT ON TABLE reestructuracion.tbl_com_logico_atributo_valor IS 'Valores de atributos dinámicos para componentes lógicos. Implementa patrón EAV (Entity-Attribute-Value) para extensibilidad.';

-- Column comments

COMMENT ON COLUMN reestructuracion.tbl_com_logico_atributo_valor.id_com_logico_atributo_valor IS 'Identificador único auto-incremental del valor de atributo';
COMMENT ON COLUMN reestructuracion.tbl_com_logico_atributo_valor.id_componente_logico IS 'Referencia al componente lógico que tiene este atributo';
COMMENT ON COLUMN reestructuracion.tbl_com_logico_atributo_valor.id_comp_logico_tipo_atributo IS 'Referencia al tipo de atributo';
COMMENT ON COLUMN reestructuracion.tbl_com_logico_atributo_valor.valor IS 'Valor del atributo. Puede contener texto, JSON u otros formatos';
COMMENT ON COLUMN reestructuracion.tbl_com_logico_atributo_valor.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN reestructuracion.tbl_com_logico_atributo_valor.fecha_modificacion IS 'Fecha y hora de la última modificación del registro';

-- Table Triggers

create trigger trg_com_logico_atributo_valor_fecha_mod before
update
    on
    reestructuracion.tbl_com_logico_atributo_valor for each row execute function reestructuracion.actualizar_fecha_modificacion();
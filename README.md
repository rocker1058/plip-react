# Administrador Web de PliP

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Ejecución](#ejecución)
3. [Variables de Entorno](#variables-de-entorno)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Despliegue](#despliegue)

## Introducción

El Administrador Web de PliP es una aplicación web construida en React que se conecta a un servidor GraphQL para obtener información sobre establecimientos y facturas.

## Ejecución

Para ejecutar la aplicación, sigue estos pasos:

1. Instala las dependencias ejecutando:

```bash
npm install
```

2. Inicia la aplicación con el comando:

```bash
npm start
```

Opcionalmente, puedes compilar los archivos de Sass a CSS ejecutando:

```bash
npm run watch
```

## Variables de Entorno

Debes configurar las siguientes variables de entorno creando un archivo `.env`:

| Variable                       | Descripción                                                   | Ejemplo                                   |
|--------------------------------|---------------------------------------------------------------|-------------------------------------------|
| REACT_APP_AWS_COGNITO_POOLID   | ID del pool de AWS                                             | us-east-1_lw9hp1Cls                       |
| REACT_APP_AWS_COGNITO_CLIENTID | ID del cliente asociado al pool de AWS                        | 6kokle5c92fu75dt0jirlk7k33                |
| REACT_APP_GATEWAY              | Ruta del servidor de PliP (debe incluir la ruta /establishments)| https://api.plip.world/api/establishments |

## Estructura del Proyecto

La estructura del proyecto es la siguiente:

- `gulpfile.js`: Contiene las especificaciones de compilación de estilos del proyecto. Aquí se compilan los archivos Sass a CSS.

- `src`: Es el directorio principal del proyecto y contiene los siguientes componentes:

  1. `Assets`: Aquí se encuentran los archivos generales del sistema.

  2. `Components`: Incluye componentes comunes y vistas del proyecto, agrupados por funcionalidad y desacoplados de los componentes de GraphQL.

  3. `Redux`: Maneja los estados de toda la aplicación.

  4. `App.js`: Es el punto de entrada del proyecto.

## Despliegue

Para desplegar el proyecto, sigue estos pasos:

1. Ejecuta el comando:

```bash
npm run build
```

Esto generará una carpeta "build" con los archivos necesarios para desplegar el proyecto en un servidor web.

2. Asegúrate de que las variables de entorno mencionadas en la sección de "Variables de Entorno" estén configuradas en tu entorno.

Además, se proporciona un script YAML para su uso en AWS CloudFormation. Este script permite generar la infraestructura necesaria para crear pipelines de integración continua con S3 y CloudFront en AWS.

Se recomienda ejecutar bajo NodeJS v14.x.x
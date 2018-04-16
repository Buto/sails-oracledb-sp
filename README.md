# sails-oracledb-sp

Provides easy access to Oracle stored procedures from Sails.js & Waterline.

This module is a Sails/Waterline community adapter.  Its goal is to provide a set of declarative interfaces,
conventions, and best-practices for integrating with the Oracle database when using stored procedures.

Strict adherence to an adapter specification enables the (re)use of built-in generic test suites, standardized
documentation, reasonable expectations around the API for your users, and overall, a more pleasant development
experience for everyone.


## Installation

To install this adapter, run:

```sh
$ npm install sails-oracledb-sp
```

Then [connect the adapter](https://sailsjs.com/documentation/reference/configuration/sails-config-datastores)
to one or more of your app's datastores.

## Usage

The input parameters to the stored procedure are provided by the controller to the model and then to this
adapter.

Visit [Models & ORM](https://sailsjs.com/docs/concepts/models-and-orm) in the docs for more information about
using models, datastores, and adapters in your app/microservice.

#### Sails connection

Specify the credential details needed to connect your Oracle instance in config/connections.js

#### Example connection named oraclehr

```javascript
  oraclehr: {
    adapter: 'sails-oracle-sp',
    user: 'hr',
    password: 'welcome',
    package: 'HR',
    cursorName: 'DETAILS',
    connectString: 'localhost/xe'
  }
```

* package is the name of the PL/SQL Package
* cursorName is the name of the PL/SQL ref cursor to return results

#### Sails model

Sails' model is designed to support interacting with database tables. Consequently Sail's model includes
table-orientated attributes such as table name and column attributes. Put another way, details pertaining
to a specific database table (e.g., table name, column details) are stored in a Sails' model. Sails uses
the information in a table's model to conduct SQL against said table.

Sails-oracle-sp is using Sails' model to specific details pertaining to a set of stored procedures instead
of a table. The fit between using Sails' model for accessing tables and stored procedures is not exact. When
used to access database tables Sail's model corresponds to exactly one table. In contrast, generally a
Sails model is used to access a "family" of four stored procedures: one for each REST verb (POST, GET, PUT
and DELETE.) Every stored procedure in this "family" has the same prefix.

As an example, consider a package named *hr*, with stored procedures that operate on a table named
*employees*. Table 1 shows the stored procedure names, their affect and the REST verb to which they are
mapped.

| Method      | Stored Procedure name | REST Verb    | Description
|:------------|:----------------------|:-------------|:----------
| create      | bar_c                 | POST         | Create a *bar* record
| find        | bar_r                 | GET          | Fetches a *bar* record
| update      | bar_u                 | PUT          | Updates a *bar* record
| destroy     | bar_d                 | DELETE       | Destroys a *bar* record
Table 1: REST verbs with respect to the specific stored procedure they will invoke.

Note that each stored procedure name is prefixed with "family name" "bar", followed by an underscore, which
is then appended by one of the following letters: C,R,U,D.

You specify the details that cause Sails to generate the correct stored procedure calls in
api/models/YOUR_MODEL.js.

Sails-oracle-sp repurposes the table name attribute such that it becomes the stored procedures' "family name".
So for this example the tableName attribute is "bar".

Sails-oracle-sp repurposes the column name attribute so as to specify store procedure parameters.

Sails adapters, including Sails-oracle-sp, expose model-contextualized CRUD methods. These adapter methods are
named create(), find(), update(), and destroy().  Table 2 shows how these adapter methods map to stored
procedure names.

When generating the stored procedure call the adapter method appends the necessary letter to the "family name."

#### Example model named Employees using the oraclehr connection

```javascript
module.exports = {

  tableName: 'EMPLOYEES',
  schema: true,
  connection: 'oraclehr',
  autoCreatedAt: 'false',
  autoUpdatedAt: 'false',

  attributes: {
    EMPLOYEE_ID: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    FIRST_NAME: {
      type: 'string',
      required: false
    },
    LAST_NAME: {
      type: 'string',
      required: true
    },
    EMAIL: {
      type: 'string',
      required: true
    },
    PHONE_NUMBER: {
      type: 'string',
      required: false
    },
    HIRE_DATE: {
      type: 'string',
      required: true
    },
    JOB_ID: {
      type: 'string',
      required: true
    },
    SALARY: {
      type: 'float',
      required: false
    },
    COMMISSION_PCT: {
      type: 'float',
      required: false
    },
    MANAGER_ID: {
      type: 'integer',
      required: false
    },
    DEPARTMENT_ID: {
      type: 'integer',
      required: false
    }
  }
};
```

#### Example Project

See [sails-oracledb-sp-example](https://github.com/nethoncho/sails-oracledb-sp-example)

## Compatibility

This adapter implements the following methods:

| Method               | Status            | Category      |
|:---------------------|:------------------|:--------------|
| registerDatastore    | _**in progress**_ | LIFECYCLE     |
| teardown             | _**in progress**_ | LIFECYCLE     |
| create               | Planned           | DML           |
| createEach           | Planned           | DML           |
| update               | Planned           | DML           |
| destroy              | Planned           | DML           |
| find                 | Planned           | DQL           |
| join                 | Not Applicable    | DQL           |
| count                | Not Planned       | DQL           |
| sum                  | Not Planned       | DQL           |
| avg                  | Not Planned       | DQL           |
| define               | Not Applicable    | DDL           |
| drop                 | Not Applicable    | DDL           |
| setSequence          | Not Applicable    | DDL           |

## License

This oracledb-sp adapter is available under the **MIT license**.

As for [Waterline](http://waterlinejs.org) and the [Sails framework](https://sailsjs.com)?  They're free and
open-source under the [MIT License](https://sailsjs.com/license).


![image_squidhome@2x.png](http://i.imgur.com/RIvu9.png)

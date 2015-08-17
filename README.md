# sails-oracle-sp

## About

The sails-oracle-sp adapter provides easy access to Oracle stored procedures for sails models

### Installation

To install this adapter, run:

```sh
$ npm install sails-oracle-sp
```

### Usage

The input parameters are provided by the controller to the model and then to this adapter.

#### Sails connection

Specify the credential details needed to connect your Oracle instance in config/connections.js

##### Example connection named oraclehr

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

Sails' model is designed to support interacting with database tables. Consequently Sail's model includes table-orientated attributes such as table name and column attributes.  Put another way, details pertaining to a specific database table (e.g., table name, column details) are stored in a Sails' model.  Sails uses the information in a table's model to conduct SQL against said table.

Sails-oracle-sp is using Sails' model to specific details pertaining to a set of stored procedures instead of a table.  The fit between using Sails' model for accessing tables and stored procedures is not exact.  When used to access database tables Sail's model corresponds to exactly one table.  In contrast, generally a Sails model is used to access a "family" of four stored procedures: one for each REST verb (POST, GET, PUT and DELETE.)  Every stored procedure in this "family" has the same prefix.
As an example, consider a package named *hr*, with stored procedures that operate on a table named *employees*.  Table 1 shows the stored procedure names, their affect and the REST verb to which they are mapped.

Package name | stored procedure name|REST Verb|description
------------ | -------------|-------------|----------
foo | bar_c | POST| create a *bar* record
foo | bar_r | GET| fetches a *bar* record
foo | bar_u | PUT| updates a *bar* record
foo | bar_d | DELETE| destroys a *bar* record
Table 1: REST verbs with respect to the specific stored procedure they will invoke.

Note that each stored procedure name is prefixed with "family name" "bar", followed by an underscore, which is then appended by one of the following letters: C,R,U,D.

You specify the details that cause Sails to generate the correct stored procedure calls in api/models/YOUR_MODEL.js.  Sails-oracle-sp repurposes the table name attribute such that it becomes the stored procedures' "family name".  So for this example the tableName attribute is "bar".

Sails-oracle-sp repurposes the column name attribute so as to specify store procedure parameters.

Sails adapters, including Sails-oracle-sp, expose model-contextualized CRUD methods. These adapter methods are named create(), find(), update(), and destroy().  Table 2 shows how these adapter methods map to stored procedure names.

adapter methods | stored procedure name|REST Verb|description
------------ | -------------|-------------|----------
create() | bar_c | POST| create a *bar* record
find() | bar_r | GET| fetches a *bar* record
update() | bar_u | PUT| updates a *bar* record
destroy() | bar_d | DELETE| destroys a *bar* record
Table 2: Sails-oracle-sp adapter methods with respect to the specific stored procedure they will invoke.

When generating the stored procedure call the adapter method appends the necessary letter to the "family name."

##### Example model named Employees using the oraclehr connection

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

##### This adapter exposes the following methods:

###### `find()`

+ **Syntax**
  + package.tableName_r()

###### `create()`

+ **Syntax**
  + package.tableName_c()

###### `update()`

+ **Syntax**
  + package.tableName_u()

###### `destroy()`

+ **Syntax**
  + package.tableName_d()

### Example

See [sails-oracledb-sp-example](https://github.com/nethoncho/sails-oracledb-sp-example)

### License

**[MIT](./LICENSE)**
&copy; 2014



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

in config/connections.js specify the details needed to connect

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

in api/models/YOUR_MODEL.js specify the table name, connection and column attributes

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

### Interfaces

>TODO:
>Specify the interfaces this adapter will support.
>e.g. `This adapter implements the [semantic]() and [queryable]() interfaces.`


### License

**[MIT](./LICENSE)**
&copy; 2014 



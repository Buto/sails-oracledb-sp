
# sails-oracle-sp

Provides easy access to `oracle-sp` from Sails.js & Waterline.

This module is a Waterline/Sails adapter, an early implementation of a rapidly-developing, tool-agnostic data standard.  Its goal is to provide a set of declarative interfaces, conventions, and best-practices for integrating with all sorts of data sources.  Not just databases-- external APIs, proprietary web services, or even hardware.

Strict adherence to an adapter specification enables the (re)use of built-in generic test suites, standardized documentation, reasonable expectations around the API for your users, and overall, a more pleasant development experience for everyone.


### Installation

To install this adapter, run:

```sh
$ npm install sails-oracle-sp
```




### Usage

This adapter exposes the following methods:

###### `find()`

+ **Status**
  + Planned

###### `create()`

+ **Status**
  + Planned

###### `update()`

+ **Status**
  + Planned

###### `destroy()`

+ **Status**
  + Planned



### Interfaces

>TODO:
>Specify the interfaces this adapter will support.
>e.g. `This adapter implements the [semantic]() and [queryable]() interfaces.`


### Development

Check out **Connections** in the Sails docs, or see the `config/connections.js` file in a new Sails project for information on setting up adapters.

## Getting started
It's usually pretty easy to add your own adapters for integrating with proprietary systems or existing open APIs.  For most things, it's as easy as `require('some-module')` and mapping the appropriate methods to match waterline semantics.  To get started:

1. Fork this repository
2. Set up your `README.md` and `package.json` file.  Sails.js adapter module names are of the form sails-*, where * is the name of the datastore or service you're integrating with.
3. Build your adapter.




### Running the tests

Configure the interfaces you plan to support (and targeted version of Sails/Waterline) in the adapter's `package.json` file:

```javascript
{
  //...
  "sails": {
  	"adapter": {
	    "sailsVersion": "~0.10.0",
	    "implements": [
	      "semantic",
	      "queryable"
	    ]
	  }
  }
}
```

In your adapter's directory, run:

```sh
$ npm test
```


### License

**[MIT](./LICENSE)**
&copy; 2014 



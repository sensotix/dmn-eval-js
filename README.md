[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# About

dmn-eval-js is a Javascript engine to execute decision tables according to the [DMN](http://www.omg.org/spec/DMN/1.1/) standard.
This implementation is based on [FEEL by EdgeVerve](https://github.com/EdgeVerve/feel). It is tailored to evaluation of
simple expression language (S-FEEL), plus some cherry-picked parts of FEEL.

dmn-eval-js allows to load and execute DMN decision tables from XML. DRGs are supported. Evaluation of decision tables is currently limited to those of hit policy FIRST (F), UNIQUEE (U), RULE ORDER (R), and COLLECT (C) without aggregation.

# Usage

## Import

```
var { decisionTable, dateTime } = require('@hbtgmbh/dmn-eval-js');
```

## Logging

dmn-eval-js uses [log4js](https://github.com/log4js-node/log4js-api) for logging. Since only the log4js API is used,
you need to define a dependency on log4js by yourself if you want to get log output from dmn-eval-js. If you don't,
any log statements are safely suppressed.

To see log output, do as follows:

In package.json:
```
...
"dependencies": {
  ...
  "log4js": "2.4.1",
  ...
},
...
```

In your code:
```
...
var log4js = require('log4js');
...
 
var logger = log4js.getLogger('dmn-eval-js');
logger.level = 'debug';
```

With loglevel 'info', you will see a few short log statements per decision call. With log level 'debug', you will
additionally see what input was passed to each decision call (including nested decisions in DRGs), this might be
verbose depending on what input values you pass for decision evaluation. Use loglevel 'error' to limit log statements 
to exceptional cases only. If you do not specify a loglevel, no output statements are shown (this is the same as
loglevel 'off'); 

## Parsing decision tables

dmn-eval-js parses XML content. It is up to you to obtain it, e.g. from file system or service call.

```
const xmlContent = ... // wherever it may come from
decisionTable.readDmnXml(xmlContent, function(err, dmnContent) {
  
  const decisions = decisionTable.parseDecisions(dmnContent.drgElements);
  const context = {
      // your input for decision execution goes in here
  };
  
  decisionTable.evaluateDecision('decide-approval', decisions, context)
    .then(data => {
        // data is the output of the decision execution
        // it is an array for hit policy COLLECT and RULE ORDER,
        // and an object else
    })
    .catch(err => console.log(err));
});
```

## Supported content in decision tables

### Input expressions

Input expressions are commonly (qualified) names, like so:
- customerAge
- customer.age

In the "context" object which is the input for decision execution, the corresponding properties / nested objects must exist. Example:

```
const context = {
  customer: {
    age: 18;
  }
};
```

Input expressions are however not restricted to qualified names. You can use any expression according to S-FEEL, any
additionally even function invocations, too, like so:
- employee.salary * 12
- convertToUSD(employee.salary)

In the case of functions, you need to define these in the given context object:

```
const context = {
  employee: {
    salary: 100000;
  },
  convertToUSD: (valueInEUR) => [
     // your conversion logic here
  };
};
```

### Input entries

As input entries, simple unary tests according to the DMN specification are supported, with some additions:

- an endpoint can also be arithmetic expression
- a simple values can also be function invocation
- a simple literal can also be a null literal
- a date time literal can also be "date and time"
- brackets in arithmetic expressions are supported
- additional name symbols are not supported

Examples (the list is *not* complete though):

| Input entry                 | matches if the input expression evaluates to...                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 42                          | the numeric value 42                                                                                            |
| < 42                        | a value less than 42                                                                                            |
| [41 .. 50]                  | a value between 41 and 50 (inclusive)                                                                           |
| 10, 20                      | either 10 or 20                                                                                                 |
| <10, >20                    | a value either less than 10 or greater than 20                                                                  |
| "A"                         | the string "A"                                                                                                  |
| "A", "B"                    | the string "A" or "B"                                                                                           |
| true                        | the boolean value true                                                                                          |
| -                           | any value                                                                                                       |
|                             | any value (sams as -)                                                                                           |
| null                        | the value null                                                                                                  |
| not(null)                   | any value other than null                                                                                       |
| property                    | the same value as the property (must be given in the context)                                                   |
| object.property             | the same value as the property of the object                                                                    |
| f(a)                        | the same value as the function evaluated with the property (function and property must be given in the context) |
| limit - 10                  | the same value as the limit minus 10                                                                            |
| limit * 2                   | the same value as the limit times 2                                                                             |
| [limit.upper, limit.lower]  | a value between the value of two given properties of object limit                                               |
| date("2017-05-01")          | the date value Mai 1st, 2017                                                                                    |
| duration(d)                 | the duration specified by d, which must be an ISO 8601 duration string like P3D for three days                  |
| date(begin) + duration(d)   | the date that results by adding the given duration to the given date                                            |
| < date(begin) + duration(d) | any date before the date that results by adding the given duration to the given date                            |

Most combinations of the syntax elements above are valid, too. For example the following is a valid input entry (although it probably does not make any sense): 
```
not(f(a + 1), [ date(b) + duration(c.d) .. g(d) ]) 
```

### Output entries

A simple expression according to the DMN specification is supported as output entry, with the same additions as mentioned for input entries.
Since output entries are expressions, not comparisons, values like the following are not allowed:
- < 1
- [1 .. 2]
- not("A")
- empty values (this includes the dash -)


### Passing dates as input

To create date, time, date and time, and durtion object instances as input for decision execution, do as follows: 

```
const context = { 
  someDate: dateTime.date('2017-03-19'),
  someTime: dateTime['date and time']('2012-12-22T03:45:00'),
  someTime: dateTime.time('03:45:00'),
  someDuration: 'P1Y2M3DT4H6M6S', // one year, 2 months, 3 days, 4 hours, 5 minutes, 6 seconds
};
```

(to come: describe how timezones are specified)

# Development

```sh
# install dependencies
npm install

# run test cases
npm test

# watch for changes in source and grammar
gulp watch

# generate parser from grammar
gulp generate

# lint source files
npm run lint

# lint-fix source files
npm run lintfix
```

# Reference

For comprehensive set of documentation on DMN, you can refer to :

[DMN Specification Document](http://www.omg.org/spec/DMN/1.1/)

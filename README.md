[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# About

dmn-eval-js is a Javascript engine to execute decision tables according to the [DMN](http://www.omg.org/spec/DMN/1.1/) standard.
This implementation is based on [FEEL by EdgeVerve](https://github.com/EdgeVerve/feel). It is tailored to evaluation of
simple expression language (S-FEEL), plus some cherry-picked parts of FEEL.

dmn-eval-js allows to load and execute DMN decision tables from XML. DRGs are supported. Evaluation of decision tables is currently limited to those of hit policy FIRST (F), UNIQUE (U), RULE ORDER (R), and COLLECT (C) without aggregation.

# Usage

## Import

```
var { decisionTable, dateTime } = require('@hbtgmbh/dmn-eval-js');
```

## Logging

dmn-eval-js uses [loglevel](https://github.com/pimterry/loglevel) for logging.
By default, warning and error messages are shown only. For additional log output,
you need to configure a logger namend 'dmn-eval-js' as follows:
```
...
var loglevel = require('loglevel');
...
 
var logger = loglevel.getLogger('dmn-eval-js');
logger.setLevel('info');
```

With loglevel 'info', you will see a few short log statements per decision call. With log level 'debug', you will
additionally see what input was passed to each decision call (including nested decisions in DRGs), this might be
verbose depending on what input values you pass for decision evaluation. Use loglevel 'error' to limit log statements 
to exceptional cases only.

## Parsing decision tables

dmn-eval-js parses DMN from XML content. It is up to you to obtain the XML content, e.g. from file system or service call.
Parsing is asynchronous using a Promise, while evaluation (execution) of a decision is synchronous.

```
const { decisionTable } = require('dmn-eval-js');
 
const xmlContent = ... // wherever it may come from
 
decisionTable.parseDmnXml(xmlContent)
    .then((decisions) => {
        // DMN was successfully parsed
        const context = {
            // your input for decision execution goes in here
        };

        try {
            const data = decisionTable.evaluateDecision('decide-approval', decisions, context);
            // data is the output of the decision execution
            // it is an array for hit policy COLLECT and RULE ORDER, and an object else
            
            ... // do something with the data
            
        } catch (err) {
            // failed to evaluate rule, maybe the context is missing some data?
            console.log(err)
        };
    })
    .catch(err => {
         // failed to parse DMN XML: either invalid XML or valid XML but invalid DMN
         console.log(err)
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

Input expressions are however not restricted to qualified names. You can use any expression according to S-FEEL, and
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

Function implementation should be free of side-effects. Date and time instances that are arguments to functions are moment-js instances.

### Input entries

As input entries, simple unary tests according to the DMN specification are supported, with some additions:

- an endpoint can also be arithmetic expression
- a simple value can also be function invocation
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
| date("2017-05-01")          | the date value Mai 1st, 2017 (date is a built-in function)                                                      |
| date(property)              | the date which is defined by the value of the given property, the time if cropped to 00:00:00                   |
| date and time(property)     | the date and time which is defined by the value of the given property (date and time is a built-in function)    |
| duration(d)                 | the duration specified by d, an ISO 8601 duration string like P3D for three days (duration is built-in either)  | 
| duration(d) * 2             | twice the duration                                                                                              |
| duration(begin, end)        | the duration between the specified begin and end date                                                           |
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

### Undefined values

Since version 1.2.0, dmn-eval-js allows function and properties that are referenced by input expressions, input entries, and output entries, to be undefined or missing from the input context. The names of undefined functions and properties are logged with log level 'warn'. 
Undefined values are handled as follows:

**Evaluation of input expressions, input entries, and output entries**

*Input expressions* and *output entries* evaluate to undefined if they contain a function invocation or a property which is not found in the input context, or is contained there with undefined value.
The same holds for *input entries*, unless their value can be evaluated even without the undefined function or property. For example, the following input entry:
```
not('A', property)
```
evaluates to *false* if the input expression evaluates to 'A' even if the property cannot be resolved, because regardless of the property value, the condition will always be false.

**Matching of rules**

If an input expression evaluates to undefined, any rule whose corresponding input entry is not empty (neither the empty string literal nor the dash -) does *not* match, regardless of to which value (or undefined) the input entry evaluates.

If an input entry evaluates to undefined, the containing rule does not match, regardless of to which value the corresponding input expression evaluates.

**Decision result**

If an output entry of a matching rule evaluates to undefined, the variable defined by the output name is set to undefined, if the hit policy is UNIQUE or FIRST. If the hit policy is COLLECT or RULE ORDER, the undefined output entry value is not added to the result list.   

**Custom functions**
 
If you cannot rule out undefined values, your custom functions should check their arguments for undefined values, and return undefined in turn if one or more of the arguments are themselves undefined.

### Passing dates as input

As input for the following input expression, input value, or output value
```
date(property)
date and time(property)
```
the following property values are supported:
```
// ISO8601 time string
const context = {
  property: '2018-03-01T00:00:00.000+01:00';
}
 
// Javascript date from numerical year, month, ... values
const context = {
  property: new Date(2018, 2, 1, 0, 0, 0); // note that this will be implicitly in the local time zone!
}
 
// Javascript date from string with explicit time zone
const context = {
  property: new Date('2018-03-01T00:00:00+01:00');
}
 
// moment-js value
const context = {
  property: moment.parseZone('2018-03-01T00:00:00+01:00')
}
```

Actually, any Date or moment-js value is fine, regardless of how you created it.

Heads up! The date function crop any time part which is contained in the given Date or moment-js value.

### Dates in custom functions

If your custom functions take date or date and time values, these are of an internal type which is compatible with the moment-js API. Make sure not to modify them by calling moment-js operations with side effects. If needed, clone the arguments first. 

If your custom functions return date or date and time values, these must be of the same internal type. The functions required to create them is exported by dmn-eval-js:

```
const { decisionTable, dateTime } = require('dmn-eval-js');
 
// creates a date in the internal date format,
// d may be a Javascript Date, a moment-js date, 
// or an instance of the internal date format
dateTime.date(d);
 
// creates a date and time in the internal date format,
// d may be a Javascript Date, a moment-js date,
// or an instance of the internal date and time format
dateTime['date and time'](d); 
```
   

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

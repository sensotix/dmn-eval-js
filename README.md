[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# About

[FEEL](https://github.com/EdgeVerve/feel/wiki/What-is-FEEL%3F) is an expression language based on DMN specification conformance level 3.
This implementation is based on [FEEL by EdgeVerve](https://github.com/EdgeVerve/feel). It is tailored to evaluation of 
simple expression language (S-FEEL) for conformance level 2, plus some cherry-picked parts of FEEL.

It allows to load and execute DMN decision tables from XML. DRGs are supported. Evaluation of decision tables is currently limited to those of hit policy F (FIRST).

# Getting Started

## Installation

### Contribution

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

# Usage

(to come)

# Reference

For comprehensive set of documentation on DMN, you can refer to :

[DMN Specification Document](http://www.omg.org/spec/DMN/1.1/)

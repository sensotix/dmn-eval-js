/*
*  ©2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
const chalk = require('chalk');
const chai = require('chai');
const expect = chai.expect;
const moment = require('moment');
const FEEL = require('../dist/feel');
const builtInFns = require('../utils/built-in-functions');

describe(chalk.blue('ast parsing tests'), function() {

  it('ProgramNode.build', function() {
    const text = 'a';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'Start' });
    expect(node.type).to.equal('Program');
    const result = node.build(_context);
    expect(result).to.equal(42);
  });

  it('IntervalNode.build (open interval)', function() {
    const text = '(10 .. a)';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    const intervalNode = node.expr[0];
    expect(intervalNode.type).to.equal('Interval');
    const result = intervalNode.build({ context: _context });
    expect(typeof result).to.equal('function');
    expect(result(10)).to.be.false;
    expect(result(11)).to.be.true;
    expect(result(41)).to.be.true;
    expect(result(42)).to.be.false;
  });

  it('IntervalNode.build (closed interval)', function() {
    const text = '[10 .. a]';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    const intervalNode = node.expr[0];
    expect(intervalNode.type).to.equal('Interval');
    const result = intervalNode.build({ context: _context });
    expect(typeof result).to.equal('function');
    expect(result(9)).to.be.false;
    expect(result(10)).to.be.true;
    expect(result(42)).to.be.true;
    expect(result(43)).to.be.false;
  });

  it('SimplePositiveUnaryTestNode.build', function() {
    const text = '< a';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    const simplePositiveUnaryTestsNode = node.expr[0];
    expect(simplePositiveUnaryTestsNode.type).to.equal('SimplePositiveUnaryTest');
    const result = simplePositiveUnaryTestsNode.build({ context: _context });
    expect(typeof result).to.equal('function');
    expect(result(41)).to.be.true;
    expect(result(42)).to.be.false;
    expect(result(43)).to.be.false;
  });

  it('SimpleUnaryTestsNode.build', function() {
    const text = 'a, 10';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    const result = node.build(_context);
    expect(typeof result).to.equal('function');
    expect(result(10)).to.be.true;
    expect(result(42)).to.be.true;
    expect(result(23)).to.be.false;
  });

  it('SimpleUnaryTestsNode.build (not)', function() {
    const text = 'not(a, 10)';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    const result = node.build(_context);
    expect(typeof result).to.equal('function');
    expect(result(10)).to.be.false;
    expect(result(42)).to.be.false;
    expect(result(23)).to.be.true;
  });

  it('QualifiedNameNode.build', function() {
    const text = 'a';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const qualifiedNameNode = node.simpleExpressions[0];
    expect(qualifiedNameNode.type).to.equal('QualifiedName');
    const result = qualifiedNameNode.build({ context: _context });
    expect(result).to.equal(42);
  });

  it('ArithmeticExpressionNode.build', function() {
    const text = 'a + 1';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const arithmeticExpressionNode = node.simpleExpressions[0];
    expect(arithmeticExpressionNode.type).to.equal('ArithmeticExpression');
    const result = arithmeticExpressionNode.build({ context: _context });
    expect(result).to.equal(43);
  });

  it('SimpleExpressionsNode.build', function() {
    const text = '1';
    const _context = { };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const result = node.build(_context);
    expect(result).to.have.ordered.members([ 1 ]);
  });

  it('NameNode.build', function() {
    const text = 'a';
    const _context = {
      a: 42,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const qualifiedNameNode = node.simpleExpressions[0];
    expect(qualifiedNameNode.type).to.equal('QualifiedName');
    const nameNode = qualifiedNameNode.names[0];
    expect(nameNode.type).to.equal('Name');
    const result = nameNode.build({ context: _context });
    expect(result).to.equal(42);
  });

  it('LiteralNode.build', function() {
    const text = '10';
    const _context = { };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const literalNode = node.simpleExpressions[0];
    expect(literalNode.type).to.equal('Literal');
    const result = literalNode.build({ context: _context });
    expect(result).to.equal(10);
  });

  it('DateTimeLiteralNode.build date from inline string', function() {
    const text = 'date("2017-05-01")';
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const dateTimeLiteralNode = node.simpleExpressions[0];
    expect(dateTimeLiteralNode.type).to.equal('DateTimeLiteral');
    const result = dateTimeLiteralNode.build({ context: Object.assign({}, {}, builtInFns) });
    expect(result.utc().format('YYYY MM DD')).to.equal('2017 05 01');
  });

  it('DateTimeLiteralNode.build date from string', function() {
    const text = 'date(d)';
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const dateTimeLiteralNode = node.simpleExpressions[0];
    expect(dateTimeLiteralNode.type).to.equal('DateTimeLiteral');
    const result = dateTimeLiteralNode.build({ context: Object.assign({ d: '2018-03-01' }, {}, builtInFns) });
    expect(result.format('YYYY MM DD HH mm SS')).to.equal('2018 03 01 00 00 00');
  });

  it('DateTimeLiteralNode.build date from Javascript date', function() {
    const text = 'date(d)';
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const dateTimeLiteralNode = node.simpleExpressions[0];
    expect(dateTimeLiteralNode.type).to.equal('DateTimeLiteral');
    const result = dateTimeLiteralNode.build({ context: Object.assign({}, { d: new Date('2018-03-01T00:00:00+01:00') }, builtInFns) });
    expect(result.utcOffset(1).format('YYYY MM DD HH mm SS')).to.equal('2018 02 28 01 00 00');
  });

  it('DateTimeLiteralNode.build date from moment-js instance', function() {
    const text = 'date(d)';
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const dateTimeLiteralNode = node.simpleExpressions[0];
    expect(dateTimeLiteralNode.type).to.equal('DateTimeLiteral');
    const result = dateTimeLiteralNode.build({ context: Object.assign({}, { d: moment.parseZone('2018-03-01T00:00:00+01:00') }, builtInFns) });
    expect(result.utcOffset(1).format('YYYY MM DD HH mm SS')).to.equal('2018 02 28 01 00 00');
  });

  it('DateTimeLiteralNode.build date and time from Javascript date', function() {
    const text = 'date and time(d)';
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const dateTimeLiteralNode = node.simpleExpressions[0];
    expect(dateTimeLiteralNode.type).to.equal('DateTimeLiteral');
    const result = dateTimeLiteralNode.build({ context: Object.assign({}, { d: new Date('2018-03-01T00:00:00+01:00') }, builtInFns) });
    expect(result.utcOffset(1).format('YYYY MM DD HH mm SS')).to.equal('2018 03 01 00 00 00');
  });

  it('DateTimeLiteralNode.build date and time from moment-js instance', function() {
    const text = 'date and time(d)';
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const dateTimeLiteralNode = node.simpleExpressions[0];
    expect(dateTimeLiteralNode.type).to.equal('DateTimeLiteral');
    const result = dateTimeLiteralNode.build({ context: Object.assign({}, { d: moment.parseZone('2018-03-01T00:00:00+01:00') }, builtInFns) });
    expect(result.utcOffset(1).format('YYYY MM DD HH mm SS')).to.equal('2018 03 01 00 00 00');
  });

  it('FunctionInvocationNode.build', function() {
    const text = 'plus(42, 1)';
    const _context = {
      plus: (x, y) => x + y
    };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const functionInvocationNode = node.simpleExpressions[0];
    expect(functionInvocationNode.type).to.equal('FunctionInvocation');
    const result = functionInvocationNode.build({ context: _context });
    expect(result).to.equal(43);
  });

  it('PositionalParametersNode.build', function() {
    const text = 'plus(a, b)';
    const _context = {
      plus: (x, y) => x + y,
      a: 42,
      b: 23
    };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const functionInvocationNode = node.simpleExpressions[0];
    expect(functionInvocationNode.type).to.equal('FunctionInvocation');
    const positionalParametersNode = functionInvocationNode.params;
    expect(positionalParametersNode.type).to.equal('PositionalParameters');
    const result = positionalParametersNode.build({ context: _context });
    expect(result).to.have.ordered.members([42, 23]);
  });

  it('ComparisonExpressionNode.build', function() {
    const text = '42 != a';
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const comparisonExpressionNode = node.simpleExpressions[0];
    expect(comparisonExpressionNode.type).to.equal('ComparisonExpression');
    const result = comparisonExpressionNode.build({ context: {  a: 42 } });
    expect(result).to.be.false;
    const otherResult = comparisonExpressionNode.build({ context: { a: 23 } });
    expect(otherResult).to.be.true;
  });
});

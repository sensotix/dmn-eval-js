/*
*  ©2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
const chalk = require('chalk');
const chai = require('chai');
const expect = chai.expect;
const FEEL = require('../dist/feel');
const builtInFns = require('../utils/built-in-functions');

describe(chalk.blue('handle undefined values tests'), function() {

  it('ProgramNode', function() {
    const node = FEEL.parse('a', { startRule: 'Start' });
    expect(node.type).to.equal('Program');
    let result = node.build({ a: undefined });
    expect(result).to.be.undefined;
    result = node.build({ });
    expect(result).to.be.undefined;
  });

  it('IntervalNode', function() {
    const node = FEEL.parse('[10 .. a)', { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    const intervalNode = node.expr[0];
    expect(intervalNode.type).to.equal('Interval');
    let result = intervalNode.build({ context: { a: undefined } });
    expect(typeof result).to.equal('function');
    expect(result(9)).to.be.false;
    expect(result(10)).to.be.undefined;
    result = intervalNode.build({ context: { } });
    expect(typeof result).to.equal('function');
    expect(result(9)).to.be.false;
    expect(result(10)).to.be.undefined;
  });

  it('SimplePositiveUnaryTestNode', function() {
    const node = FEEL.parse('< a', { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    const simplePositiveUnaryTestsNode = node.expr[0];
    expect(simplePositiveUnaryTestsNode.type).to.equal('SimplePositiveUnaryTest');
    let result = simplePositiveUnaryTestsNode.build({ context: { a: undefined} });
    expect(typeof result).to.equal('function');
    expect(result(41)).to.be.undefined;
    result = simplePositiveUnaryTestsNode.build({ context: { } });
    expect(typeof result).to.equal('function');
    expect(result(41)).to.be.undefined;
  });

  it('SimpleUnaryTestsNode', function() {
    const node = FEEL.parse('a, 10', { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    let result = node.build({});
    expect(typeof result).to.equal('function');
    expect(result(10)).to.be.true;
    expect(result(42)).to.be.undefined;
    result = node.build({ a: undefined });
    expect(typeof result).to.equal('function');
    expect(result(10)).to.be.true;
    expect(result(42)).to.be.undefined;
  });

  it('SimpleUnaryTestsNode (not)', function() {
    const node = FEEL.parse('not(a, 10)', { startRule: 'SimpleUnaryTests' });
    expect(node.type).to.equal('SimpleUnaryTestsNode');
    let result = node.build({ a: undefined });
    expect(typeof result).to.equal('function');
    expect(result(10)).to.be.false;
    expect(result(42)).to.be.undefined;
    result = node.build({ });
    expect(typeof result).to.equal('function');
    expect(result(10)).to.be.false;
    expect(result(42)).to.be.undefined;
  });

  it('QualifiedNameNode', function() {
    const node = FEEL.parse('a.b', { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const qualifiedNameNode = node.simpleExpressions[0];
    expect(qualifiedNameNode.type).to.equal('QualifiedName');
    let result = qualifiedNameNode.build({ context: { } });
    expect(result).to.equal(undefined);
    result = qualifiedNameNode.build({ context: { a: undefined } });
    expect(result).to.equal(undefined);
    result = qualifiedNameNode.build({ context: { a: { } } });
    expect(result).to.equal(undefined);
    result = qualifiedNameNode.build({ context: { a: { b: undefined } } });
    expect(result).to.equal(undefined);
  });

  it('ArithmeticExpressionNode', function() {
    const node = FEEL.parse('a + 1', { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const arithmeticExpressionNode = node.simpleExpressions[0];
    expect(arithmeticExpressionNode.type).to.equal('ArithmeticExpression');
    let result = arithmeticExpressionNode.build({ context: { } });
    expect(result).to.equal(undefined);
    result = arithmeticExpressionNode.build({ context: { a: undefined } });
    expect(result).to.equal(undefined);
  });

  it('NameNode', function() {
    const node = FEEL.parse('a', { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const qualifiedNameNode = node.simpleExpressions[0];
    expect(qualifiedNameNode.type).to.equal('QualifiedName');
    const nameNode = qualifiedNameNode.names[0];
    expect(nameNode.type).to.equal('Name');
    let result = nameNode.build({ context: { } });
    expect(result).to.equal(undefined);
    result = nameNode.build({ context: { a: undefined } });
    expect(result).to.equal(undefined);
  });

  it('DateTimeLiteralNode', function() {
    const node = FEEL.parse('date(a)', { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const dateTimeLiteralNode = node.simpleExpressions[0];
    expect(dateTimeLiteralNode.type).to.equal('DateTimeLiteral');
    let result = dateTimeLiteralNode.build({ context: Object.assign({}, { }, builtInFns) });
    expect(result).to.be.undefined;
    result = dateTimeLiteralNode.build({ context: Object.assign({}, { a: undefined }, builtInFns) });
    expect(result).to.be.undefined;
  });

  it('FunctionInvocationNode', function() {
    const text = 'plus(42, 1)';
    const _context = {
      plus: (x, y) => x + y
    };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const functionInvocationNode = node.simpleExpressions[0];
    expect(functionInvocationNode.type).to.equal('FunctionInvocation');
    const result = functionInvocationNode.build({ context: {} });
    expect(result).to.equal(undefined);
  });

  it('PositionalParametersNode.build', function() {
    const text = 'plus(a, b)';
    const _context = {
      plus: (x, y) => {
        if (x === undefined || y === undefined) {
          return undefined;
        }
        return x + y;
      },
      a: undefined,
    };
    const node = FEEL.parse(text, { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const functionInvocationNode = node.simpleExpressions[0];
    const result = functionInvocationNode.build({ context: _context });
    expect(result).to.be.undefined;
  });

  it('ComparisonExpressionNode.build', function() {
    const node = FEEL.parse('42 != a', { startRule: 'SimpleExpressions' });
    expect(node.type).to.equal('SimpleExpressions');
    const comparisonExpressionNode = node.simpleExpressions[0];
    expect(comparisonExpressionNode.type).to.equal('ComparisonExpression');
    let result = comparisonExpressionNode.build({ context: { a: undefined } });
    expect(result).to.be.undefined;
    result = comparisonExpressionNode.build({ context: { } });
    expect(result).to.be.undefined;
  });
});

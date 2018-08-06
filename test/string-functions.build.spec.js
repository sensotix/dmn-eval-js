/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
const chalk = require('chalk');
const chai = require('chai');
const expect = chai.expect;
const FEEL = require('../dist/feel');

describe(chalk.blue('Date/time/duration expression test'), function() {

  it('should find prefixes in string', function() {
      const condition = 'starts with(text, prefix)';
      const parsedGrammar = FEEL.parse(condition);
      let result = parsedGrammar.build({ text: 'foobar', prefix: 'foo' });
      expect(result).to.be.true;
      result = parsedGrammar.build({ text: 'foobar', prefix: 'bar' });
      expect(result).to.be.false;
      result = parsedGrammar.build({ text: 'other', prefix: 'foo' });
      expect(result).to.be.false;
      result = parsedGrammar.build({ text: null, prefix: 'foo' });
      expect(result).to.be.null;
      result = parsedGrammar.build({ prefix: 'foo'});
      expect(result).to.be.undefined;
      result = parsedGrammar.build({ text: 'foobar', prefix: null });
      expect(result).to.be.null;
      result = parsedGrammar.build({ text: 'foobar', prefix: undefined });
      expect(result).to.be.undefined;
  });

  it('should find suffixes in string', function() {
    const condition = 'ends with(text, prefix)';
    const parsedGrammar = FEEL.parse(condition);
    let result = parsedGrammar.build({ text: 'foobar', prefix: 'bar' });
    expect(result).to.be.true;
    result = parsedGrammar.build({ text: 'foobar', prefix: 'foo' });
    expect(result).to.be.false;
    result = parsedGrammar.build({ text: 'other', prefix: 'bar' });
    expect(result).to.be.false;
    result = parsedGrammar.build({ text: null, prefix: 'bar' });
    expect(result).to.be.null;
    result = parsedGrammar.build({ prefix: 'bar'});
    expect(result).to.be.undefined;
    result = parsedGrammar.build({ text: 'foobar', prefix: null });
    expect(result).to.be.null;
    result = parsedGrammar.build({ text: 'foobar', prefix: undefined });
    expect(result).to.be.undefined;
  });

  it('should find infixes in string', function() {
    const condition = 'contains(text, prefix)';
    const parsedGrammar = FEEL.parse(condition);
    let result = parsedGrammar.build({ text: 'foobar', prefix: 'foo' });
    expect(result).to.be.true;
    result = parsedGrammar.build({ text: 'foobar', prefix: 'bar' });
    expect(result).to.be.true;
    result = parsedGrammar.build({ text: 'foobar', prefix: 'oob' });
    expect(result).to.be.true;
    result = parsedGrammar.build({ text: 'foobar', prefix: 'no' });
    expect(result).to.be.false;
    result = parsedGrammar.build({ text: 'other', prefix: 'bar' });
    expect(result).to.be.false;
    result = parsedGrammar.build({ text: null, prefix: 'bar' });
    expect(result).to.be.null;
    result = parsedGrammar.build({ prefix: 'bar'});
    expect(result).to.be.undefined;
    result = parsedGrammar.build({ text: 'foobar', prefix: null });
    expect(result).to.be.null;
    result = parsedGrammar.build({ text: 'foobar', prefix: undefined });
    expect(result).to.be.undefined;
  });

  it('should convert string to upper case', function() {
    const condition = 'upper case(text)';
    const parsedGrammar = FEEL.parse(condition);
    let result = parsedGrammar.build({ text: 'foobar' });
    expect(result).to.equal('FOOBAR');
    result = parsedGrammar.build({ text: 'FOOBAR' });
    expect(result).to.equal('FOOBAR');
    result = parsedGrammar.build({ text: '' });
    expect(result).to.equal('');
    result = parsedGrammar.build({ text: null });
    expect(result).to.equal(null);
    result = parsedGrammar.build({ });
    expect(result).to.be.undefined;
  });

  it('should convert string to lower case', function() {
    const condition = 'lower case(text)';
    const parsedGrammar = FEEL.parse(condition);
    let result = parsedGrammar.build({ text: 'FOOBAR' });
    expect(result).to.equal('foobar');
    result = parsedGrammar.build({ text: 'foobar' });
    expect(result).to.equal('foobar');
    result = parsedGrammar.build({ text: '' });
    expect(result).to.equal('');
    result = parsedGrammar.build({ text: null });
    expect(result).to.equal(null);
    result = parsedGrammar.build({ });
    expect(result).to.be.undefined;
  });

});

/*
*
*  ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
*  Bangalore, India. All Rights Reserved.
*
*/
var chalk = require('chalk');
var chai = require('chai');
var expect = chai.expect;
var FEEL = require('../../dist/feel');

describe(chalk.blue('Arithmetic expression ast parsing test'), function() {
    it('Successfully builds ast from simple arithmetic expression', function() {
        var text = 'a + b - c';
        var _context = {
            a: 10,
            b: 20,
            c: 5
        };
        var parsedGrammar = FEEL.parse(text);
        expect(parsedGrammar.build(_context)).to.equal(25);
    });

    it('Successfully builds ast from simple arithmetic comparison', function() {
      var text = '< a + b';
      var _context = {
        a: 10,
        b: 20,
      };
      var parsedGrammar = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
      const result = parsedGrammar.build(_context);
      expect(result).not.to.be.undefined;
      expect(result(29)).to.be.true;
      expect(result(30)).to.be.false;
    });

  /* this test currently fails - TODO: fix the grammar with respect to arithmetic expressions
  it('Successfully builds ast from arithmetic expression with correct operator precedence', function() {
    var text = 'a + b / c - d';

    var _context = {
      a: 2,
      b: 6,
      c: 3,
      d: 1,
    };

    var parsedGrammar = FEEL.parse(text);
    expect(parsedGrammar.build(_context)).to.equal(3);
  });
  */

  /* this test currently fails - TODO: fix the grammar with respect to arithmetic expressions
  it('Successfully builds ast from arithmetic expression', function() {
    var text = '((a + b)/c - (2 + e*2))**f';

    var _context = {
        a: 10,
        b: 20,
        c: 5,
        d: 1,
        e: 3,
        f: 3
    };

    var parsedGrammar = FEEL.parse(text);
    expect(parsedGrammar.build(_context)).to.equal(-8);
  });
  */

  it('Successfully builds ast from arithmetic expression', function() {
      var text = '1-(1+rate/12)**-term';
      var _context = {
          rate: 12,
          term: 5
      };
      var parsedGrammar = FEEL.parse(text);
      expect(parsedGrammar.build(_context)).to.equal(0.96875);
  });

});

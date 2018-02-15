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

  it('should do date subtraction and return a duration', function() {
      var text = 'date("2012-12-25") - date("2012-12-24")';
      var parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;

      expect(result.isDtd).to.be.true;
      expect(result.days).to.equal(1);
  });

  it('should do throw error for date addition', function() {
      var text = 'date("2012-12-25") + date("2012-12-24")';
      var parsedGrammar = FEEL.parse(text);
      try {
        parsedGrammar.build();
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err.message).to.equal('date + date : operation unsupported for one or more operands types');
      }
  });

  it('should do time subtraction and return a duration', function() {
      var text = 'time("T13:10:06") - time("T13:10:05")';
      var parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;
      expect(result.isDtd).to.be.true;
      expect(result.seconds).to.equal(1);
  });

  it('should do throw error for time addition', function() {
      var text = 'time("T13:10:06") + time("T13:10:05")';
      var parsedGrammar = FEEL.parse(text);
      try {
        parsedGrammar.build();
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err.message).to.equal('time + time : operation unsupported for one or more operands types');
      }
  });

  it('should do years and months duration subtraction and return a years and months duration', function() {
      var text = 'duration("P1Y13M") - duration("P1M")';
      var parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;
      expect(result.isYmd).to.be.true;
      expect(result.years).to.equal(2);
  });

  it('should do years and months duration addition and return a years and months duration', function() {
      var text = 'duration("P1Y11M") + duration("P1M")';
      var parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;
      expect(result.isYmd).to.be.true;
      expect(result.years).to.equal(2);
  });

  it('should add years and months duration addition to date and time and return a date and time', function() {
      var text = 'date and time("2012-12-24T23:59:00") + duration("P1Y")';
      var parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDateTime).to.be.true;
      expect(result.year).to.equal(2013);
  });

  it('should multiply years and months duration with number and return a years and months duration', function() {
    var text = 'duration("P1Y5M") * 5';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(7);
    expect(result.months).to.equal(1);
  });

  it('should multiply days and time duration with number and return a days and time duration', function() {
    var text = 'duration("P5DT12H20M40S") * 5';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.days).to.equal(27);
    expect(result.hours).to.equal(13);
    expect(result.minutes).to.equal(43);
    expect(result.seconds).to.equal(20);
  });

  it('should multiply years and months duration with number and return a years and months duration', function() {
    var text = 'duration("P1Y5M") * 5';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(7);
    expect(result.months).to.equal(1);
  });

  it('should divide days and time duration with number and return a null when the number is 0', function() {
    var text = 'duration("P5DT12H20M40S") / 0';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result).to.be.null;
  });

  it('should divide days and time duration with number and return a days and time duration', function() {
    var text = 'duration("P5DT12H20M40S") / 5';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.days).to.equal(1);
    expect(result.hours).to.equal(2);
    expect(result.minutes).to.equal(28);
    expect(result.seconds).to.equal(8);
  });

  it('should divide years and months duration with number and return a null when the number is 0', function() {
    var text = 'duration("P1Y5M") / 0';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result).to.be.null;
  });

  it('should divide years and months duration with number and return a years and months duration', function() {
    var text = 'duration("P5Y5M") / 5';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(1);
    expect(result.months).to.equal(1);
  });

  it('should divide number with years and months duration and return a years and months duration', function() {
    var text = '5 / duration("P5Y5M")';
    var parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(1);
    expect(result.months).to.equal(1);
  });
});

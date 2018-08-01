/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
const chalk = require('chalk');
const chai = require('chai');
const expect = chai.expect;
const FEEL = require('../../dist/feel');

describe(chalk.blue('Date/time/duration expression test'), function() {

  it('should do date subtraction and return a duration', function() {
      const text = 'date("2012-12-25") - date("2012-12-24")';
      const parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;

      expect(result.isDtd).to.be.true;
      expect(result.days).to.equal(1);
  });

  it('should do throw error for date addition', function() {
      const text = 'date("2012-12-25") + date("2012-12-24")';
      const parsedGrammar = FEEL.parse(text);
      try {
        parsedGrammar.build();
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err.message).to.equal('date + date : operation unsupported for one or more operands types');
      }
  });

  it('should do time subtraction and return a duration', function() {
      const text = 'time("T13:10:06") - time("T13:10:05")';
      const parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;
      expect(result.isDtd).to.be.true;
      expect(result.seconds).to.equal(1);
  });

  it('should do throw error for time addition', function() {
      const text = 'time("T13:10:06") + time("T13:10:05")';
      const parsedGrammar = FEEL.parse(text);
      try {
        parsedGrammar.build();
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err.message).to.equal('time + time : operation unsupported for one or more operands types');
      }
  });

  it('should do years and months duration subtraction and return a years and months duration', function() {
      const text = 'duration("P1Y13M") - duration("P1M")';
      const parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;
      expect(result.isYmd).to.be.true;
      expect(result.years).to.equal(2);
  });

  it('should do years and months duration addition and return a years and months duration', function() {
      const text = 'duration("P1Y11M") + duration("P1M")';
      const parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDuration).to.be.true;
      expect(result.isYmd).to.be.true;
      expect(result.years).to.equal(2);
  });

  it('should add years and months duration addition to date and time and return a date and time', function() {
      const text = 'date and time("2012-12-24T23:59:00") + duration("P1Y")';
      const parsedGrammar = FEEL.parse(text);
      const result = parsedGrammar.build();
      expect(result.isDateTime).to.be.true;
      expect(result.year).to.equal(2013);
  });

  it('should multiply years and months duration with number and return a years and months duration', function() {
    const text = 'duration("P1Y5M") * 5';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(7);
    expect(result.months).to.equal(1);
  });

  it('should multiply days and time duration with number and return a days and time duration', function() {
    const text = 'duration("P5DT12H20M40S") * 5';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.days).to.equal(27);
    expect(result.hours).to.equal(13);
    expect(result.minutes).to.equal(43);
    expect(result.seconds).to.equal(20);
  });

  it('should multiply years and months duration with number and return a years and months duration', function() {
    const text = 'duration("P1Y5M") * 5';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(7);
    expect(result.months).to.equal(1);
  });

  it('should divide days and time duration with number and return a null when the number is 0', function() {
    const text = 'duration("P5DT12H20M40S") / 0';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result).to.be.null;
  });

  it('should divide days and time duration with number and return a days and time duration', function() {
    const text = 'duration("P5DT12H20M40S") / 5';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.days).to.equal(1);
    expect(result.hours).to.equal(2);
    expect(result.minutes).to.equal(28);
    expect(result.seconds).to.equal(8);
  });

  it('should divide years and months duration with number and return a null when the number is 0', function() {
    const text = 'duration("P1Y5M") / 0';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result).to.be.null;
  });

  it('should divide years and months duration with number and return a years and months duration', function() {
    const text = 'duration("P5Y5M") / 5';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(1);
    expect(result.months).to.equal(1);
  });

  it('should divide number with years and months duration and return a years and months duration', function() {
    const text = '5 / duration("P5Y5M")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.years).to.equal(1);
    expect(result.months).to.equal(1);
  });

  it('should add duration to date and time with variables', function() {
    const text = 'date and time(dt) + duration("P" + numDays + "D")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build( { dt: new Date('2018-03-01T00:00:00+01:00'), numDays: 5});
    expect(result.isDateTime).to.be.true;
    expect(result.toISOString()).to.equal('2018-03-05T23:00:00.000Z');
  });

  it('should subtract days with month rollover (incl. time)', function() {
    const text = 'date and time("2018-07-10T05:00:00+00:00") - duration("P2Y1M10D")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDateTime).to.be.true;
    expect(result.toISOString()).to.equal('2016-05-31T05:00:00.000Z');
  });

  it('should subtract days with month rollover', function() {
    const text = 'date("2018-07-10") - duration("P2Y1M10D")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDate).to.be.true;
    expect(result.toISOString()).to.equal('2016-05-31T00:00:00.000Z');
  });

  it('should subtract three months from last day of month (with time) correctly', function() {
    const text = 'date and time("2018-07-31T00:00:00+00:00") - duration("P3M")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDateTime).to.be.true;
    expect(result.toISOString()).to.equal('2018-04-30T00:00:00.000Z');
  });

  it('should subtract three months from last day of month correctly', function() {
    const text = 'date("2018-07-31") - duration("P3M")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDate).to.be.true;
    expect(result.toISOString()).to.equal('2018-04-30T00:00:00.000Z');
  });

  it('should add days with month rollover (incl. time)', function() {
    const text = 'date and time("2016-05-21T05:00:00+00:00") + duration("P2Y1M10D")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDateTime).to.be.true;
    expect(result.toISOString()).to.equal('2018-07-01T05:00:00.000Z');
  });

  it('should add days with month rollover', function() {
    const text = 'date("2016-05-21") + duration("P2Y1M10D")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDate).to.be.true;
    expect(result.toISOString()).to.equal('2018-07-01T00:00:00.000Z');
  });

  it('should add two months to last day of month (with time) correctly', function() {
    const text = 'date and time("2018-07-31T00:00:00+00:00") + duration("P2M")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDateTime).to.be.true;
    expect(result.toISOString()).to.equal('2018-09-30T00:00:00.000Z');
  });

  it('should add two months to last day of month correctly', function() {
    const text = 'date("2018-07-31") + duration("P2M")';
    const parsedGrammar = FEEL.parse(text);
    const result = parsedGrammar.build();
    expect(result.isDate).to.be.true;
    expect(result.toISOString()).to.equal('2018-09-30T00:00:00.000Z');
  });

});

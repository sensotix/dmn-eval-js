/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
var fs = require('fs');
var chalk = require('chalk');
var chai = require('chai');
var expect = chai.expect;
var { decisionTable, dateTime } = require('../index');

function readFile(filename) {
  return fs.readFileSync(filename, { encoding: 'UTF-8' });
}

describe(chalk.blue('Parse and evaluate decision tables'), function() {

  it('Parse DRG', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test.dmn"), function(err, dtXml) {
      expect(err).to.be.undefined;
      expect(dtXml).not.to.be.undefined;
      var decisions = decisionTable.parseDecisions(dtXml.drgElements);
      expect(decisions).not.to.be.undefined;
      expect(decisions['decisionPrimary']).not.to.be.undefined;
      expect(decisions['decisionDependent']).not.to.be.undefined;
      expect(decisions['decisionUnknown']).to.be.undefined;
      done();
    });
  });

  it('Evaluation decision table', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test.dmn"), function(err, dtXml) {
      expect(dtXml).not.to.be.undefined;
      var decisions = decisionTable.parseDecisions(dtXml.drgElements);
      expect(decisions['decisionDependent']).not.to.be.undefined;
      const context = {
        input: {
          category: "E",
          referenceDate: dateTime.date("2018-01-04"),
        }
      };
      const result = decisionTable.evaluateDecision('decisionDependent', decisions, context);
      expect(result).not.to.be.undefined;
      result.then((data) => {
        expect(data.periodBegin.isSame(dateTime.date("2018-01-04"))).to.be.true;
        expect(data.periodEnd.isSame(dateTime.date("2018-01-04"))).to.be.true;
        done();
      }).catch(err => done(err));
    });
  });

  it('Evaluation decision table with required decision', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test.dmn"), function(err, dtXml) {
      expect(dtXml).not.to.be.undefined;
      var decisions = decisionTable.parseDecisions(dtXml.drgElements);
      expect(decisions['decisionPrimary']).not.to.be.undefined;
      const context = {
        input: {
          category: "E",
          referenceDate: dateTime.date("2018-01-04"),
          testDate: dateTime.date("2018-01-03"),
        }
      };
      const result = decisionTable.evaluateDecision('decisionPrimary', decisions, context);
      expect(result).not.to.be.undefined;
      result.then((data) => {
        expect(data.score).to.equal(50);
        done();
      }).catch(err => done(err));
    });
  });

  it('Evaluation decision table with hit policy COLLECT', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test-collect.dmn"), function(err, dtXml) {
      expect(dtXml).not.to.be.undefined;
      var decisions = decisionTable.parseDecisions(dtXml.drgElements);
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "A",
        }
      };
      const result = decisionTable.evaluateDecision('decision', decisions, context);
      expect(result).not.to.be.undefined;
      result.then((data) => {
        expect(data).not.to.be.undefined;
        expect(data.length).to.equal(4);
        expect(data[0].message).to.equal('Message 1');
        expect(data[1].message).to.equal('Message 3');
        expect(data[2].message).to.equal('Message 4');
        expect(data[3].message).to.equal('Message 5');
        done();
      }).catch(err => done(err));
    });
  });
});

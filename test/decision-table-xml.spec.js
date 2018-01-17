/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
var fs = require('fs');
var chalk = require('chalk');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
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
        expect(data.output.score).to.equal(50);
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
        expect(data.message).not.to.be.undefined;
        expect(data.message.length).to.equal(4);
        expect(data.message[0]).to.equal('Message 1');
        expect(data.message[1]).to.equal('Message 3');
        expect(data.message[2]).to.equal('Message 4');
        expect(data.message[3]).to.equal('Message 5');
        expect(data.output.property).not.to.be.undefined;
        expect(data.output.property.length).to.equal(4);
        expect(data.output.property[0]).to.equal('Value 1');
        expect(data.output.property[1]).to.equal('Value 3');
        expect(data.output.property[2]).to.equal('Value 4');
        expect(data.output.property[3]).to.equal('Value 5');
        done();
      }).catch(err => done(err));
    });
  });

  it('Evaluation decision table with hit policy RULE ORDER', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test-rule-order.dmn"), function(err, dtXml) {
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
        expect(data.message).not.to.be.undefined;
        expect(data.message.length).to.equal(4);
        expect(data.message[0]).to.equal('Message 1');
        expect(data.message[1]).to.equal('Message 3');
        expect(data.message[2]).to.equal('Message 4');
        expect(data.message[3]).to.equal('Message 5');
        done();
      }).catch(err => done(err));
    });
  });

  it('Evaluation decision table with hit policy UNIQUE', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test-unique.dmn"), function(err, dtXml) {
      expect(dtXml).not.to.be.undefined;
      var decisions = decisionTable.parseDecisions(dtXml.drgElements);
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "B",
        }
      };
      const result = decisionTable.evaluateDecision('decision', decisions, context);
      expect(result).not.to.be.undefined;
      result.then((data) => {
        expect(data).not.to.be.undefined;
        expect(data.message).to.equal('Message 2');
        done();
      }).catch(err => done(err));
    });
  });

  it('Enforce uniqueness for hit policy UNIQUE', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test-unique.dmn"), function(err, dtXml) {
      expect(dtXml).not.to.be.undefined;
      var decisions = decisionTable.parseDecisions(dtXml.drgElements);
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "A",
        }
      };
      decisionTable.evaluateDecision('decision', decisions, context).then((data) => {
        assert.fail(0, 1, "Uniqueness not enforced");
      }).catch(err => {
        expect(err.message).to.equal(`Decision "decision" is not unique but hit policy is UNIQUE.`);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  it('Evaluation decision with arithmetic input expression', function(done) {
    decisionTable.readDmnXml(readFile("./test/data/test-input-expression.dmn"), function(err, dtXml) {
      expect(dtXml).not.to.be.undefined;
      var decisions = decisionTable.parseDecisions(dtXml.drgElements);
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          score: 1,
        }
      };
      const result = decisionTable.evaluateDecision('decision', decisions, context);
      expect(result).not.to.be.undefined;
      result.then((data) => {
        expect(data).not.to.be.undefined;
        expect(data.message).to.equal('Score 2');
        done();
      }).catch(err => done(err));
    });
  });
});

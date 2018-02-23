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
    decisionTable.parseDmnXml(readFile("./test/data/test.dmn")).then(decisions => {
      expect(decisions).not.to.be.undefined;
      expect(decisions['decisionPrimary']).not.to.be.undefined;
      expect(decisions['decisionDependent']).not.to.be.undefined;
      expect(decisions['decisionUnknown']).to.be.undefined;
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision table', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test.dmn")).then(decisions => {
      expect(decisions['decisionDependent']).not.to.be.undefined;
      const context = {
        input: {
          category: "E",
          referenceDate: dateTime.date("2018-01-04"),
        }
      };
      const data = decisionTable.evaluateDecision('decisionDependent', decisions, context);
      expect(data.periodBegin.isSame(dateTime.date("2018-01-04"))).to.be.true;
      expect(data.periodEnd.isSame(dateTime.date("2018-01-04"))).to.be.true;
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision table with required decision', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test.dmn")).then(decisions => {
      expect(decisions['decisionPrimary']).not.to.be.undefined;
      const context = {
        input: {
          category: "E",
          referenceDate: dateTime.date("2018-01-04"),
          testDate: dateTime.date("2018-01-03"),
        }
      };
      const data = decisionTable.evaluateDecision('decisionPrimary', decisions, context);
      expect(data.output.score).to.equal(50);
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision table with hit policy COLLECT', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-collect.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "A",
        }
      };
      const data = decisionTable.evaluateDecision('decision', decisions, context);
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

  it('Evaluation decision table with hit policy RULE ORDER', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-rule-order.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "A",
        }
      };
      const data = decisionTable.evaluateDecision('decision', decisions, context);
      expect(data.message).not.to.be.undefined;
      expect(data.message.length).to.equal(4);
      expect(data.message[0]).to.equal('Message 1');
      expect(data.message[1]).to.equal('Message 3');
      expect(data.message[2]).to.equal('Message 4');
      expect(data.message[3]).to.equal('Message 5');
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision table with hit policy UNIQUE', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-unique.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "B",
        }
      };
      const data = decisionTable.evaluateDecision('decision', decisions, context);
      expect(data).not.to.be.undefined;
      expect(data.message).to.equal('Message 2');
      done();
    }).catch(err => done(err));
  });

  it.only('Return undefined if no rule matches', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-no-matching-rule.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "D",
        }
      };
      const data = decisionTable.evaluateDecision('decision', decisions, context);
      expect(data).not.to.be.undefined;
      expect(data.message).to.be.undefined;
      done();
    }).catch(err => done(err));
  });


  it('Enforce uniqueness for hit policy UNIQUE', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-unique.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          category: "A",
        }
      };
      try {
        decisionTable.evaluateDecision('decision', decisions, context);
        assert.fail(0, 1, "Uniqueness not enforced");
      } catch (err) {
        expect(err.message).to.equal(`Decision "decision" is not unique but hit policy is UNIQUE.`);
        done();
      }
    }).catch(err => done(err));
  });

  it('Evaluation decision with arithmetic input expression', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-input-expression.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      const context = {
        input: {
          score: 1,
        }
      };
      const data = decisionTable.evaluateDecision('decision', decisions, context);
      expect(data).not.to.be.undefined;
      expect(data.message).to.equal('Score 2');
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision with input expression resolving to undefined', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-input-expression.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      let data = decisionTable.evaluateDecision('decision', decisions, { });
      expect(data).not.to.be.undefined;
      expect(data.message).to.equal('other score');
      data = decisionTable.evaluateDecision('decision', decisions, { input: { } });
      expect(data).not.to.be.undefined;
      expect(data.message).to.equal('other score');
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision with input entry resolving to undefined', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-undefined-input-entry.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      let data = decisionTable.evaluateDecision('decision', decisions, { input: { score: 42, otherCategory: 'poor' } });
      expect(data).not.to.be.undefined;
      expect(data.output.category).to.equal('poor');
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision with output expression resolving to undefined with hit policy UNIQUE', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-undefined-output-expression.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      data = decisionTable.evaluateDecision('decision', decisions, { input: { score: 1 } });
      expect(data).not.to.be.undefined;
      expect(data.output).not.to.be.undefined;
      expect(data.output.categeory).to.be.undefined;
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision with output expression resolving to undefined with hit policy COLLECT', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-undefined-output-expression-collect.dmn")).then(decisions => {
      expect(decisions['decision']).not.to.be.undefined;
      data = decisionTable.evaluateDecision('decision', decisions, { input: { score: 3, category1: 'cat1', category3: 'cat3', otherCategory: 'other' } });
      expect(data).not.to.be.undefined;
      expect(data.output).not.to.be.undefined;
      expect(data.output.categories).to.have.ordered.members([ 'cat1', 'other' ]);
      done();
    }).catch(err => done(err));
  });
});

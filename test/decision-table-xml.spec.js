/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
const fs = require('fs');
const chalk = require('chalk');
const chai = require('chai');
const moment = require('moment');
const expect = chai.expect;
const assert = chai.assert;

const { decisionTable, dateTime } = require('../index');

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
          referenceDate: new Date("2018-01-04T00:00:00+00:00"),
        }
      };
      const data = decisionTable.evaluateDecision('decisionDependent', decisions, context);
      expect(moment.isMoment(data.periodBegin)).to.be.true;
      expect(data.periodBegin.isSame(dateTime.date("2018-01-04"))).to.be.true;
      expect(moment.isDuration(data.periodDuration)).to.be.true;
      expect(data.periodDuration.months).to.equal(3);
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision table with no matching rules', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-no-matching-rules.dmn")).then(decisions => {
      expect(decisions['decisionUnique']).not.to.be.undefined;
      expect(decisions['decisionCollect']).not.to.be.undefined;
      const context = {
        input: {
          input1: 1,
          input2: 2,
        }
      };
      let data = decisionTable.evaluateDecision('decisionUnique', decisions, context);
      expect(data).not.to.be.undefined;
      expect(data.output1).not.to.be.undefined;
      expect(data.output1.nested).to.be.undefined;
      expect(data.output2).to.be.undefined;
      data = decisionTable.evaluateDecision('decisionCollect', decisions, context);
      expect(data).not.to.be.undefined;
      expect(data).to.have.ordered.members([]);
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision table with required decision', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test.dmn")).then(decisions => {
      expect(decisions['decisionPrimary']).not.to.be.undefined;
      const context = {
        input: {
          category: "E",
          referenceDate: new Date("2018-01-04T00:00:00+00:00"),
          testDate: new Date("2018-01-03T00:00:00+00:00"),
        }
      };
      let data = decisionTable.evaluateDecision('decisionPrimary', decisions, context);
      expect(data.output.score).to.equal(50);
      context.input.testDate = new Date("2018-04-04T00:00:00+00:00"),
      data = decisionTable.evaluateDecision('decisionPrimary', decisions, context);
      expect(data.output.score).to.equal(100);
      context.input.testDate = new Date("2018-04-05T00:00:00+00:00"),
      data = decisionTable.evaluateDecision('decisionPrimary', decisions, context);
      expect(data.output.score).to.equal(0);
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
      assert.deepEqual(data, [
        { message: 'Message 1', output: { property: 'Value 1' }},
        { message: 'Message 3', output: { property: undefined }},
        { message: undefined, output: { property: 'Value 4' }},
        { message: 'Message 5', output: { property: 'Value 5' }},
      ]);
      done();
    }).catch(err => done(err));
  });

  it('Evaluation decision table with required decision of hit policy COLLECT', function(done) {
    decisionTable.parseDmnXml(readFile("./test/data/test-collect-drg.dmn")).then(decisions => {
      expect(decisions['decisionPrimary']).not.to.be.undefined;
      const context = {
        input: {
          category: "A",
        }
      };
      const data = decisionTable.evaluateDecision('decisionPrimary', decisions, context);
      expect(data.output.score).to.equal(50);
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
      assert.deepEqual(data, [
        { message: 'Message 1' },
        { message: 'Message 3' },
        { message: 'Message 4' },
        { message: 'Message 5' },
      ]);
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

  it('Return undefined if no rule matches', function(done) {
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
      console.log(JSON.stringify(data));
      assert.deepEqual(data, [
        { output: { categories: 'cat1' } },
        { output: { categories: undefined } },
        { output: { categories: 'other' } },
      ]);
      done();
    }).catch(err => done(err));
  });
});

/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/
const DmnModdle = require('dmn-moddle');
const feel = require('../../dist/feel');

function createModdle(additionalPackages, options) {
  return new DmnModdle(additionalPackages, options);
}

function readDmnXml(xml, root, opts, callback) {
  return createModdle().fromXML(xml, root, opts, callback);
}

function parseDecisionTable(decisionTable) {
  const parsedDecisionTable = { hitPolicy: decisionTable.hitPolicy, rules: [], inputExpressions: [], outputExpressions: [] };
  decisionTable.rule.forEach((rule, idx) => {
    const parsedRule = { number: idx + 1, input: [], inputExpressions: [], output: [], outputExpressions: [] };
    parsedDecisionTable.rules.push(parsedRule);
    rule.inputEntry.forEach((inputEntry) => {
      let text = inputEntry.text;
      if (text === '') {
        text = '-';
      }
      try {
        parsedRule.input.push(feel.parse(text, {
          startRule: 'SimpleUnaryTests',
        }));
        parsedRule.inputExpressions.push(text);
      } catch (err) {
        throw new Error(`'Failed to parse input entry: ${text} ${err}`);
      }
    });
    rule.outputEntry.forEach((outputEntry) => {
      try {
        parsedRule.output.push(feel.parse(outputEntry.text, {
          startRule: 'SimpleExpressions',
        }));
      } catch (err) {
        throw new Error(`'Failed to parse output entry: ${outputEntry.text} ${err}`);
      }
      parsedRule.outputExpressions.push(outputEntry.text);
    });
  });
  decisionTable.input.forEach((input) => {
    if (input.inputExpression) {
      parsedDecisionTable.inputExpressions.push(input.inputExpression.text);
    } else if (input.inputVariable) {
      parsedDecisionTable.inputExpressions.push(input.inputVariable);
    } else {
      throw new Error(`'No input variable or expression set for input "${input.id}"`);
    }
  });
  decisionTable.output.forEach((output) => {
    if (output.name) {
      parsedDecisionTable.outputExpressions.push(output.name);
    } else {
      throw new Error(`No name set for output "${output.id}"`);
    }
  });
  return parsedDecisionTable;
}

function parseDecisions(drgElements) {
  const parsedDecisions = [];
  // iterate over all decisions in the DMN
  drgElements.forEach((drgElement) => {
    // parse the decision table...
    const decision = { decisionTable: parseDecisionTable(drgElement.decisionTable), requiredDecisions: [] };
    // ...and collect the decisions on which the current decision depends
    if (drgElement.informationRequirement !== undefined) {
      drgElement.informationRequirement.forEach((req) => {
        if (req.requiredDecision !== undefined) {
          const requiredDecisionId = req.requiredDecision.href.replace('#', '');
          decision.requiredDecisions.push(requiredDecisionId);
        }
      });
    }
    parsedDecisions[drgElement.id] = decision;
  });
  return parsedDecisions;
}

function resolveExpression(expression, context) {
  const parts = expression.split('.');
  return parts.reduce((resolved, part) => resolved[part], context);
}

function setValue(expression, obj, value) {
  const indexOfDot = expression.indexOf('.');
  if (indexOfDot < 0) {
    obj[expression] = value; // eslint-disable-line no-param-reassign
  } else {
    const first = expression.substr(0, indexOfDot);
    const remainder = expression.substr(indexOfDot + 1);
    obj[first] = setValue(remainder, {}, value); // eslint-disable-line no-param-reassign
  }
  return obj;
}

async function evaluateRule(rule, inputExpressions, outputExpressions, context) {
  for (let i = 0; i < rule.input.length; i += 1) {
    try {
      const inputFunction = await rule.input[i].build(context); // eslint-disable-line no-await-in-loop
      const input = resolveExpression(inputExpressions[i], context);
      if (!inputFunction(input)) {
        return {
          matched: false,
        };
      }
    } catch (err) {
      throw new Error(`Failed to evaluate expression "${rule.inputExpressions[i]}": ${err}`);
    }
  }
  const outputObject = {};
  for (let i = 0; i < rule.output.length; i += 1) {
    const outputValue = await rule.output[i].build(context); // eslint-disable-line no-await-in-loop
    setValue(outputExpressions[i], outputObject, outputValue[0]);
  }
  return { matched: true, output: outputObject };
}

async function evaluateDecision(decisionId, decisions, context, alreadyEvaluatedDecisions) {
  console.log(`Evaluating decision "${decisionId}"...`);
  if (!alreadyEvaluatedDecisions) {
    alreadyEvaluatedDecisions = []; // eslint-disable-line no-param-reassign
  }
  const decision = decisions[decisionId];
  // execute required decisions recursively first
  for (let i = 0; i < decision.requiredDecisions.length; i += 1) {
    const reqDecision = decision.requiredDecisions[i];
    // check if the decision was already executed, to prevent unecessary evaluations if multiple decisions require the same decision
    if (!alreadyEvaluatedDecisions[reqDecision]) {
      const requiredResult = await evaluateDecision(reqDecision, decisions, context, alreadyEvaluatedDecisions); // eslint-disable-line no-await-in-loop
      // merge the result of the required decision into the context so that it is available as input for the requested decision
      for (const prop in requiredResult) { // eslint-disable-line no-restricted-syntax
        if (requiredResult.hasOwnProperty(prop)) {
          context[prop] = requiredResult[prop]; // eslint-disable-line no-param-reassign
        }
      }
      alreadyEvaluatedDecisions[reqDecision] = true; // eslint-disable-line no-param-reassign
    }
  }
  const decisionTable = decision.decisionTable;
  // iterate over the rules of the decision table of the requested decision, and return the output of the first matching rule
  for (let i = 0; i < decisionTable.rules.length; i += 1) {
    const rule = decisionTable.rules[i];
    try {
      const ruleResult = await evaluateRule(rule, decisionTable.inputExpressions, decisionTable.outputExpressions, context); // eslint-disable-line no-await-in-loop
      if (ruleResult.matched) {
        console.log(`Result for decision "${decisionId}": ${JSON.stringify(ruleResult.output)}`);
        return ruleResult.output;
      }
    } catch (err) {
      throw new Error(`Failed to evaluated rule ${rule.number} of decision ${decisionId}:  ${err}`);
    }
  }
  console.log(`No rule matched for decision "${decisionId}"`);
  return null;
}

function dumpTree(node, indent) {
  if (!node) {
    console.log('undefined');
    return;
  }
  if (!indent) {
    indent = ''; // eslint-disable-line no-param-reassign
  }
  console.log(indent + node.type);
  if (node.not) {
    console.log(`${indent}  (not)`);
  }
  const newIndent = `${indent}  `;
  switch (node.type) {
    case 'ArithmeticExpression': {
      console.log(`${indent}  ${node.operator}`);
      dumpTree(node.operand_1, newIndent);
      dumpTree(node.operand_2, newIndent);
      break;
    }
    case 'FunctionInvocation': {
      dumpTree(node.fnName, newIndent);
      dumpTree(node.params, newIndent);
      break;
    }
    case 'DateTimeLiteral': node.params.forEach(p => dumpTree(p, newIndent)); break;
    case 'Interval': {
      dumpTree(node.startpoint, newIndent);
      dumpTree(node.endpoint, newIndent);
      break;
    }
    case 'Literal': console.log(newIndent + node.value); break;
    case 'Name': console.log(`${newIndent}"${node.nameChars}"`); break;
    case 'PathExpression': node.exprs.forEach(e => dumpTree(e, newIndent)); break;
    case 'PositionalParameters': node.params.forEach(p => dumpTree(p, newIndent)); break;
    case 'Program': dumpTree(node.body, newIndent); break;
    case 'QualifiedName': node.names.forEach(n => dumpTree(n, newIndent)); break;
    case 'SimpleExpressions': node.simpleExpressions.forEach(s => dumpTree(s, newIndent)); break;
    case 'SimplePositiveUnaryTest': dumpTree(node.operand, newIndent); break;
    case 'SimpleUnaryTestsNode': node.expr.forEach(e => dumpTree(e, newIndent)); break;
    case 'UnaryTestsNode': node.expr.forEach(e => dumpTree(e, newIndent)); break;
    default: console.log('?');
  }
}

module.exports = { readDmnXml, parseDecisions, evaluateDecision, dumpTree };

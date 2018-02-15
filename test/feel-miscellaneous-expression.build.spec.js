/*
*
*  ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
*  Bangalore, India. All Rights Reserved.
*
*/
const chalk = require('chalk');
const chai = require('chai');
const expect = chai.expect;
const FEEL = require('../dist/feel');
const dateTime = require('../utils/built-in-functions/date-time-functions');

describe(chalk.blue('Random list of rules'), function () {

    it('Successfully parses and executes time with offset specified as negative duration', function () {
        const text = 'time(10, 15, 0, -duration("PT7H"))';
        const parsedText = FEEL.parse(text, { startRule: 'SimpleUnaryTests'});
        expect(parsedText.build()(dateTime.time("T10:15:00-07:00"))).to.equal(true);
    });

    it ('Successfully parses and executes SimpleExpressions and usage of mutiple grammar entry points', function () {
        const text = '1,2,3,4'
        const parsedText = FEEL.parse(text,{startRule : "SimpleExpressions"}); // parsed with "SimpleExpressions" entry point
        expect(parsedText.build()).to.eql([1,2,3,4]);
    });

});

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

    it('Successfully parses and executes open-ended interval', function (done) {
        const text = '[a..b)';
        const payload =  {"a":10,"b":20};
        try{
            const parsedText = FEEL.parse(text);
            parsedText.body.build(payload)
            .then((result) => {
                expect(result(19)).to.be.true;
                expect(result(20)).to.be.false;
                done();
            }).catch(err => {
                done(err);
            });
        }
        catch(e){
            done(e);
        }
    });

    it('Successfully parses and executes time with offset specified as negative duration', function (done) {
        const text = 'time(10, 15, 0, -duration("PT7H"))';
        try{
            const parsedText = FEEL.parse(text, { startRule: 'SimpleUnaryTests'});
            parsedText.build().then((result) => {
                expect(result(dateTime.time("T10:15:00-07:00"))).to.equal(true);
                done();
            }).catch(err => {
                done(err);
            });
        }
        catch(e){
            done(e);
        }
    })

    it ('Successfully parses and executes SimpleExpressions and usage of mutiple grammar entry points', function (done) {
       try{
            const text = '1,2,3,4'
            const parsedText = FEEL.parse(text,{startRule : "SimpleExpressions"}); // parsed with "SimpleExpressions" entry point
            parsedText.build().then((result) => {
                expect(result).to.eql([1,2,3,4]);
                done();
            }).catch(err => {
                done(err);
            });
        }
        catch(e){
            done(e);
        }
    })

});

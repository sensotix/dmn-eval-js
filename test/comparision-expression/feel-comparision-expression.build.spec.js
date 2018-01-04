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
const dateTime = require('../../utils/built-in-functions/date-time-functions');

describe(chalk.blue('Comparison expression ast parsing test'), function() {

    it('Successfully builds ast from simple comparison', function(done) {
        var text = '<= 5';

        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result).not.to.be.undefined;
            expect(result(4)).to.be.true;
            expect(result(5)).to.be.true;
            expect(result(6)).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully builds ast from comparison', function(done) {
        var text = '(5..10]';

        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result).not.to.be.undefined;
            expect(result(4)).to.be.false;
            expect(result(5)).to.be.false;
            expect(result(6)).to.be.true;
            expect(result(10)).to.be.true;
            expect(result(11)).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully builds ast from comparison', function(done) {
        var text = '[5..10]';

        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result).not.to.be.undefined;
            expect(result(4)).to.be.false;
            expect(result(5)).to.be.true;
            expect(result(10)).to.be.true;
            expect(result(11)).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully builds ast from comparison', function(done) {
        var text = '4,5,6';

        var parsedGrammar = FEEL.parse(text, { startRule: "SimpleUnaryTests" });
        parsedGrammar.build().then(result => {
            expect(result).not.to.be.undefined;
            expect(result(3)).to.be.false;
            expect(result(4)).to.be.true;
            expect(result(5)).to.be.true;
            expect(result(6)).to.be.true;
            expect(result(7)).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully builds ast from comparison', function(done) {
        var text = '<5,>5';

        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result).not.to.be.undefined;
            expect(result(4)).to.be.true;
            expect(result(5)).to.be.false;
            expect(result(6)).to.be.true;
          done();
        }).catch(err => done(err));
    });

    it('Successfully builds ast from comparison', function(done) {
        var text = '>= (7 + g)';

        _context = {
            g: 7
        }
        var parsedGrammar = FEEL.parse(text, { startRule: "SimpleUnaryTests"});
        parsedGrammar.build(_context).then(result => {
            expect(result).not.to.be.undefined;
            expect(result(13)).to.be.false;
            expect(result(14)).to.be.true;
            expect(result(15)).to.be.true;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare dates with ">"', function(done) {
        var text = '> date("2012-12-24")';
        var parsedGrammar = FEEL.parse(text, { startRule: "SimpleUnaryTests"});
        parsedGrammar.build().then(result => {
            expect(result(dateTime.date("2012-12-25"))).to.be.true;
            expect(result(dateTime.date("2012-12-24"))).to.be.false;
            expect(result(dateTime.date("2012-12-23"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare dates with ">="', function(done) {
        var text = '>= date("2012-12-24")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.date("2012-12-25"))).to.be.true;
            expect(result(dateTime.date("2012-12-24"))).to.be.true;
            expect(result(dateTime.date("2012-12-23"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare string "<"', function(done) {
        var text = '< "ABC"';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result("ABC")).to.be.false;
            expect(result("BBC")).to.be.false;
            expect(result("AAB")).to.be.true;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare string "<="', function(done) {
        var text = '<= "ABC"';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result("ABC")).to.be.true;
            expect(result("BBC")).to.be.false;
            expect(result("AAB")).to.be.true;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare string ">"', function(done) {
        var text = '> "ABC"';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result("ABC")).to.be.false;
            expect(result("BBC")).to.be.true;
            expect(result("AAB")).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare string ">="', function(done) {
        var text = '>= "ABC"';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result("ABC")).to.be.true;
            expect(result("BBC")).to.be.true;
            expect(result("AAB")).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare string "="', function(done) {
        var text = '"XYZ"';
        var parsedGrammar = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
        parsedGrammar.build().then(result => {
            expect(result("XYZ")).to.be.true;
            expect(result("ABC")).to.be.false;
            done();
        }).catch(err => done(err));
    });


    it('Successfully compare string "!="', function(done) {
        var text = 'not("XYZ")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result("XYZ")).to.be.false;
            expect(result("ABC")).to.be.true;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare date and time with "<"', function(done) {
        var text = '< date and time("2012-12-25T00:00:00")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime['date and time']("2012-12-24T23:59:59"))).to.be.true;
            expect(result(dateTime['date and time']("2012-12-25T00:00:00"))).to.be.false;
            expect(result(dateTime['date and time']("2012-12-25T00:00:01"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare date with "<"', function(done) {
        var text = '< date("2012-12-24")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.date("2012-12-25"))).to.be.false;
            expect(result(dateTime.date("2012-12-24"))).to.be.false;
            expect(result(dateTime.date("2012-12-23"))).to.be.true;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare date with duration added', function(done) {
      var text = '< date(date("2012-12-24") + duration("P1D"))';
      var parsedGrammar = FEEL.parse(text);
      parsedGrammar.build().then(result => {
        expect(result(dateTime.date("2012-12-26"))).to.be.false;
        expect(result(dateTime.date("2012-12-25"))).to.be.false;
        expect(result(dateTime.date("2012-12-24"))).to.be.true;
        expect(result(dateTime.date("2012-12-23"))).to.be.true;
        done();
      }).catch(err => done(err));
    });

    it('Successfully compare time with "<"', function(done) {
        var text = '< time("T23:59:00Z")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.time("T23:58:59Z"))).to.be.true;
            expect(result(dateTime.time("T23:59:00Z"))).to.be.false;
            expect(result(dateTime.time("T23:59:01Z"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare days and time duration with "<"', function(done) {
        var text = '< duration("P2D")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.duration("P1D"))).to.be.true;
            expect(result(dateTime.duration("P2D"))).to.be.false;
            expect(result(dateTime.duration("P3D"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare years and months duration with "<"', function(done) {
        var text = '< duration("P26M")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.duration("P2Y"))).to.be.true;
            expect(result(dateTime.duration("P3Y"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare date and time with "<="', function(done) {
        var text = '<= date and time("2012-12-25T00:00:00")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime['date and time']("2012-12-24T23:59:59"))).to.be.true;
            expect(result(dateTime['date and time']("2012-12-25T00:00:00"))).to.be.true;
            expect(result(dateTime['date and time']("2012-12-25T00:00:01"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare time successfully with ">" accross time zones', function(done) {
        var text = '> time("T12:59:00+06:30")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.time("T12:59:00+05:30"))).to.be.true;
            expect(result(dateTime.time("T12:59:00+07:30"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

     it('Successfully compare time successfully with ">=" accross time zones', function(done) {
        var text = '>= time("T12:59:00+06:30")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.time("T12:59:00+05:30"))).to.be.true;
            expect(result(dateTime.time("T12:59:00+06:30"))).to.be.true;
            expect(result(dateTime.time("T12:59:00+07:30"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare date successfully with ">"', function(done) {
        var text = '> date("2011-10-09")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.date("2011-10-10"))).to.be.true;
            expect(result(dateTime.date("2011-10-09"))).to.be.false;
            expect(result(dateTime.date("2011-10-08"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully compare date successfully with ">="', function(done) {
        var text = '>= date("2011-10-09")';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime.date("2011-10-10"))).to.be.true;
            expect(result(dateTime.date("2011-10-09"))).to.be.true;
            expect(result(dateTime.date("2011-10-08"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully parse and build equality expression using date with multiple args and date with string arg', function(done) {
        var text = 'date("2012-12-25")';
        var parsedGrammar = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
        parsedGrammar.build().then(result => {
            expect(result(dateTime.date(2012, 11, 25))).to.be.true;
            done();
        }).catch(err => done(err));
    });

    it('Successfully parse and build equality expression using durations', function(done) {
        var text = 'duration("P26M")';
        var parsedGrammar = FEEL.parse(text, { startRule: 'SimpleUnaryTests' });
        parsedGrammar.build().then(result => {
            expect(result(dateTime.duration("P2Y2M"))).to.be.true;
            expect(result(dateTime.duration("P2Y1M"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

    it('Successfully parse and build equality expression using date and time in a "in" comparision expression', function(done) {
        var text = '[date and time("2017-04-12T11:30:00Z")..date and time("2017-04-12T12:45:00Z")]';
        var parsedGrammar = FEEL.parse(text);
        parsedGrammar.build().then(result => {
            expect(result(dateTime['date and time']("2017-04-12T12:45:00Z"))).to.be.true;
            expect(result(dateTime['date and time']("2017-04-12T11:30:00Z"))).to.be.true;
            expect(result(dateTime['date and time']("2017-04-12T11:29:00Z"))).to.be.false;
            expect(result(dateTime['date and time']("2017-04-12T12:46:00Z"))).to.be.false;
            done();
        }).catch(err => done(err));
    });

});

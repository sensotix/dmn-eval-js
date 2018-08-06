/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/

/*
Decision Model and Notation, v1.1
Page : 133
*/

const startsWith = (text, prefix) => {
  let result;
  if (prefix === undefined || text === undefined) {
    result = undefined;
  } else if (prefix === null || text === null) {
    result = null;
  } else {
    result = text.indexOf(prefix) === 0;
  }
  return result;
};

module.exports = { 'starts with': startsWith };

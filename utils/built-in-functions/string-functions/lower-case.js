/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/

/*
Decision Model and Notation, v1.1
Page : 133
*/

const lowerCase = (text) => {
  let result;
  if (text === undefined) {
    result = undefined;
  } else if (text === null) {
    result = null;
  } else {
    result = text.toLowerCase();
  }
  return result;
};

module.exports = { 'lower case': lowerCase };

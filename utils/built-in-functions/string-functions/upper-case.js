/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/

/*
Decision Model and Notation, v1.1
Page : 133
*/

const upperCase = (text) => {
  let result;
  if (text === undefined) {
    result = undefined;
  } else if (text === null) {
    result = null;
  } else {
    result = text.toUpperCase();
  }
  return result;
};

module.exports = { 'upper case': upperCase };

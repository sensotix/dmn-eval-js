/* eslint-disable linebreak-style */
/*
 *
 *  ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 *  Bangalore, India. All Rights Reserved.
 *
 */
const _ = require("lodash");

const { abs, ceil, floor, random } = Math;

const listContains = (list, element) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    if (list.indexOf(element) > -1) {
      return true;
    }
    return false;
  }
};

const count = (list) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    return list.length;
  }
};

// Heuristic to determine if an object is a context or not.
// If so, it will have had the built-in functions added to it.
function isContext(obj) {
  return obj && typeof obj === "object" && "max" in obj && "sublist" in obj;
}

// Remove the context if present as a final argument and
// permit a function to be called with either a list or a variable
// number of arguments.
const aggregateHelper = (aggregatorFunc, itemsOrList) => {
  if (itemsOrList.length === 1) {
    // One item in array, so require it to be an array.
    if (!Array.isArray(itemsOrList[0])) {
      try {
        return aggregatorFunc([itemsOrList[0]]);
      } catch (err) {
        throw new Error("operation unsupported on element of this type");
      }
    } else {
      return aggregatorFunc(itemsOrList[0]);
    }
  } else if (itemsOrList.length === 2 && isContext(itemsOrList[1])) {
    // Two items in array, but the second one is a context, so only aggregate the first.
    try {
      if (!Array.isArray(itemsOrList[0])) {
        return aggregatorFunc([itemsOrList[0]]);
      }
      return aggregatorFunc(itemsOrList[0]);
    } catch (err) {
      throw new Error("operation unsupported on element of this type");
    }
  } else {
    try {
      // remove context from items
      return aggregatorFunc(_.filter(itemsOrList, (item) => !isContext(item)));
    } catch (err) {
      throw new Error("operation unsupported on element of this type");
    }
  }
};

// Permits min(n1, n2, n3, ...) or min(list)
const min = (...itemsOrList) =>
  aggregateHelper((arr) => _.min(arr), itemsOrList);

// Permits max(n1, n2, n3, ...) or max(list)
const max = (...itemsOrList) => {
  return aggregateHelper((arr) => _.max(arr), itemsOrList);
};

// Permits sum(n1, n2, n3, ...) or sum(list)
const sum = (...itemsOrList) => {
  return aggregateHelper((arr) => _.sum(arr), itemsOrList);
};

// Helper function to be used by mean to count the number of values being averaged.
const flatCount = (...itemsOrList) =>
  aggregateHelper((arr) => arr.length, itemsOrList);

// Permits mean(n1, n2, n3, ...) or mean(list)
const mean = (...itemsOrList) => {
  const itemSum = sum(...itemsOrList);
  const itemCount = flatCount(...itemsOrList);
  return itemSum / itemCount;
};

// Permits product(n1, n2, n3, ...) or product(list)
const product = (...itemsOrList) =>
  aggregateHelper(
    (arr) => _.reduce(arr, (product, n) => product * n, 1),
    itemsOrList
  );

// Extract a range of values from a list and form a new list.
//    list ............ List to copy values from to form the sublist.
//    startPosition ... One-based start position for first item to include in result.
//                      If negative, count backwards from the end of the list, with -1 indicating
//                      the last item.
//                      Zero is not permitted.
//    length .......... Optional. If omitted or not a number, assume a length
//                      extending to the last item in the list.
const sublist = (list, startPosition, length) => {
  // Due to the way arguments are passed, there is a hidden final context parameter.
  // Since length is optional, if omitted, it may be assigned the context as value.
  // If so, assume it is a value that will cause the whole rest of the list following startPosition
  // to be returned.
  if (length === 0 || list.length === 0) {
    return [];
  }
  if (startPosition === 0 || abs(startPosition) > list.length) {
    throw new Error("invalid position");
  }
  const zeroBasedPosition =
    startPosition < 0 ? list.length + startPosition : startPosition - 1;
  let lengthToUse = length;
  if (!length || isContext(length)) {
    lengthToUse = list.length - zeroBasedPosition;
  }
  return list.slice(zeroBasedPosition, zeroBasedPosition + lengthToUse);
};

// formerly named "and". Later DMN Feel spec renamed to "all".
const all = (list) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    return list.reduce((recur, next) => recur && next, true);
  }
};

// formerly named "or". Later DMN Feel spec renamed to "any".
const any = (list) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    return list.reduce((recur, next) => recur || next, false);
  }
};

const append = (element, list) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    return list.push(element);
  }
};

const concatenate = (...args) =>
  args.reduce((result, next) => Array.prototype.concat(result, next), []);

const insertBefore = (list, position, newItem) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else if (position > list.length || position < 0) {
    throw new Error("invalid position");
  } else {
    return list.splice(position - 1, 0, newItem);
  }
};

const remove = (list, position) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else if (position > list.length - 1) {
    throw new Error("invalid position");
  } else {
    return list.splice(position, 1);
  }
};

const reverse = (list) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    return _.reverse(list);
  }
};

const indexOf = (list, match) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    return _.indexOf(list, match);
  }
};

const union = (...args) => _.union(args);

const distinctValues = (list) => {
  if (!Array.isArray(list)) {
    throw new Error("operation unsupported on element of this type");
  } else {
    return _.uniq(list);
  }
};

const flatten = (...args) => _.flatten(args);

const round = _.round;

const decimal = _.round;

module.exports = {
  "list contains": listContains,
  count,
  min,
  max,
  sum,
  mean,
  product,
  sublist,
  all,
  any,
  append,
  concatenate,
  "insert before": insertBefore,
  remove,
  reverse,
  "index of": indexOf,
  union,
  "distinct values": distinctValues,
  flatten,
  floor,
  ceil,
  ceiling: ceil,
  round,
  decimal,
  abs,
};

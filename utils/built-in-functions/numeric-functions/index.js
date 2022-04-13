/* eslint-disable linebreak-style */
/*
 *
 *  ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 *  Bangalore, India. All Rights Reserved.
 *
 */
const _ = require('lodash');

const {
  abs, ceil, floor, random,
} = Math;

const listContains = (list, element) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    if (list.indexOf(element) > -1) {
      return true;
    }
    return false;
  }
};

const count = (list) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    return list.length;
  }
};

// Heuristic to determine if an object is a context or not.
// If so, it will have had the built-in functions added to it.
function isContext(obj) {
  return obj && typeof obj === 'object' && 'max' in obj && 'substring' in obj;
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
        throw new Error('operation unsupported on element of this type');
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
      throw new Error('operation unsupported on element of this type');
    }
  } else {
    try {
      if (isContext(itemsOrList[itemsOrList.length - 1])) {
        return aggregatorFunc(itemsOrList.slice(0, itemsOrList.length - 1));
      }
      return aggregatorFunc(itemsOrList);
    } catch (err) {
      throw new Error('operation unsupported on element of this type');
    }
  }
};

// Permits min(n1, n2, n3, ...) or min(list)
const min = (...itemsOrList) => aggregateHelper((arr) => _.min(arr), itemsOrList);

// Permits max(n1, n2, n3, ...) or max(list)
const max = (...itemsOrList) => aggregateHelper((arr) => _.max(arr), itemsOrList);

// Permits sum(n1, n2, n3, ...) or sum(list)
const sum = (...itemsOrList) => aggregateHelper((arr) => _.sum(arr), itemsOrList);

// Helper function to be used by mean to count the number of values being averaged.
const flatCount = (...itemsOrList) => aggregateHelper((arr) => arr.length, itemsOrList);

// Permits mean(n1, n2, n3, ...) or mean(list)
const mean = (...itemsOrList) => {
  const itemSum = sum(...itemsOrList);
  const itemCount = flatCount(...itemsOrList);
  return itemSum / itemCount;
};

// Permits product(n1, n2, n3, ...) or product(list)
const product = (...itemsOrList) => aggregateHelper(
  (arr) => _.reduce(arr, (product, n) => product * n, 1),
  itemsOrList,
);

// Begin Standard Deviation

// Welford algorithm for calculating standard deviation in a single pass algorithm.
// Derived from Python code posted on Wikipedia.

// For a new value newValue, compute the new count, new mean, the new M2.
// mean accumulates the mean of the entire dataset
// M2 aggregates the squared distance from the mean
// count aggregates the number of samples seen so far
function sdUpdate(existingAggregate, newValue) {
  let [count, mean, M2] = existingAggregate;
  count += 1;
  const delta = newValue - mean;
  mean += delta / count;
  const delta2 = newValue - mean;
  M2 += delta * delta2;
  return [count, mean, M2];
}

// Retrieve the mean, variance and sample variance from an aggregate
function sdFinalize(existingAggregate) {
  const [count, mean, M2] = existingAggregate;
  if (count < 2) {
    return null; // Properly a NaN, but we will use null.
  }
  const [variance, sampleVariance] = [M2 / count, M2 / (count - 1)];
  return [mean, variance, sampleVariance];
}

function sdCalc(numbers) {
  try {
    let aggregate = [0, 0, 0];
    for (let i = 0; i < numbers.length; i += 1) {
      aggregate = sdUpdate(aggregate, numbers[i]);
    }
    const variance = sdFinalize(aggregate)[1];
    return Math.sqrt(variance);
  } catch (err) {
    throw new Error('operation unsupported on element of this type');
  }
}

// Permits product(n1, n2, n3, ...) or product(list)
const stddev = (...itemsOrList) => aggregateHelper((arr) => sdCalc(arr), itemsOrList);

// End Standard Deviation

// Begin median

/*
  To compute the median, use quickselect for selection
  and the median of medians algorithm for pivot selection,
  provably linear in performance in worst case.
*/

// Quickselect partition by pivot
function partition(dataArr, left, right, pivot) {
  const arr = dataArr;
  let temp = arr[pivot];
  arr[pivot] = arr[right];
  arr[right] = temp;
  let track = left;
  for (let i = left; i < right; i += 1) {
    if (arr[i] < arr[right]) {
      const t = arr[i];
      arr[i] = arr[track];
      arr[track] = t;
      track += 1;
    }
  }
  temp = arr[track];
  arr[track] = arr[right];
  arr[right] = temp;
  return track;
}

let medianOfMedians; // Forward reference to silence linter

// Quickselect on a subrange of the array
function selectIdx(arr, leftIdx, rightIdx, k) {
  let left = leftIdx;
  let right = rightIdx;
  if (left === right) {
    return left;
  }
  const dest = left + k;
  let searching = true;
  let pivotIndex = -1;
  while (searching) {
    pivotIndex = right - left + 1 <= 5
      ? Math.floor(random() * (right - left + 1)) + left
      : medianOfMedians(arr, left, right);
    pivotIndex = partition(arr, left, right, pivotIndex);
    if (pivotIndex === dest) {
      searching = false;
    } else if (pivotIndex < dest) {
      left = pivotIndex + 1;
    } else {
      right = pivotIndex - 1;
    }
  }
  return pivotIndex;
}

// Use median of medians to find an efficient pivot for quickselect.
// This improves the worst case for quickselect from quadratic to linear.
medianOfMedians = (dataArr, left, right) => {
  const arr = dataArr;
  const numMedians = ceil((right - left) / 5);
  for (let i = 0; i < numMedians; i += 1) {
    const subLeft = left + i * 5;
    let subRight = subLeft + 4;
    if (subRight > right) {
      subRight = right;
    }
    const medianIdx = selectIdx(
      arr,
      subLeft,
      subRight,
      floor((subRight - subLeft) / 2),
    );
    const temp = arr[medianIdx];
    arr[medianIdx] = arr[left + i];
    arr[left + i] = temp;
  }
  return selectIdx(arr, left, left + numMedians - 1, floor(numMedians / 2));
};

// Select the kth smallest number in arr, zero-based.
// To get the lowest value:  selectK(arr, 0).
// To get the highest value: selectK(arr, arr.length - 1)
function selectK(arr, k) {
  if (!Array.isArray(arr) || arr.length === 0 || arr.length - 1 < k) {
    return null;
  }
  const idx = selectIdx(arr, 0, arr.length - 1, k);
  return arr[idx];
}

// Select the median value using quickselect.
// For an array with an even number of elements, the median
// is the mean of the two center elements.
// The input array is not altered.
function medianSelect(arr) {
  try {
    const { length } = arr;
    switch (length) {
      case 0:
        return null;
      case 1:
        return arr[0];
      case 2:
        return (arr[0] + arr[1]) / 2.0;
      default:
        break;
    }
    // selectK modifies array, so make a copy first.
    const arrCopy = [...arr];
    const middleIndex = floor((length - 1) / 2);
    const middleValue = selectK(arrCopy, middleIndex);
    if (length % 2 === 1) {
      return middleValue;
    }
    // Even number of values in arr.
    // We need to get the next highest number and average it with middleValue.
    // We could do a second quickselect, but there is a faster way that is single pass,
    // no swapping values around.
    let lesser = 0;
    let equal = 0;
    let nextHighest = Number.MAX_VALUE;
    for (let i = 0; i < length; i += 1) {
      const n = arrCopy[i];
      if (n < middleValue) {
        lesser += 1;
      } else if (n === middleValue) {
        equal += 1;
      } else if (n < nextHighest) {
        nextHighest = n;
      }
    }
    if (lesser + equal === middleIndex + 1) {
      return (middleValue + nextHighest) / 2;
    }
    // There are multiple items in the array whose value matches middleValue, no need to average.
    return middleValue;
  } catch (err) {
    throw new Error('operation unsupported on element of this type');
  }
}

// Permits median(n1, n2, n3, ...) or median(list)
const median = (...itemsOrList) => aggregateHelper((arr) => medianSelect(arr), itemsOrList);

// End median

const modeSelect = (a) => {
  let maxCount = 0;
  const counts = Object.values(
    a.reduce((ct, e) => {
      const count = ct;
      if (!(e in count)) {
        count[e] = [0, e];
      }
      if (count[e][0] === maxCount) {
        maxCount += 1;
      }
      count[e][0] += 1;
      return count;
    }, {}),
  );
  const modes = [];
  for (let i = 0; i < counts.length; i += 1) {
    const count = counts[i];
    if (count[0] === maxCount) {
      modes.push(count[1]);
    }
  }
  modes.sort();
  return modes;
};

// Permits mode(n1, n2, n3, ...) or mode(list)
// As per the DMN 1.2 spec, section 10.3.3.4, this returns a list containing the mode,
// not the mode itself. If multiple numbers are tied with the same count, all will
// be returned in the resulting list.
const mode = (...itemsOrList) => aggregateHelper((arr) => modeSelect(arr), itemsOrList);

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
    throw new Error('invalid position');
  }
  const zeroBasedPosition = startPosition < 0 ? list.length + startPosition : startPosition - 1;
  let lengthToUse = length;
  if (!length || isContext(length)) {
    lengthToUse = list.length - zeroBasedPosition;
  }
  return list.slice(zeroBasedPosition, zeroBasedPosition + lengthToUse);
};

// formerly named "and". Later DMN Feel spec renamed to "all".
const all = (list) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    return list.reduce((recur, next) => recur && next, true);
  }
};

// formerly named "or". Later DMN Feel spec renamed to "any".
const any = (list) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    return list.reduce((recur, next) => recur || next, false);
  }
};

const append = (element, list) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    return list.push(element);
  }
};

const concatenate = (...args) => args.reduce((result, next) => Array.prototype.concat(result, next), []);

const insertBefore = (list, position, newItem) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else if (position > list.length || position < 0) {
    throw new Error('invalid position');
  } else {
    return list.splice(position - 1, 0, newItem);
  }
};

const remove = (list, position) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else if (position > list.length - 1) {
    throw new Error('invalid position');
  } else {
    return list.splice(position, 1);
  }
};

const reverse = (list) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    return _.reverse(list);
  }
};

const indexOf = (list, match) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    return _.indexOf(list, match);
  }
};

const union = (...args) => _.union(args);

const distinctValues = (list) => {
  if (!Array.isArray(list)) {
    throw new Error('operation unsupported on element of this type');
  } else {
    return _.uniq(list);
  }
};

const flatten = (...args) => _.flatten(args);

module.exports = {
  'list contains': listContains,
  count,
  min,
  max,
  sum,
  mean,
  product,
  stddev,
  median,
  mode,
  sublist,
  all,
  any,
  append,
  concatenate,
  'insert before': insertBefore,
  remove,
  reverse,
  'index of': indexOf,
  union,
  'distinct values': distinctValues,
  flatten,
};

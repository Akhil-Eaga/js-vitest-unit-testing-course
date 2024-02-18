import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import {
  Stack,
  calculateDiscount,
  canDrive,
  fetchData,
  getCoupons,
  isPriceInRange,
  isValidUsername,
  validateUserInput,
} from '../src/core';
import { max } from '../src/intro';

describe('getCoupons', () => {
  test('should return an array of coupons', () => {
    const coupons = getCoupons();
    expect(Array.isArray(coupons)).toBe(true);
    expect(getCoupons().length).toBeGreaterThan(0);
  });

  test('should return an array with valid coupon codes', () => {
    const coupons = getCoupons();
    coupons.forEach((coupon) => {
      expect(coupon).toHaveProperty('code');
      expect(typeof coupon.code).toBe('string');
      expect(coupon.code).toBeTruthy(); // checking for non empty strings
    });
  });

  test('should return an array with valid discounts', () => {
    const coupons = getCoupons();
    coupons.forEach((coupon) => {
      expect(coupon).toHaveProperty('discount');
      expect(typeof coupon.discount).toBe('number');
      expect(coupon.discount).toBeGreaterThan(0);
      expect(coupon.discount).toBeLessThan(1);
    });
  });
});

describe('calculateDiscount', () => {
  test('should return discounted price if given valid code', () => {
    expect(calculateDiscount(10, 'SAVE10')).toBe(9);
    expect(calculateDiscount(10, 'SAVE20')).toBe(8);
  });

  test('should handle non-numeri price', () => {
    expect(calculateDiscount('10', 'SAVE10')).toMatch(/invalid/i);
  });

  test('should handle negative price', () => {
    expect(calculateDiscount(-10, 'SAVE10')).toMatch(/invalid/i);
  });

  test('should handle non-string discount code', () => {
    expect(calculateDiscount(10, 10)).toMatch(/invalid/i);
  });

  test('should handle invalid discount codes', () => {
    expect(calculateDiscount(10, 'INVALID')).toBe(10);
  });
});

describe('validateUserInput', () => {
  test('should return success if given valid input', () => {
    expect(validateUserInput('mosh', 42)).toMatch(/success/i);
  });

  test('should return an error if username is not a string', () => {
    expect(validateUserInput(10, 25)).toMatch(/invalid/i);
  });

  test('should return an error if username is less than 3 chars', () => {
    expect(validateUserInput('A', 25)).toMatch(/invalid/i);
  });

  test('should return an error if username is longer than 255 chars', () => {
    expect(validateUserInput('A'.repeat(256), 42)).toMatch(/invalid/i);
  });

  test('should return an error if age is not a number', () => {
    expect(validateUserInput('mosh', '42')).toMatch(/invalid/i);
  });

  test('should return an error if age is less than 18', () => {
    expect(validateUserInput('mosh', 17)).toMatch(/invalid/i);
  });

  test('should return an error message if age is greater than 100', () => {
    expect(validateUserInput('mosh', 101)).toMatch(/invalid/i);
  });

  test('should return an error message if both username and age are invalid', () => {
    const result = validateUserInput('', 0);

    expect(result).toMatch(/invalid username/i);
    expect(result).toMatch(/invalid age/i);
  });
});

describe('isPriceInRange', () => {
  test.each([
    { scenario: 'price < min', price: -10, result: false },
    { scenario: 'price = min', price: 0, result: true },
    { scenario: 'price between min and max', price: 50, result: true },
    { scenario: 'price = max', price: 100, result: true },
    { scenario: 'price > max', price: 200, result: false },
  ])('should return $result when $scenario', ({ price, result }) => {
    expect(isPriceInRange(price, 0, 100)).toBe(result);
  });
});

describe('isValidUsername', () => {
  const minLength = 5;
  const maxLength = 15;

  test('should return false if username is too short', () => {
    expect(isValidUsername('A'.repeat(minLength - 1))).toBe(false);
  });

  test('should return false if username is too long', () => {
    expect(isValidUsername('A'.repeat(maxLength + 1))).toBe(false);
  });

  test('should return true if username is at the min or max length', () => {
    expect(isValidUsername('A'.repeat(minLength))).toBe(true);
    expect(isValidUsername('A'.repeat(maxLength))).toBe(true);
  });

  test('should return true if username is within the length constraints', () => {
    expect(isValidUsername('A'.repeat(minLength + 1))).toBe(true);
    expect(isValidUsername('A'.repeat(maxLength - 1))).toBe(true);
  });

  test('should return false for invlid input types', () => {
    expect(isValidUsername(undefined)).toBe(false);
    expect(isValidUsername(null)).toBe(false);
    expect(isValidUsername(1)).toBe(false);
  });
});

describe('canDrive', () => {
  test('should return an error for invalid country code', () => {
    expect(canDrive(17, 'FR')).toMatch(/invalid/i);
  });

  test('should return a boolean if country code is valid', () => {
    expect(typeof canDrive(10, 'US')).toBe('boolean');
    expect(typeof canDrive(10, 'UK')).toBe('boolean');
  });

  test.each([
    { age: 15, country: 'US', result: false },
    { age: 16, country: 'US', result: true },
    { age: 17, country: 'US', result: true },
    { age: 16, country: 'UK', result: false },
    { age: 17, country: 'UK', result: true },
    { age: 18, country: 'UK', result: true },
  ])('should return $result for $age, $country', ({ age, country, result }) => {
    expect(canDrive(age, country)).toBe(result);
  });
});

describe('fetchData', () => {
  test('should return a promise that resolves to an array of numbers', () => {
    fetchData().then((result) => {
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  test('should return a promise that resolves to an array of numbers (async await)', async () => {
    const result = await fetchData();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('should return a promise that rejects to throw an error message', async () => {
    try {
      const result = await fetchData(true);
    } catch (error) {
      expect(error).toHaveProperty('reason');
      expect(error.reason).toMatch(/failed/i);
    }
  });
});

describe('test suite for setup and teardown', () => {
  beforeAll(() => {
    console.log('beforeAll is called');
  });

  beforeEach(() => {
    console.log('beforeEach is called');
  });

  afterEach(() => {
    console.log('afterEach is called');
  });

  afterAll(() => {
    console.log('afterAll is called');
  });

  test('test case 1', () => {});
  test('test case 2', () => {});
});

describe('stack', () => {
  let stack;

  beforeEach(() => {
    stack = new Stack();
  });

  test('push should add an item to the stack', () => {
    stack.push(1);

    expect(stack.size()).toBe(1);
  });

  test('pop should remove and return the top item from the stack', () => {
    stack.push(1);
    stack.push(2);

    const poppedItem = stack.pop();

    expect(poppedItem).toBe(2);
    expect(stack.size()).toBe(1);
  });

  test('pop should throw an error if stack is empty', () => {
    // to test code that throws an error wrap the error throwing code in a callback function and pass it to the expect
    // this way vitest can catch the error throw and can run assertions on it
    expect(() => stack.pop()).toThrow(/empty/i);
  });

  test('peek should return the top item from the stack without removing it', () => {
    stack.push(1);
    stack.push(2);

    expect(stack.peek()).toBe(2);
    expect(stack.size()).toBe(2);
  });

  test('peek should throw an error if the stack is empty', () => {
    expect(() => stack.peek()).toThrow(/empty/i);
  });

  test('isEmpty should return true if stack is empty', () => {
    expect(stack.isEmpty()).toBe(true);
  });

  test('isEmpty should return false if stack is not empty', () => {
    stack.push(1);

    expect(stack.isEmpty()).toBe(false);
  });

  test('size should return the number of items in the stack', () => {
    stack.push(1);
    stack.push(2);

    expect(stack.size()).toBe(2);
  });

  test('clear should remove all items from the stack', () => {
    stack.push(1);
    stack.push(2);

    stack.clear();

    expect(stack.size()).toBe(0);
  });
});

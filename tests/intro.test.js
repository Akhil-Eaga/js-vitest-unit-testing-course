import { describe, test, it, expect } from "vitest";
import { calculateAverage, factorial, fizzBuzz, max } from "../src/intro";

describe("max", () => {
    it('should return the first argument if it is greater', () => {
        expect(max(2, 1)).toBe(2);
    });

    it('should return the second argument if it is greater', () => {
        expect(max(1, 2)).toBe(2);
    });

    it('should return the first argument if arguments are equal', () => {
        expect(max(1, 1)).toBe(1);
    })
});

describe('fizzBuzz', () => {
    it('should return "FizzBuzz" if argument is divisible by 3 and 5', () => {
        expect(fizzBuzz(15)).toBe('FizzBuzz');
    });

    it('should return "Fizz" if argument is only divisible by 3', () => {
        expect(fizzBuzz(9)).toBe('Fizz');
    });

    it('should return "Buzz" if argument is only divisible by 5', () => {
        expect(fizzBuzz(10)).toBe('Buzz');
    });

    it('should return the argument as a string if not divisible by 3 or 5', () => {
        expect(fizzBuzz(7)).toBe('7');
    });
});

describe('calculateAverage', () =>{
    it('should return NaN if given an empty array', () => {
        expect(calculateAverage([])).toBe(NaN);
    });

    it('should calculate the average of an array with a single element', () => {
        expect(calculateAverage([1])).toBe(1);
    });

    it('should calculate the averge of an array with two element', () => {
        expect(calculateAverage([1, 2])).toBe(1.5);
    });

    it('should calculate the averge of an arry with three elements', () => {
        expect(calculateAverage([1, 2, 3])).toBe(2);
    });
});

describe('factorial', () =>{
    it('should return 1 if argument is 0', () => {
        expect(factorial(0)).toBe(1);
    });

    it('should return 1 if argument is 1', () => {
        expect(factorial(1)).toBe(1);
    });

    it('should return 2 if argument is 2', () => {
        expect(factorial(2)).toBe(2);
    });

    it('should return 6 if arugment is 3', () => {
        expect(factorial(3)).toBe(6);
    });

    it('should return 24 if argument is 4',  () => {
        expect(factorial(4)).toBe(24);
    });

    it('should return undefined if argument is a negative number', () => {
        expect(factorial(-1)).toBeUndefined();
    })
});

describe('test matchers',() => {
    test("should use the toEqual matcher", () => {
        const result = { name: "Mosh" };
        // toBe matcher is useful for asserting primitive data types
        // toEqual matcher is useful for asserting non primitive data types
        expect(result).toEqual({ name: "Mosh" });
    })
})
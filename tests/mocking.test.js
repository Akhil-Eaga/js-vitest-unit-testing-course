import { afterEach, describe, expect, test, vi } from 'vitest';
import {
    getDiscount,
    getPriceInCurrency,
    getShippingInfo,
    isOnline,
    login,
    renderPage,
    signUp,
    submitOrder,
} from '../src/mocking';
import { getExchangeRate } from '../src/libs/currency';
import { getShippingQuote } from '../src/libs/shipping';
import { trackPageView } from '../src/libs/analytics';
import { charge } from '../src/libs/payment';
import { sendEmail } from '../src/libs/email';
import security from '../src/libs/security';

// when this line is executed, vi test mocks all the exported functions in the currency.js module
// when mocking an entire module like this, vitest first mocks all the exported functions in the module and then runs
// the import statements on that mocked modules
// so it is as if the vi.mock(....) line is at the top of this file
// this behaviour is an example of 'Hoisting' in JS

vi.mock('../src/libs/currency');
vi.mock('../src/libs/shipping');
vi.mock('../src/libs/analytics');
vi.mock('../src/libs/payment');

// partial mocking the email module
vi.mock('../src/libs/email', async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
        ...originalModule, // just returning the original functions without mocking them
        sendEmail: vi.fn(), // returning a mock for the sendEmail function to achieve partial mocking
    };
});

describe('test suite', () => {
    test('test case', () => {
        const greet = vi.fn();
        // mockReturnValue sets the return value for the mock
        // greet.mockReturnValue('hello');
        // console.log(greet())

        // mockResolvedValue returns a promise that resolves to the value that was set
        // greet.mockResolvedValue('hello');
        // greet().then(result => console.log(result));

        // mockImplementation takes in an arrow function that is used to mock the implementation of the actual fn
        greet.mockImplementation((name) => 'Hello ' + name);
        greet('Mosh');

        expect(greet).toHaveBeenCalled();
        expect(greet).toHaveBeenCalledOnce();
        expect(greet).toHaveBeenCalledWith('Mosh');

        greet();

        expect(greet).toHaveBeenCalledTimes(2);
    });
});

describe('sendText', () => {
    test('should return "ok" when sendText is invoked', () => {
        const sendText = vi.fn();
        sendText.mockReturnValue('ok');

        const result = sendText('message');

        expect(sendText).toHaveBeenCalledWith('message');
        expect(result).toBe('ok');
    });
});

describe('getPriceInCurrency', () => {
    test('should return price in target currency', () => {
        vi.mocked(getExchangeRate).mockReturnValue(1.5);

        const price = getPriceInCurrency(10, 'AUD');

        expect(price).toBe(15);
        expect(vi.mocked(getExchangeRate)).toHaveBeenCalledWith('USD', 'AUD');
    });
});

describe('getShippingInfo', () => {
    test('should throw an error message when quote cannot be fetched', () => {
        vi.mocked(getShippingQuote).mockReturnValue(null);
        const result = getShippingInfo('FR');

        expect(result).toMatch(/unavailable/i);
        expect(vi.mocked(getShippingQuote)).toHaveBeenCalledWith('FR');
    });

    test('should return shipping info when a valid quote can be fetched', () => {
        vi.mocked(getShippingQuote).mockReturnValue({
            cost: 10,
            estimatedDays: 2,
        });
        const result = getShippingInfo('FR');

        expect(result).toMatch('$10');
        expect(result).toMatch(/2 days/i);
        // '$', '(' and ')' have special meaning in the context of regex so they need to be escaped to use the literals
        expect(result).toMatch(/shipping cost: \$10 \(2 days\)/i);
        expect(vi.mocked(getShippingQuote)).toHaveBeenCalledWith('FR');
    });
});

describe('renderPage', () => {
    test('should return correct content', async () => {
        const result = await renderPage();
        expect(result).toMatch(/content/i);
    });

    test('should call analytics', async () => {
        await renderPage();
        expect(trackPageView).toHaveBeenCalledWith('/home');
    });
});

describe('submitOrder', () => {
    const order = { totalAmount: 100 };
    const creditCard = { creditCardNumber: '1234 1234 1234 1234' };

    test('should charge the customer', async () => {
        vi.mocked(charge).mockResolvedValue({ status: 'failed' });

        await submitOrder(order, creditCard);

        expect(charge).toHaveBeenCalledWith(creditCard, order.totalAmount);
    });

    test('should return success when payment is successful', async () => {
        vi.mocked(charge).mockResolvedValue({ status: 'success' });

        const result = await submitOrder(order, creditCard);

        expect(result).toEqual({ success: true });
    });

    test('should handle failed payment', async () => {
        vi.mocked(charge).mockResolvedValue({ status: 'failed' });

        const result = await submitOrder(order, creditCard);

        expect(result).toEqual({ success: false, error: 'payment_error' });
    });
});

describe('signUp', () => {
    const email = 'name@domain.com';

    // NOTE: Instead of remembering to clear mocks in each test suite,
    // we can configure vitest to clear all mocks after each test using its config file
    // afterEach(() => {
    //     vi.mocked(sendEmail).mockClear();

    //     // if multiple mocks are used and they all need to be cleared at once in this hook, then
    //     vi.clearAllMocks();
    // })

    test('should return false if email is invalid', async () => {
        const result = await signUp('a');
        expect(result).toBe(false);
    });

    test('should return true if email is valid', async () => {
        const result = await signUp(email);
        expect(result).toBe(true);
    });

    test('should send the welcome email if email is valid', async () => {
        const result = await signUp(email);

        expect(sendEmail).toHaveBeenCalledOnce();
        // mock object is global and collects info from all test cases
        const args = vi.mocked(sendEmail).mock.calls[0];
        expect(args[0]).toBe(email);
        expect(args[1]).toMatch(/welcome/i);
    });
});

describe('login', () => {
    test('should email the one-time login code', async () => {
        const email = 'name@domain.com';
        const spy = vi.spyOn(security, 'generateCode');

        await login(email);

        const securityCode = spy.mock.results[0].value.toString();
        expect(sendEmail).toHaveBeenCalledWith(email, securityCode);
    });
});

describe('isOnline', () => {
    test('should return false if the current hour is outside the opening hours', () => {
        vi.setSystemTime('2024-01-02 07:59');
        expect(isOnline()).toBe(false);

        vi.setSystemTime('2024-01-02 20:01');
        expect(isOnline()).toBe(false);
    });

    test('should return true if the current hour is within opening hours', () => {
        vi.setSystemTime('2024-01-01 08:00');
        expect(isOnline()).toBe(true);

        vi.setSystemTime('2024-01-01 19:59');
        expect(isOnline()).toBe(true);
    });
});

describe('getDiscount', () => {
    test('should return 0.2 on Christmas day', () => {
        vi.setSystemTime('2023-12-25 00:01');
        expect(getDiscount()).toBe(0.2);

        vi.setSystemTime('2023-12-25 23:59');
        expect(getDiscount()).toBe(0.2);
    });

    test('should retur 0 on any other day', () => {
        vi.setSystemTime('2023-12-24 23:59');
        expect(getDiscount()).toBe(0);

        vi.setSystemTime('2023-12-26 00:01');
        expect(getDiscount()).toBe(0);
    });
});

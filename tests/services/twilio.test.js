
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mock from 'mock-require';

// Define mocks
const mockCreate = vi.fn();
const mockClient = {
    messages: {
        create: mockCreate
    }
};
const mockTwilioConstructor = vi.fn(() => mockClient);

// Register mock
mock('twilio', mockTwilioConstructor);

// Require the service (this will use the mock)
// Note: We need to use require() here, not import
const twilioService = require('../../twilio');

describe('twilio.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TWILIO_SID = 'AC123';
        process.env.TWILIO_TOKEN = 'token';
        process.env.TWILIO_NUMBER = '1234567890';
        mockCreate.mockResolvedValue({ accountSid: 'AC123' });
    });

    afterEach(() => {
        // Optional: verify mock was called
    });

    it('should send SMS without media', async () => {
        const result = await twilioService.sendSMS('test message', '0987654321');

        expect(mockCreate).toHaveBeenCalledWith({
            body: 'test message',
            to: '0987654321',
            from: '1234567890',
        });
        expect(result).toEqual({ accountSid: 'AC123' });
    });

    it('should send SMS with media', async () => {
        const mediaUrl = 'http://example.com/image.jpg';
        await twilioService.sendSMS('test message', '0987654321', mediaUrl);

        expect(mockCreate).toHaveBeenCalledWith({
            body: 'test message',
            to: '0987654321',
            from: '1234567890',
            mediaUrl: [mediaUrl],
        });
    });

    it('should propagate errors', async () => {
        const error = new Error('Twilio Error');
        mockCreate.mockRejectedValue(error);

        await expect(twilioService.sendSMS('msg', '123')).rejects.toThrow('Twilio Error');
    });
});

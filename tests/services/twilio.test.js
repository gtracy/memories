import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const twilioService = require('../../twilio');

describe('twilio.js', () => {
    let mockClient;
    let mockCreate;
    let mockGetClient;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCreate = vi.fn().mockResolvedValue({ accountSid: 'AC123' });
        mockClient = {
            messages: {
                create: mockCreate
            }
        };
        mockGetClient = vi.fn(() => mockClient);

        process.env.TWILIO_SID = 'AC123';
        process.env.TWILIO_TOKEN = 'token';
        process.env.TWILIO_NUMBER = '1234567890';
    });

    it('should send SMS without media', async () => {
        const result = await twilioService.sendSMS('test message', '0987654321', undefined, mockGetClient);

        expect(mockGetClient).toHaveBeenCalledWith('AC123', 'token');
        expect(mockCreate).toHaveBeenCalledWith({
            body: 'test message',
            to: '0987654321',
            from: '1234567890',
        });
        expect(result).toEqual({ accountSid: 'AC123' });
    });

    it('should send SMS with media', async () => {
        const mediaUrl = 'http://example.com/image.jpg';
        await twilioService.sendSMS('test message', '0987654321', mediaUrl, mockGetClient);

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

        await expect(twilioService.sendSMS('msg', '123', undefined, mockGetClient)).rejects.toThrow('Twilio Error');
    });
});

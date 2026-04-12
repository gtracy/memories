
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const app = require('../app');

const originalEnv = process.env;

describe('app.js', () => {
    let mockGoogleInit;
    let mockGetSheetData;
    let mockSendSMS;
    let mockCreatePresignedUrl;
    let mockGoogleClass;
    let mockTwilio;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.GOOGLE_SHEET_ID = 'sheet-id';
        process.env.GOOGLE_SHEET_RANGE = 'range';
        process.env.RECIPIENT_PHONE = '1234567890';

        mockGoogleInit = vi.fn().mockResolvedValue(true);
        mockGetSheetData = vi.fn();
        mockSendSMS = vi.fn().mockResolvedValue({ accountSid: 'AC123' });
        mockCreatePresignedUrl = vi.fn().mockResolvedValue('signed-url');

        mockGoogleClass = vi.fn(function () {
            return {
                init: mockGoogleInit,
                getSheetData: mockGetSheetData
            };
        });

        mockTwilio = {
            sendSMS: mockSendSMS
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should fetch data, filtering for today matches', async () => {
        const today = new Date();
        const matchDate = new Date(today);
        matchDate.setFullYear(today.getFullYear() - 2);
        
        const testData = [
            ['Timestamp'], // Header
            [matchDate.toISOString()],
            [new Date(today.getTime() + 86400000).toISOString()] // Tomorrow
        ];

        mockGetSheetData
            .mockResolvedValueOnce(testData)
            .mockResolvedValueOnce([[matchDate.toISOString(), 'Test Message', 'http://s3.url/image.jpg']]);

        await app.handler(undefined, {}, {}, {
            googleClass: mockGoogleClass,
            twilio: mockTwilio,
            s3: mockCreatePresignedUrl
        });

        expect(mockGetSheetData).toHaveBeenCalledTimes(2);
        expect(mockCreatePresignedUrl).toHaveBeenCalledWith('image.jpg');
        expect(mockSendSMS).toHaveBeenCalled();
    });

    it('should handle specific row argument', async () => {
        const messageData = [['2024-01-01', 'Specific Message']];
        mockGetSheetData.mockResolvedValue(messageData);

        await app.handler(99, {}, {}, {
            googleClass: mockGoogleClass,
            twilio: mockTwilio,
            s3: mockCreatePresignedUrl
        });

        expect(mockGetSheetData).toHaveBeenCalledWith(
            'sheet-id',
            expect.stringContaining('!A99:C99')
        );
    });

    it('should handle errors in getSheetData gracefully', async () => {
        mockGetSheetData.mockRejectedValue(new Error('Sheet Error'));
        
        await expect(app.handler(undefined, {}, {}, {
            googleClass: mockGoogleClass,
            twilio: mockTwilio,
            s3: mockCreatePresignedUrl
        })).resolves.not.toThrow();
        
        expect(mockSendSMS).not.toHaveBeenCalled();
    });
});

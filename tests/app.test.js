
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mock from 'mock-require';
import path from 'path';

// Mock services
const mockGoogleInit = vi.fn();
const mockGetSheetData = vi.fn();
const mockSendSMS = vi.fn();
const mockCreatePresignedUrl = vi.fn();

// Mock implementations
// Fix: Use standard function for constructor
const mockGoogleClass = vi.fn(function () {
    return {
        init: mockGoogleInit,
        getSheetData: mockGetSheetData
    };
});

const mockTwilioService = {
    sendSMS: mockSendSMS
};

// Use require.resolve for absolute paths to ensure mock-require matches them
mock('dotenv-json', () => { });
mock(require.resolve('../google'), mockGoogleClass);
mock(require.resolve('../twilio'), mockTwilioService);
mock(require.resolve('../s3'), mockCreatePresignedUrl);

// Require app
const app = require('../app');

const originalEnv = process.env;

describe('app.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.GOOGLE_SHEET_ID = 'sheet-id';
        process.env.GOOGLE_SHEET_RANGE = 'range';
        process.env.RECIPIENT_PHONE = '1234567890';

        // Defaults
        mockGoogleInit.mockResolvedValue(true);
        mockSendSMS.mockResolvedValue({ accountSid: 'AC123' });
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should fetch data, filtering for today matches', async () => {
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setFullYear(today.getFullYear() - 1);

        const otherDate = new Date(today);
        otherDate.setDate(today.getDate() + 1);

        const dateData = [
            [pastDate.toISOString()],
            [otherDate.toISOString()]
        ];
        // Index 0 matches -> Row 2

        const messageData = [
            ['2024-01-01', 'Test Message', 'http://s3.url/image.jpg']
        ];

        mockGetSheetData
            .mockResolvedValueOnce(dateData)
            .mockResolvedValueOnce(messageData);

        mockCreatePresignedUrl.mockResolvedValue('signed-url');

        await app.handler();

        expect(mockGetSheetData).toHaveBeenCalledTimes(2);

        // Verify we fetched specifically based on row index from queryDates
        expect(mockGetSheetData).toHaveBeenLastCalledWith(
            'sheet-id',
            expect.stringContaining('!A2:C2')
        );

        expect(mockCreatePresignedUrl).toHaveBeenCalledWith('image.jpg');

        expect(mockSendSMS).toHaveBeenCalledWith(
            expect.stringContaining('Test Message'),
            '1234567890',
            'signed-url'
        );
    });

    it('should handle specific row argument', async () => {
        const messageData = [
            ['2024-01-01', 'Specific Message']
        ];
        // First call: fetches all data (ignored when specific row is passed, but still called)
        mockGetSheetData.mockResolvedValueOnce([]);
        // Second call: fetches the specific row
        mockGetSheetData.mockResolvedValueOnce(messageData);

        await app.handler(99);

        expect(mockGetSheetData).toHaveBeenCalledWith(
            'sheet-id',
            expect.stringContaining('!A99:C99')
        );
        expect(mockSendSMS).toHaveBeenCalledWith(
            expect.stringContaining('Specific Message'),
            '1234567890',
            undefined
        );
    });
});

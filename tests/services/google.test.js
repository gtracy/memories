
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mock from 'mock-require';

// Mocks
const mockGet = vi.fn();
const mockGetClient = vi.fn();
const mockAuthClient = {
    getClient: mockGetClient
};
const mockSheets = {
    spreadsheets: {
        values: {
            get: mockGet
        }
    }
};

const mockGoogleApis = {
    google: {
        auth: {
            // Fix: Use standard function for constructor
            GoogleAuth: vi.fn(function () { return mockAuthClient; })
        },
        sheets: vi.fn(() => mockSheets)
    }
};

mock('googleapis', mockGoogleApis);
mock('dotenv-json', () => { }); // Mock dotenv-json

const Google = require('../../google');

describe('google.js', () => {
    let googleService;

    beforeEach(() => {
        vi.clearAllMocks();
        googleService = new Google();
    });

    afterEach(() => {
        // mock.stopAll(); 
    });

    it('should initialize auth client', async () => {
        mockGetClient.mockResolvedValue('client');
        await googleService.init();
        expect(mockGetClient).toHaveBeenCalled();
    });

    it('should fetch sheet data', async () => {
        const mockData = [['row1'], ['row2']];
        mockGet.mockResolvedValue({
            data: {
                values: mockData
            }
        });

        await googleService.init();
        const result = await googleService.getSheetData('sheet-id', 'range');

        expect(mockGet).toHaveBeenCalledWith({
            spreadsheetId: 'sheet-id',
            range: 'range'
        });
        expect(result).toBe(mockData);
    });

    it('should handle errors', async () => {
        mockGet.mockRejectedValue(new Error('Google Error'));
        await googleService.init();
        await expect(googleService.getSheetData('id', 'range')).rejects.toThrow('Google Error');
    });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const Google = require('../../google');

describe('google.js', () => {
    let googleService;
    let mockSheets;
    let mockAuthClient;
    let mockGet;
    let mockGoogle;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockAuthClient = {
            getClient: vi.fn().mockResolvedValue({})
        };
        mockSheets = {
            spreadsheets: {
                values: {
                    get: vi.fn()
                }
            }
        };
        mockGet = mockSheets.spreadsheets.values.get;
        
        mockGoogle = {
            auth: {
                GoogleAuth: vi.fn(function() { return mockAuthClient; })
            },
            sheets: vi.fn(() => mockSheets)
        };
        
        googleService = new Google(mockGoogle);
    });

    afterEach(() => {
        // mock.stopAll(); 
    });

    it('should initialize auth client', async () => {
        const mockClient = 'client';
        mockAuthClient.getClient.mockResolvedValue(mockClient);
        await googleService.init();
        expect(mockAuthClient.getClient).toHaveBeenCalled();
        expect(googleService.oauth2Client).toBe(mockClient);
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

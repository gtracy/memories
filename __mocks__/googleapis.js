
const mockGet = vi.fn();
const mockGetClient = vi.fn();

const mockOAuth2Client = {
    // any methods used by client
};

const mockSheets = {
    spreadsheets: {
        values: {
            get: mockGet
        }
    }
};

const google = {
    auth: {
        GoogleAuth: vi.fn(() => ({
            getClient: mockGetClient
        })),
    },
    sheets: vi.fn(() => mockSheets)
};

module.exports = {
    google,
    _mockGet: mockGet,
    _mockGetClient: mockGetClient
};

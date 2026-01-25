
const mockCreate = vi.fn().mockResolvedValue({ accountSid: 'MOCK_ACC_SID' });
const mockClient = {
    messages: {
        create: mockCreate
    }
};

const twilio = vi.fn(() => mockClient);
twilio.mockClient = mockClient;
twilio.mockCreate = mockCreate;

module.exports = twilio;

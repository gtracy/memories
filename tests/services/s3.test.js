
import { describe, it, expect, vi, beforeEach } from 'vitest';
import mock from 'mock-require';

// Mocks
// Fix: Use standard function for constructor
const S3Client = vi.fn(function () { return {}; });
const GetObjectCommand = vi.fn();
const getSignedUrl = vi.fn();

mock('@aws-sdk/client-s3', { S3Client, GetObjectCommand });
mock('@aws-sdk/s3-request-presigner', { getSignedUrl });
mock('dotenv-json', () => { });

const createPresignedUrl = require('../../s3');

describe('s3.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a presigned URL', async () => {
        process.env.S3_BUCKET = 'test-bucket';
        const mockUrl = 'https://signed-url.com';
        getSignedUrl.mockResolvedValue(mockUrl);

        const result = await createPresignedUrl('test-key');

        expect(GetObjectCommand).toHaveBeenCalledWith({
            Bucket: 'test-bucket',
            Key: 'test-key',
        });
        expect(getSignedUrl).toHaveBeenCalled();
        expect(result).toBe(mockUrl);
    });

    it('should handle errors', async () => {
        const error = new Error('AWS Error');
        getSignedUrl.mockRejectedValue(error);

        await expect(createPresignedUrl('test-key')).rejects.toThrow('AWS Error');
    });
});

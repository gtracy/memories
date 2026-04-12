import { describe, it, expect, vi, beforeEach } from 'vitest';

const createPresignedUrl = require('../../s3');

describe('s3.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a presigned URL', async () => {
        process.env.S3_BUCKET = 'test-bucket';
        const mockUrl = 'https://signed-url.com';
        const mockGetSignedUrl = vi.fn().mockResolvedValue(mockUrl);
        const mockS3Client = vi.fn(function() { return {}; });
        const mockGetObjectCommand = vi.fn(function(args) { return args; });

        const result = await createPresignedUrl('test-key', mockS3Client, mockGetObjectCommand, mockGetSignedUrl);

        expect(mockGetObjectCommand).toHaveBeenCalledWith({
            Bucket: 'test-bucket',
            Key: 'test-key',
        });
        expect(mockGetSignedUrl).toHaveBeenCalled();
        expect(result).toBe(mockUrl);
    });

    it('should handle errors', async () => {
        const error = new Error('AWS Error');
        const mockGetSignedUrl = vi.fn().mockRejectedValue(error);
        const mockS3Client = vi.fn(function() { return {}; });
        const mockGetObjectCommand = vi.fn(function(args) { return args; });

        await expect(createPresignedUrl('test-key', mockS3Client, mockGetObjectCommand, mockGetSignedUrl)).rejects.toThrow('AWS Error');
    });
});

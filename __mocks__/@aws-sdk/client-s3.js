
const S3Client = vi.fn(() => ({}));
const GetObjectCommand = vi.fn();

module.exports = {
    S3Client,
    GetObjectCommand
};

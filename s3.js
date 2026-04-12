const { S3Client: S3ClientLib, GetObjectCommand: GetObjectCommandLib } = require("@aws-sdk/client-s3");
const { getSignedUrl: getSignedUrlLib } = require("@aws-sdk/s3-request-presigner");

try {
    require('dotenv-json')();
} catch (error) {
    // do nothing
}

const createPresignedUrl = async (objectKey, S3Client = S3ClientLib, GetObjectCommand = GetObjectCommandLib, getSignedUrl = getSignedUrlLib) => {
    const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });

    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: objectKey,
    });

    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    } catch (err) {
        throw err;
    }
}
module.exports = createPresignedUrl;

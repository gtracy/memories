const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = new S3Client({ region: "us-east-2" }); 

async function createPresignedUrl(objectKey) {
    const bucketName = process.env.S3_BUCKET;
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    // Set the expiration time for the signed URL
    const expiresIn = 60 * 60; // A signed URL is valid for 1 hour

    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (err) {
        console.error("Error creating signed URL", err);
        throw err;
    }
}
module.exports = createPresignedUrl;

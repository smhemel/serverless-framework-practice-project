const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const s3Client = new S3Client({ region: 'ap-south-1' });
const dynamoDBClient = new DynamoDBClient({ region: 'ap-south-1' });

exports.getUploadUrl = async (event) => {
    try {
        const bucketName = process.env.BUCKET_NAME;
        const { fileName, fileType, categoryName } = JSON.parse(event.body);

        if (!fileName || !fileType || !categoryName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'fileName, fileType, and categoryName are required' }),
            };
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: fileType,
        });

        const signedURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // save category info to DynamoDB
        const putItemCommand = new PutItemCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                'categoryName': { S: categoryName },
                'fileName': { S: fileName },
                'createdAt': { S: new Date().toISOString() },
            },
        });

        await dynamoDBClient.send(putItemCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({ url: signedURL }),
        };
    } catch (error) {
        return {
            statusCode: 200,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
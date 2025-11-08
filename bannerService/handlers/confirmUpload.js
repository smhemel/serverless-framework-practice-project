const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDBClientInstance = new DynamoDBClient({ region: "ap-south-1" });

exports.confirmUpload = async (event) => {
    try {
        const tableName = process.env.DYNAMODB_TABLE;
        const bucketName = process.env.BUCKET_NAME;

        const record = event.Records[0];
        const { fileName } = record.s3.object.key;
        const imageUrl = `https://${bucketName}.s3.ap-south-1.amazonaws.com/${fileName}`;

        const command = new PutItemCommand({
            TableName: tableName,
            Item: {
                fileName: { S: fileName },
                imageUrl: { S: imageUrl },
                uploadedAt: { S: new Date().toISOString() },
            },
        });

        await dynamoDBClientInstance.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Upload confirmed" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}

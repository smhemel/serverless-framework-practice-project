const { DynamoDBClient, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({ region: "ap-south-1" });

exports.updateProductImage = async (event) => {
    try {
        const tableName = process.env.DYNAMODB_TABLE;

        //extract the first record from the event
        const record = event.Records[0];

        //Get the s3 bucket name from the event record
        const bucketName = record.s3.bucket.name;

        //extract the file name from the s3 event record
        const fileName = record.s3.object.key;
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "fileName = :fileName",
            ExpressionAttributeValues: {
                ":fileName": { S: fileName }
            }
        });

        const scanResult = await dynamoDbClient.send(scanCommand);
        if (!scanResult.Items || scanResult.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ msg: "Product not found" }),
            };
        }

        const productId = scanResult.Items[0].id.S;
        const updateItemCommand = new UpdateItemCommand({
            TableName: tableName,
            Key: { id: { S: productId } },
            UpdateExpression: "SET imageUrl = :imageUrl",
            ExpressionAttributeValues: {
                ":imageUrl": { S: imageUrl },
            },
        });

        await dynamoDbClient.send(updateItemCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({ msg: "Image Url updated successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
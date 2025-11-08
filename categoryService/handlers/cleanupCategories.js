const { DynamoDBClient, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const dynamoDbClient = new DynamoDBClient({ region: "ap-south-1" });
const snsClient = new SNSClient({ region: "ap-south-1" });

//Define  the cleanup function to remove outdated categories
exports.cleanupCategories = async () => {
    try {
        //Get the Dynamodb table name from the enviroment varaibles
        const tableName = process.env.DYNAMO_TABLE;
        const snsTopicArn = process.env.SNS_TOPIC_ARN;

        //Calcalate the timestamp for one hour ago(to filter outdated categories)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        //Create a scan command to find categories that are:
        //older tha one hour (createdAt< oneHourAgo)
        // do not have an imageUrl field
        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "createdAt < :oneHourAgo AND attribute_not_exists(imageUrl)",
            ExpressionAttributeValues: {
                ":oneHourAgo": { S: oneHourAgo }
            }
        });

        //Execute the scan command to retrive matching  items from the database
        const { Items } = await dynamoDbClient.send(scanCommand);

        //if no itmes are found, return a success response indicating no cleanup was needed
        if (!Items || Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ msg: "No Categories found for cleanup" }),
            };
        }
        //Initialze a counter to track the number of deleted categories
        let deletedCount = 0;
        //Iterate over each outdated category and delete it from the database
        for (const item of Items) {
            //Create a delete command using the category's unique identiifier(fileName)
            const deleteItemCommand = new DeleteItemCommand({
                TableName: tableName,
                Key: { fileName: { S: item.fileName.S } }
            });

            //Execute the delete operation
            await dynamoDbClient.send(deleteItemCommand);
            deletedCount++; //Increament the count of deleted items
        }

        //send an SNS notication after deleting categories
        const snsMessage = `Cleanup completed. Deleted ${deletedCount} outdated categories`;

        await snsClient.send(new PublishCommand({
            TopicArn: snsTopicArn,
            Message: snsMessage,
            Subject: "Category cleanup Notification",
        }));
        //return a success response with the total number of deleted  categories

        return {
            statusCode: 200,
            body: JSON.stringify({ msg: "cleanup completed", deletedCount }),
        };
    } catch (error) {
        //return error response if something goes wrong
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
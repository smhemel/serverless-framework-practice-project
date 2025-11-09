const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const dynamoDbClient = new DynamoDBClient({ region: "ap-south-1" });

//Function to fetch all products where isApproved is true

exports.getApprovedProducts = async () => {
    try {
        //Get the dynamodb table name from the enviroment variables
        const tableName = process.env.DYNAMODB_TABLE;

        //Define a scanCommand to fetch all products where isApproved is true
        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "isApproved = :trueVal",
            ExpressionAttributeValues: {
                ":trueVal": { BOOL: true }
            }
        });
        const { Items } = await dynamoDbClient.send(scanCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({ products: Items || [] }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
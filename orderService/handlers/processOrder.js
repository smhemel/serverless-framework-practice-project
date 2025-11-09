const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const dynamoDbClient = new DynamoDBClient({ region: "ap-south-1" });

// Lambda function to process orders from SQS
exports.processOrder = async (event) => {
    try {
        //loop through each record in the SQS event
        for (const record of event.Records) {
            const orderData = JSON.parse(record.body);
            const { id, productId, quantity, email, status, createdAt } = orderData;

            //send a command to dynamodb to insert the order item
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.DYNAMODB_TABLE,
                Item: {
                    id: { S: id },
                    productId: { S: productId },
                    email: { S: email },
                    quantity: { N: quantity.toString() },
                    status: { S: status },
                    createdAt: { S: createdAt },
                }
            }));
        }

        //return a success reponse after processing all records
        return {
            statusCode: 200,
            body: JSON.stringify({ msg: "order processed successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
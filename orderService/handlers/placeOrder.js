const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const axios = require('axios');
const crypto = require('crypto');

const dynamoDbClient = new DynamoDBClient({ region: "ap-south-1" });

exports.placeOrder = async (event) => {
    try {
        const { id, quantity, email } = JSON.parse(event.body);
        if (!id || !quantity || !email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "All fields are required" }),
            };
        }
        
        const productResponse = await axios.get('https://g8g6tgzwgg.execute-api.ap-south-1.amazonaws.com/approved-products');
        const approvedProducts = productResponse.data.products || [];
        const product = approvedProducts.find(p => p.id?.S === id);
        if (!product) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Product not found or not approved' }),
            };
        }

        const availableStock = parseInt(product.quantity?.N || "0");
        if (availableStock < quantity) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Insufficient stock available" }),
            };
        }

        const orderId = crypto.randomUUID();
        const orderPayload = {
            id: { S: orderId },
            productId: { S: id },
            quantity: { N: quantity.toString() },
            email: { S: email },
            status: { S: "pending" },
            createdAt: { S: new Date().toISOString() },
        };

        await dynamoDbClient.send(
            new PutItemCommand({
                TableName: process.env.DYNAMODB_TABLE,
                Item: orderPayload,
            })
        );

        return {
            statusCode: 201,
            body: JSON.stringify({
                msg: 'Order placed successfully',
                orderId,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
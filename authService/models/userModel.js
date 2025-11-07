const { DynamoDBClient, GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
// const  { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const TABLE_NAME = "Users";
const ddbClient = new DynamoDBClient({ region: 'ap-south-1' });

// User Model class to represent a user and handle database operations

class UserModel {
    constructor(email, fullName) {
        this.userId = crypto.randomUUID(); //Generate a unique user ID
        this.email = email;
        this.fullName = fullName;
        this.state = ""; // Default empty string for state
        this.city = "";  // Default empty string for city
        this.locality = ""; // Default empty string for locality
        this.createdAt = new Date().toISOString(); //Timestamp for user creation
    }

    // Save the user to DynamoDB
    async save() {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                userId: { S: this.userId },
                email: { S: this.email },
                fullName: { S: this.fullName },
                state: { S: this.state },
                city: { S: this.city },
                locality: { S: this.locality },
                createdAt: { S: this.createdAt },
            },
        };

        try {
            const command = new PutItemCommand(params);
            await ddbClient.send(command);
        } catch (error) {
            throw new Error(`Error saving user to DynamoDB: ${error.message}`);
        }
    }

    // Static method to get a user by email
    static async getByEmail(email) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                Email: { S: email },
            },
        };

        try {
            const command = new GetItemCommand(params);
            const response = await ddbClient.send(command);
            return response.Item ? response.Item : null;
        } catch (error) {
            throw new Error(`Error retrieving user from DynamoDB: ${error.message}`);
        }
    }
}

module.exports = UserModel;
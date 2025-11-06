//Import  the required AWS Cognito SDK 

const { CognitoIdentityProviderClient, SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');

//Initialize Cognito client with specified AWS region

const client = new CognitoIdentityProviderClient({
    region: 'ap-south-1',//Specify your AWS region
});

//Define Cognito App Client ID for user pool authentication

const CLIENT_ID = "40t596ot83gjo66aupnpgrghl6";

//Exported sign-up function to handle new user registration

exports.signUp = async (event) => {
    //Parse the incoming request body to extract  user data
    const { email, password, fullName } = JSON.parse(event.body);

    //Configure parameters for Cognito  SignupCommand

    const params = {
        ClientId: CLIENT_ID,//Coginitor App Client ID
        Username: email, //User's emailas the username in coginito
        Password: password,// User's chosen password
        UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: fullName },
        ]
    };

    try {
        //Create the user in Cognito user pool
        const command = new SignUpCommand(params);
        //Execute the sign-up request
        await client.send(command);

        //Return success reponse to the client

        return {
            statusCode: 200,
            body: JSON.stringify({ msg: "User successfully signed up!" }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ msg: 'sign-up failed', error: error.message }),
        };
    }
}
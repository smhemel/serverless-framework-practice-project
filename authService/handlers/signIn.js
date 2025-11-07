const { CognitoIdentityProviderClient, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
    region: 'ap-south-1', //Specify your AWS region
});

//Define Cognito App Client ID for user pool authentication
const CLIENT_ID = process.env.CLIENT_ID;

exports.signIn = async (event) => {
    const { email, password } = JSON.parse(event.body);

    const params = {
        ClientId: CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH', //Auth flow  for username/password
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    };

    try {
        const command = new InitiateAuthCommand(params);
        const response = await client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User successfully signed in!",
                tokens: response.AuthenticationResult, //this will contain  the 
                //AccessToken , RefreshToken, and idToken     

            }),
        };

    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ msg: 'sign-in failed', error: error.message }),
        };
    }
}
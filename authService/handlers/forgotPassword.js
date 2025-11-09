const { CognitoIdentityProviderClient, ForgotPasswordCommand } = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({ region: 'ap-south-1' });

const CLIENT_ID = process.env.CLIENT_ID;

exports.forgotPassword = async (event) => {
    const { email } = JSON.parse(event.body);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
    };

    try {
        const command = new ForgotPasswordCommand(params);
        const response = await cognitoClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Password reset initiated successfully. Please check your email for the verification code.',
                data: response,
            }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Error initiating password reset.',
                error: error.message,
            }),
        };
    }
}
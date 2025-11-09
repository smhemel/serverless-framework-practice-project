const { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({ region: 'ap-south-1' });

const CLIENT_ID = process.env.CLIENT_ID;

exports.confirmForgotPassword = async (event) => {
    const { email, verificationCode, newPassword } = JSON.parse(event.body);
    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: verificationCode,
        Password: newPassword,
    };

    try {
        const command = new ConfirmForgotPasswordCommand(params);
        await cognitoClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Password has been reset successfully.' }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Error resetting password.',
                error: error.message,
            }),
        };
    }
}
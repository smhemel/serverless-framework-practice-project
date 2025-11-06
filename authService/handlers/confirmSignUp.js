const { CognitoIdentityProviderClient, ConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
    region: 'ap-south-1',//Specify your AWS region
});

const CLIENT_ID = "40t596ot83gjo66aupnpgrghl6";

exports.confirmSignUp = async (event) => {
    const { email, confirmationCode } = JSON.parse(event.body);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode,
    };

    try {
        const command = new ConfirmSignUpCommand(params);

        await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ msg: "User successfully confirmed!" }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ msg: 'confirmation failed', error: error.message }),
        };
    }
}
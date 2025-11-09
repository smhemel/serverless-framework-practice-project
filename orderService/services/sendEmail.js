const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = new SESClient({ region: "ap-south-1" });

exports.sendOrderEmail = async (toEmail, orderId, productName) => {
    const emailParams = {
        Source: "smhemel.eu@gmail.com",
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Subject: {
                Data: 'Your Order Confirmation',
            },
            Body: {
                Text: {
                    Data: `Thank you for your order\n\nOrder ID: ${orderId}\nProduct: ${productName}`,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
    } catch (error) {
        throw new Error(error.message || "Error Unknown");
    }
}
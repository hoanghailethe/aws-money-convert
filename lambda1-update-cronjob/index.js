const AWS = require('aws-sdk');
const axios = require('axios');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    const maxRetries = 3;
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
        try {
            const externalApiResponse = await axios.get(process.env.MY_API_ENDPOINT);
            const exchangeRates = externalApiResponse.data.conversion_rates;

            for (const [currency, rate] of Object.entries(exchangeRates)) {
                await saveToDynamoDB(currency, rate);
            }

            return {
                statusCode: 200,
                body: JSON.stringify('Data updated successfully'),
            };
        } catch (error) {
            console.error('Error updating data:', error);
            currentRetry++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    return {
        statusCode: 500,
        body: JSON.stringify('Max retries reached. Error updating data.'),
    };
};

async function saveToDynamoDB(currency, rate) {
    const params = {
        TableName: process.env.DYNAMO_DB_TABLE_NAME,
        Item: {
            'base_currency' : 'USD',
            'converted_currency': currency,
            'exchange_rate': rate
        }
    };

    try {
        await dynamoDB.put(params).promise();
    } catch (error) {
        console.error(`Error saving currency ${currency}:`, error);
        throw error; // Re-throw the error to be caught by the calling function
    }
}

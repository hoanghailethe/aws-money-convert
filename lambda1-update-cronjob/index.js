const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { default: axios } = require('axios');

// Initialize the DynamoDB Document Client
const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event, context) => {
    const maxRetries = 3;
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
        try {
            const externalApiResponse = await axios.get(process.env.MY_API_ENDPOINT);
            const exchangeRates = externalApiResponse.data.conversion_rates;

            for (const [currency, rate] of Object.entries(exchangeRates)) {
                // Generate a unique ID for each record, for example using a UUID
                const id = generateUniqueId();
                // Get the current date-time in ISO format
                const datetimeUpdate = new Date().toISOString();
                console.log('DEBUGING LAMBDA : ' +  id, 'USD', currency, rate, datetimeUpdate ) ;
                await saveToDynamoDB(id, 'USD', currency, rate, datetimeUpdate);
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

async function saveToDynamoDB(id, baseCurrency, convertedCurrency, exchangeRate, datetimeUpdate) {
    const params = {
        TableName: process.env.DYNAMO_DB_TABLE_NAME,
        Item: {
            id, // Unique identifier for the record
            base_currency: baseCurrency,
            converted_currency: convertedCurrency,
            exchange_rate: exchangeRate,
            datetime_update : datetimeUpdate // Sort key
        }
    };

    try {
        await docClient.send(new PutCommand(params));
    } catch (error) {
        console.error(`Error saving currency ${convertedCurrency}:`, error);
        throw error;
    }
}

function generateUniqueId() {
    return uuidv4();
}
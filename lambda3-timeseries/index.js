const AWS = require('aws-sdk');
const axios = require('axios');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const dax = new AWS.DAX({ endpoints: ['DAX_ENDPOINT'] });

exports.handler = async (event, context) => {
    try {
        const { currency_pair, time_frame } = JSON.parse(event.body);

        const exchangeRates = await getHistoricalExchangeRates(currency_pair, time_frame);

        return {
            statusCode: 200,
            body: JSON.stringify({ exchangeRates }),
        };
    } catch (error) {
        console.error('Error fetching historical exchange rates:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error fetching historical exchange rates'),
        };
    }
};

async function getHistoricalExchangeRates(currency_pair, time_frame) {

    const [from_currency, to_currency] = currency_pair.split('_');

    let exchangeRates;

    if (from_currency === 'USD' || to_currency === 'USD') {
        exchangeRates = await getExchangeRatesForUSD(from_currency, to_currency, time_frame);
    } else {
        exchangeRates = await calculateExchangeRateUsingUSD(from_currency, to_currency, time_frame);
    }


    return exchangeRates; 
}

async function calculateExchangeRateUsingUSD(from_currency, to_currency, time_frame) {
    const usdToBaseRates = await getExchangeRatesForUSD('USD', from_currency, time_frame);
    const usdToConvertedRates = await getExchangeRatesForUSD('USD', to_currency, time_frame);

    const exchangeRates = [];

    for (let i = 0; i < usdToBaseRates.length; i++) {
        const date = usdToBaseRates[i].date;
        const exchange_rate = usdToConvertedRates[i].exchange_rate / usdToBaseRates[i].exchange_rate;

        exchangeRates.push({ date, exchange_rate });
    }

    return exchangeRates;
}


async function getExchangeRatesForUSD(from_currency, to_currency, time_frame) {
    const params = {
        TableName: process.env.DYNAMO_DB_TABLE_NAME,
        KeyConditionExpression: '#base_currency = :base_currency AND #converted_currency = :converted_currency',
        ExpressionAttributeNames: {
            '#base_currency': 'base_currency',
            '#converted_currency': 'converted_currency',
        },
        ExpressionAttributeValues: {
            ':base_currency': from_currency === 'USD' ? 'USD' : to_currency,
            ':converted_currency': from_currency === 'USD' ? to_currency : from_currency,
        },
        Limit: calculateQueryLimit(time_frame),
        ScanIndexForward: false,
    };

    const result = await dynamoDB.query(params).promise();

    return parseDataForFrontend(result.Items);
}


async function queryDynamoDB(params) {
    try {
        const data = await dax.query(params).promise();
        return data;
    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        throw error;
    }
}

function parseDataForFrontend(data) {
    // Implement parsing logic suitable for frontend chart rendering
    // You may want to transform the data into the format expected by your frontend library (e.g., Chart.js)
    return data.map(item => ({
        date: item.date,
        exchange_rate: item.exchange_rate, 
        timestamp: item.date,
        // Add more properties as needed
    }));
}




function calculateQueryLimit(time_frame) {
    // Implement logic to calculate the query limit based on the specified time frame
    // Adjust the limit as needed to optimize performance
    return 100; // Default limit
}

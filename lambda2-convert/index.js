const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
    try {
        console.log('Event :', JSON.stringify(event, null, 2));

        const { from_currency, to_currency } = JSON.parse(event.body);

        let exchangeRate;

        if (from_currency === 'USD' || to_currency === 'USD') {
            // Case 1: One of the currencies is USD
            exchangeRate = await getExchangeRateForUSD(from_currency, to_currency);
        } else {
            // Case 2: Neither currency is USD
            exchangeRate = await calculateExchangeRateUsingUSD(from_currency, to_currency);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all origins (replace with specific origins if needed)
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
              },
            body: JSON.stringify({ exchangeRate }),
        };
    } catch (error) {
        console.error('Error converting currency:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all origins (replace with specific origins if needed)
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
              },
            body: JSON.stringify('Error converting currency'),
        };
    }
};

async function getExchangeRateForUSD(from_currency, to_currency) {

    const command = new ScanCommand({
        TableName: process.env.DYNAMO_DB_TABLE_NAME,
        FilterExpression: '#base_currency = :base_currency AND #converted_currency = :converted_currency',
        ExpressionAttributeNames: {
            '#base_currency': 'base_currency',
            '#converted_currency': 'converted_currency',
        },
        ExpressionAttributeValues: {
            ':base_currency': from_currency === 'USD' ? 'USD' : to_currency,
            ':converted_currency': from_currency === 'USD' ? to_currency : from_currency,
        },
        ScanIndexForward: false, // Set to false to retrieve items in descending order (latest first)
    });


    const result = await docClient.send(command);
    console.log(result);
    if(result.Items.length == 0 ) {
        return 'We dont have data for this pair of currency yet. We would keep it update later! Sorry!';
    }
    let rate = result.Items[0].exchange_rate;
    if ( from_currency === 'USD' ) return rate ;
    return 1/rate ;
}

async function calculateExchangeRateUsingUSD(from_currency, to_currency) {
    const usdToBaseRate = await getExchangeRateForUSD('USD', from_currency);
    const usdToConvertedRate = await getExchangeRateForUSD('USD', to_currency);

    return usdToConvertedRate / usdToBaseRate;
}

// function getCurrentDate() {
//     return new Date().toISOString().split('T')[0];
// }

    // const params = {
    //     TableName: process.env.DYNAMO_DB_TABLE_NAME,
    //     KeyConditionExpression: '#date = :date AND (#base_currency = :base_currency AND #converted_currency = :converted_currency)',
    //     ExpressionAttributeNames: {
    //         '#date': 'datetime_update',
    //         '#base_currency': 'base_currency',
    //         '#converted_currency': 'converted_currency',
    //     },
    //     ExpressionAttributeValues: {
    //         ':date': getCurrentDate(),
    //         ':base_currency': from_currency === 'USD' ? 'USD' : to_currency,
    //         ':converted_currency': from_currency === 'USD' ? to_currency : from_currency,
    //     },
    // };

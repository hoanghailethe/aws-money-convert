// Replace this with your API Gateway endpoint
let apiEndpoint = 'https://zch85u9qm5.execute-api.eu-central-1.amazonaws.com/cors';

// Function to populate currency options in the select elements
function populateCurrencyOptions() {
    const currencyCodes = [
        'USD', 'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG',
        'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB',
        'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP',
        'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
        'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP'
    ];

    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    currencyCodes.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = code;
        fromCurrency.appendChild(option);

        const option2 = document.createElement('option');
        option2.value = code;
        option2.textContent = code;
        toCurrency.appendChild(option2);
    });
}

//validation before send
function validateData(from_currency, to_currency, amount ) {
let errors = [];

  if (!from_currency) {
    errors.push("Please select a currency to convert from.");
  }
  if (!to_currency) {
    errors.push("Please select a currency to convert to.");
  }
  if (!amount || isNaN(Number(amount))) {
    errors.push("Please enter a valid amount.");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return false; 
  }
  return true
}   

// Function to handle currency conversion
async function convertCurrency() {
    console.log('Currency converting')
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const amount = document.getElementById('amount').value;

    if (!validateData(fromCurrency, toCurrency, amount )) return

    try {
          const response = await fetch(`${apiEndpoint}/convert-rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: `{"from_currency": "${fromCurrency}", "to_currency": "${toCurrency}", "amount": "${amount}"}`,
            }),
        });

        // const responseBody = await response.text(); // Get the response body as a string
        // console.log( responseBody)      //line 76    : print out : {"statusCode":200,"headers":{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"OPTIONS,POST,GET"},"body":"{\"exchangeRate\":0.01797568505348422}"}
        // // Check if the "body" field is a string, then parse it
        // const innerBody = typeof responseBody.body === 'string' ? JSON.parse(responseBody.body) : responseBody.body;
        // console.log( innerBody )    // print : undefined

        // const respo2 = responseBody.json()
        // console.log( respo2 )

        const responseBody = await response.json();
        console.log( responseBody )     // {statusCode: 200, headers: {…}, body: '{"exchangeRate":572.3933210909338}'}

        let rate = JSON.parse(responseBody.body ).exchangeRate;
        if (responseBody && responseBody.body ) {
          const convertedAmount = (amount * rate ).toFixed(2);
          document.getElementById('result').textContent = `${convertedAmount} ${toCurrency}`;
          document.getElementById('rate').textContent = ` 1 ${fromCurrency} = ${rate} ${toCurrency}`;
        } else {
            document.getElementById('result').textContent = 'Conversion failed. Please try again.';
        }
    } catch (error) {
        console.log ( error)
        if (error instanceof TypeError) {

          document.getElementById('result').textContent = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('405')) {

          document.getElementById('result').textContent = 'Request method is not allowed. Please contact support.';
        } else {

          document.getElementById('result').textContent = 'An error occurred. Please try again later.';
        }
        console.error('Error converting currency:', error);
      }
}

// Initialize the currency options
populateCurrencyOptions();

document.addEventListener('DOMContentLoaded', (event) => {
  let form = document.getElementById('curForm');

  form.addEventListener('submit', function(event) {
   
    event.preventDefault();
    convertCurrency()
  });
});
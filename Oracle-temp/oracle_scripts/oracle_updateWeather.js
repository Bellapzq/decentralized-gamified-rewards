require('dotenv').config();
const Web3 = require('web3');
const axios = require('axios');
const web3 = new Web3(`wss://sepolia.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`);
const abi = require('../abi/HighTempInsurance.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY.trim();
const contract = new web3.eth.Contract(abi, contractAddress);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

// Listen to the WeatherDataRequested event
contract.events.WeatherDataRequested()
    .on('data', async () => {
        try {
            const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=Sydney&days=1`);
            const data = response.data;
            const maxTemp = Math.round(data.forecast.forecastday[0].day.maxtemp_c * 10);
            const minTemp = Math.round(data.forecast.forecastday[0].day.mintemp_c * 10);

            console.log(`Max Temp: ${maxTemp}, Min Temp: ${minTemp}`);

            const tx = contract.methods.updateWeatherData(maxTemp, minTemp);
            const gas = await tx.estimateGas({ from: account.address });
            const dataTx = tx.encodeABI();

            const signedTx = await web3.eth.accounts.signTransaction({
                to: contractAddress,
                data: dataTx,
                gas,
            }, account.privateKey);

            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log('Transaction receipt: ', receipt);
        } catch (error) {
            console.error('Error updating weather data:', error);
        }
    })
    .on('error', console.error);

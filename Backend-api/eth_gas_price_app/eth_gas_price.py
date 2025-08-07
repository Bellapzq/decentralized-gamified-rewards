import requests
import schedule
import time
from flask import Flask, jsonify
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

eth_gas_data = {
    "SafeGasPrice": 0,
    "ProposeGasPrice": 0,
    "FastGasPrice": 0
}

def load_eth_gas_data():
    try:
        with open('eth_gas_data.json', 'r') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        return eth_gas_data

def save_eth_gas_data():
    with open('eth_gas_data.json', 'w') as file:
        json.dump(eth_gas_data, file)


eth_gas_data = load_eth_gas_data()

def fetch_eth_gas_price():
    global eth_gas_data
    url = "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=2YP9BH9PY5K6D4NXPF3D2TQFEMS1MBG3ZB" 
    # The API key can be replaced.
    try:
        response = requests.get(url,timeout=60)
        if response.status_code == 200:
            data = response.json()["result"]
            eth_gas_data["SafeGasPrice"] = data["SafeGasPrice"]
            eth_gas_data["ProposeGasPrice"] = data["ProposeGasPrice"]
            eth_gas_data["FastGasPrice"] = data["FastGasPrice"]
            save_eth_gas_data()
        else:
            print("Failed to fetch data:", response.status_code)
            eth_gas_data.update(load_eth_gas_data())
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        eth_gas_data.update(load_eth_gas_data())

# Schedule the function to run every minute
schedule.every(2).minutes.do(fetch_eth_gas_price)

# Initial fetch to ensure we have data at the start
fetch_eth_gas_price()

@app.route('/eth-gas-price', methods=['GET'])
def get_eth_gas_price():
    return jsonify(eth_gas_data)

if __name__ == '__main__':
    def run_schedule():
        while True:
            schedule.run_pending()
            time.sleep(1)

    from threading import Thread
    schedule_thread = Thread(target=run_schedule)
    schedule_thread.start()

    app.run(host='0.0.0.0',port=5002)

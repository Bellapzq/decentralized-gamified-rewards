from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

def count_rainy_days_and_heavy_rain_days(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
    
    rainy_days = 0
    heavy_rain_days = 0

    for value in data.values():
        if float(value) > 0:
            rainy_days += 1
        if float(value) > 10:
            heavy_rain_days += 1
    
    return rainy_days, heavy_rain_days


rainy_days, heavy_rain_days = count_rainy_days_and_heavy_rain_days('rainfall_last_30_days.json')



@app.route('/rainy-days', methods=['GET'])
def get_rainy_days():
    return jsonify({"rainy_days": rainy_days})

@app.route('/heavy-rainy-days', methods=['GET'])
def get_heavy_rain_days():
    return jsonify({"heavy_rain_days": heavy_rain_days})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

import yfinance as yf
from flask import request, render_template, jsonify, Flask

app = Flask(__name__, template_folder='templates')


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    ticker = request.get_json()['ticker']
    stock = yf.Ticker(ticker)
    data = stock.history(period='1d')
    info = stock.info

    return jsonify({
        'currentPrice': data.iloc[-1].Close,
        'previousClose': info['previousClose'],
        'openPrice': data.iloc[-1].Open,
        'dayHigh': data.iloc[-1].High,
        'dayLow': data.iloc[-1].Low,
        'marketCap': info['marketCap'],
        'volume': data.iloc[-1].Volume
    })

if __name__ == '__main__':
    app.run(debug=True)
var tickers = JSON.parse(sessionStorage.getItem('tickers')) || [];
var lastPrices = {};
var counter = 15;
var updateCycleStarted = false;

function startUpdateCycle() {
    if (!updateCycleStarted) {
        $('#timer').show();
        updatePrices();
        setInterval(function () {
            counter--;
            $('#counter').text(counter);
            if (counter <= 0) {
                updatePrices();
                counter = 15;
            }
        }, 1000);
        updateCycleStarted = true;
    }
}

$(document).ready(function () {
    $('#timer').hide();

    tickers.forEach(function (ticker) {
        addTickerToGrid(ticker);
    });

    updatePrices();

    $('#add-ticker-form').submit(function (e) {
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {
            validateTicker(newTicker);
        }
    });

    $('#tickers-grid').on('click', '.remove-btn', function () {
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);
        sessionStorage.setItem('tickers', JSON.stringify(tickers));
        $('#' + tickerToRemove).remove();
    });
});

function validateTicker(ticker) {
    $.ajax({
        url: '/get_stock_data',
        type: 'POST',
        data: JSON.stringify({ 'ticker': ticker }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data.currentPrice && data.openPrice) {
                tickers.push(ticker);
                sessionStorage.setItem('tickers', JSON.stringify(tickers));
                addTickerToGrid(ticker);
                $('#new-ticker').val('').removeClass('input-error');
                updatePrices();
                startUpdateCycle();
            } else {
                showInputError();
            }
        },
        error: function () {
            showInputError();
        }
    });
}

function showInputError() {
    $('#new-ticker').addClass('input-error');
    setTimeout(function () {
        $('#new-ticker').removeClass('input-error');
    }, 2000);
}

function addTickerToGrid(ticker) {
    $('#tickers-grid').append(
        `<div id="${ticker}" class="stock-box">
            <h2>${ticker}</h2>
            <p id="${ticker}-price"></p>
            <p id="${ticker}-pct"></p>
            <p id="${ticker}-previous-close"></p>
            <p id="${ticker}-open"></p>
            <p id="${ticker}-high"></p>
            <p id="${ticker}-low"></p>
            <p id="${ticker}-market-cap"></p>
            <p id="${ticker}-volume"></p>
            <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>`
    );
}

function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({ 'ticker': ticker }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                var changePercent = ((data.currentPrice - data.previousClose) / data.previousClose) * 100;

                $(`#${ticker}-price`).text(`Current Price: $${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`Change: ${changePercent.toFixed(2)}%`);
                $(`#${ticker}-previous-close`).text(`Previous Close: $${data.previousClose.toFixed(2)}`);
                $(`#${ticker}-open`).text(`Open: $${data.openPrice.toFixed(2)}`);
                $(`#${ticker}-high`).text(`Day's High: $${data.dayHigh.toFixed(2)}`);
                $(`#${ticker}-low`).text(`Day's Low: $${data.dayLow.toFixed(2)}`);
                $(`#${ticker}-market-cap`).text(`Market Cap: $${(data.marketCap / 1e9).toFixed(2)}B`);
                $(`#${ticker}-volume`).text(`Volume: ${data.volume.toLocaleString()}`);
            },
            error: function () {
                console.error(`Error fetching data for ticker: ${ticker}`);
            }
        });
    });
}

const buyObj = {
    code: 'usd',
    currency: 0
}

const sellObj = {
    code: 'rub',
    currency: 0
}

let sellToBuy = true
let connected = true
const buyButtons = document.querySelectorAll('.buy .tabs li')
const sellButtons = document.querySelectorAll('.sell .tabs li')

const buyInput = document.querySelector('.buy .result input')
const sellInput = document.querySelector('.sell .result input')

const buyInfo = document.querySelector('.buy .result p')
const sellInfo = document.querySelector('.sell .result p')

const error = document.querySelector('.error')

function updateInfos() {
    buyInfo.textContent = `1 ${buyObj.code.toUpperCase()} = ${Math.round(buyObj.currency * 10000) / 10000} ${sellObj.code.toUpperCase()}`
    sellInfo.textContent = `1 ${sellObj.code.toUpperCase()} = ${Math.round(sellObj.currency * 10000) / 10000} ${buyObj.code.toUpperCase()}`
}

async function getCurrency(code1, code2) {
    try {
        const apiUrl = `https://latest.currency-api.pages.dev/v1/currencies/${code1}.json`
        const response = await fetch(apiUrl)
        const result = await response.json()
        error.textContent = ''
        return result[code1][code2]
    } catch (err) {
        error.textContent = 'Unexpected Error'
        return null
    }
}

function calculate() {
    if (sellToBuy) {
        buyInput.value = Math.round(sellInput.value * sellObj.currency * 10000) / 10000
    }
    else {
        sellInput.value = Math.round(buyInput.value * buyObj.currency * 10000) / 10000
    }
}

buyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        buyButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const code = btn.getAttribute('code');
        buyObj.code = code

        if (connected) {
            const currentSell = Array.from(sellButtons).find((sellBtn) => sellBtn.classList.contains('active'))
            const sellCode = currentSell.getAttribute('code')
            if (code === sellCode) {
                buyObj.currency = 1
                sellObj.currency = 1
                calculate()
                updateInfos()
            }
            else {
                getCurrency(code, sellCode).then(data => {
                    if (data) {
                        buyObj.currency = data
                        sellObj.currency = 1 / data
                        calculate()
                        updateInfos()
                    }
                })
            }
        }
    });
});

sellButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        sellButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const code = btn.getAttribute('code');
        sellObj.code = code

        if (connected) {
            const currentBuy = Array.from(buyButtons).find((buyBtn) => buyBtn.classList.contains('active'))
            const buyCode = currentBuy.getAttribute('code')
            if (code === buyCode) {
                buyObj.currency = 1
                sellObj.currency = 1
                calculate()
                updateInfos()
            }
            else {
                getCurrency(code, buyCode).then(data => {
                    if (data) {
                        sellObj.currency = data
                        buyObj.currency = 1 / data
                        calculate()
                        updateInfos()
                    }
                })
            }
        }
    });
});

const pattern = /^[0-9]*\.?[0-9]*$/

buyInput.addEventListener('input', () => {
    buyInput.value = buyInput.value.replace(/,/g, '.')

    if (!pattern.test(buyInput.value)) {
        buyInput.value = buyInput.value.slice(0, -1)
        return;
    }

    sellToBuy = false;
    calculate()
});

sellInput.addEventListener('input', () => {
    sellInput.value = sellInput.value.replace(/,/g, '.')

    if (!pattern.test(sellInput.value)) {
        sellInput.value = sellInput.value.slice(0, -1)
        return;
    }

    sellToBuy = true;
    calculate()
});

window.addEventListener('online', () => {
    error.textContent = ''
    connected = true
});
window.addEventListener('offline', () => {
    error.textContent = 'Internet disconneted'
    connected = false
});

function start() {
    if(connected){
        getCurrency(sellObj.code, buyObj.code).then(data => {
            if (data) {
                sellObj.currency = data
                buyObj.currency = 1 / data
                sellInput.value = 5000
                calculate()
                updateInfos()
            }
        })
    }
}

start()
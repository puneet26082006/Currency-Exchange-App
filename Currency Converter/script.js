const BASE_URL = "https://api.frankfurter.dev/v1/latest";
const dropdown = document.querySelectorAll(".dropdown select");
const btn = document.querySelector('form button[type="submit"]');
const form = document.querySelector("form");
const amountInput = document.querySelector(".amount input");
let conversionRequestId = 0;
let conversionController;

const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");

const msg = document.querySelector(".msg");


for(let select of dropdown){
    for(let currCode in countryList){
        let newOption = document.createElement("option");
        newOption.innerText = currCode ;
        newOption.value = currCode ;
        if(select.name === "from" && currCode === "USD"){
            newOption.selected = "selected";
        } else if(select.name === "to" && currCode === "INR"){
            newOption.selected = "selected";
        }
        select.append(newOption);
    }

    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
        invalidateConversion();
    })
}

const UpdateExchangeRate = async () => {
    const requestId = ++conversionRequestId;
    conversionController?.abort();
    conversionController = null;
    btn.disabled = false;
    form.setAttribute("aria-busy", "false");
    const amount = amountInput;
    const rawAmount = amount.value.trim();
    const amtVal = Number(rawAmount);
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawAmount) ||
        !Number.isFinite(amtVal) || amtVal <= 0 || amtVal > Number.MAX_SAFE_INTEGER) {
        msg.innerText = "Enter a positive decimal amount within the supported number range.";
        return;
    }

    const from = fromCurr.value;
    const to = toCurr.value;
    if (from === to) {
        msg.innerText = `${amtVal} ${from} = ${amtVal.toFixed(2)} ${to}`;
        return;
    }

    const controller = new AbortController();
    conversionController = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    btn.disabled = true;
    form.setAttribute("aria-busy", "true");
    msg.innerText = "Loading exchange rate…";

    try {
        const query = new URLSearchParams({ base: from, symbols: to });
        const response = await fetch(`${BASE_URL}?${query}`, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(response.status === 400 || response.status === 404 || response.status === 422
                ? "No exchange rate is available for this currency pair."
                : "The exchange-rate service is unavailable. Please try again.");
        }
        const data = await response.json();
        if (requestId !== conversionRequestId) return;
        const rate = data.rates?.[to];
        const converted = amtVal * rate;
        if (!Number.isFinite(rate) || rate <= 0 || !Number.isFinite(converted) || converted > Number.MAX_SAFE_INTEGER) {
            throw new Error("No valid conversion is available for this amount and currency pair.");
        }
        msg.innerText = `${amtVal} ${from} = ${converted.toFixed(2)} ${to}`;
    } catch (error) {
        if (requestId !== conversionRequestId) return;
        msg.innerText = error.name === "AbortError"
            ? "The exchange-rate request timed out. Please try again."
            : error instanceof TypeError
                ? "Unable to load exchange rates. Check your connection and try again."
                : error.message || "Unable to load exchange rates. Please try again.";
    } finally {
        clearTimeout(timeout);
        if (requestId === conversionRequestId) {
            conversionController = null;
            btn.disabled = false;
            form.setAttribute("aria-busy", "false");
        }
    }
};

const invalidateConversion = () => {
    ++conversionRequestId;
    conversionController?.abort();
    conversionController = null;
    btn.disabled = false;
    form.setAttribute("aria-busy", "false");
    msg.innerText = "Values changed. Get a new exchange rate.";
};

amountInput.addEventListener("input", invalidateConversion);

const updateFlag = (element) => {
    let currCode = element.value ;
    let countrycode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countrycode}/flat/64.png` ; 
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
}

document.querySelector("#swap-currencies").addEventListener("click", () => {
    [fromCurr.value, toCurr.value] = [toCurr.value, fromCurr.value];
    updateFlag(fromCurr);
    updateFlag(toCurr);
    invalidateConversion();
    UpdateExchangeRate();
});

form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    UpdateExchangeRate();
    
})

window.addEventListener("load", () =>{
    UpdateExchangeRate();
})




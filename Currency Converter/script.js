const BASE_URL = "https://api.frankfurter.dev/v1/latest";
const dropdown = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");

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
    })
}

const UpdateExchangeRate = async () => {
    const amount = document.querySelector(".amount input");
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

    const query = new URLSearchParams({ base: from, symbols: to });
    const response = await fetch(`${BASE_URL}?${query}`);
    const data = await response.json();
    const converted = amtVal * data.rates[to];
    msg.innerText = `${amtVal} ${from} = ${converted.toFixed(2)} ${to}`;
};

const updateFlag = (element) => {
    let currCode = element.value ;
    let countrycode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countrycode}/flat/64.png` ; 
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
}


btn.addEventListener("click", async (evt) => {
    evt.preventDefault();
    UpdateExchangeRate(evt)
    
})

window.addEventListener("load", () =>{
    UpdateExchangeRate();
})




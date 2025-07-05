const BASE_URL = "https://api.frankfurter.app/latest?from=USD&to=INR"
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

    let amount = document.querySelector(".amount input")
    let amtVal = amount.value ;
    if(amtVal === "" || amtVal < 1){
        amtVal = 1 ;
        amount.value = '1';
    }
    
    console.log(fromCurr.value,toCurr.value);
    const URL = `https://api.frankfurter.app/latest?amount=${amtVal}&from=${fromCurr.value}&to=${toCurr.value}`;
    
    let response = await fetch(URL);
    let data = await response.json() ;
    let rate = data.rates[toCurr.value]
    console.log(rate)
    let finalAmount = rate * amtVal ;
    
    msg.innerText = `${amtVal} ${fromCurr.value} = ${rate} ${toCurr.value}`;
}

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



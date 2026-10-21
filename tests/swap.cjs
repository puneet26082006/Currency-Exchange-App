const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const element = value => ({value, listeners: {}, attributes: {}, innerText: '', disabled: false,
  addEventListener(name, fn) { this.listeners[name] = fn; },
  setAttribute(name, value) { this.attributes[name] = value; }, append() {},
  parentElement: {image: {}, querySelector() { return this.image; }} });
const from = element('USD'), to = element('INR'), amount = element('2.5');
const form = element(), submit = element(), swap = element(), msg = element();
const selectors = {'.from select':from,'.to select':to,'.amount input':amount,form,
  'form button[type="submit"]':submit,'#swap-currencies':swap,'.msg':msg};
let requests = [];
const context = vm.createContext({document:{querySelector:s=>{assert.ok(selectors[s],s);return selectors[s];},
  querySelectorAll:()=>[from,to],createElement:()=>({})}, window:{addEventListener(){}},
  countryList:{USD:'US',INR:'IN'},AbortController,URLSearchParams,setTimeout,clearTimeout,
  fetch:(url,options)=>new Promise(resolve=>requests.push({url,options,resolve}))});
vm.runInContext(fs.readFileSync(__dirname+'/../Currency Converter/script.js','utf8'),context);
(async()=>{
  let prevented=false;
  form.listeners.submit({preventDefault(){prevented=true;}});
  assert.ok(prevented); assert.equal(submit.disabled,true); assert.equal(swap.disabled,false);
  swap.listeners.click();
  assert.equal(from.value,'INR'); assert.equal(to.value,'USD'); assert.equal(amount.value,'2.5');
  assert.equal(requests[0].options.signal.aborted,true);
  assert.match(requests[1].url,/base=INR&symbols=USD/);
  assert.match(from.parentElement.image.src,/IN\/flat/);
  assert.match(to.parentElement.image.src,/US\/flat/);
  requests[1].resolve({ok:true,json:async()=>({rates:{USD:0.012}})});
  await new Promise(setImmediate);
  assert.equal(msg.innerText,'2.5 INR = 0.03 USD'); assert.equal(submit.disabled,false);
  requests[0].resolve({ok:true,json:async()=>({rates:{INR:80}})});
  await new Promise(setImmediate);
  assert.equal(msg.innerText,'2.5 INR = 0.03 USD');
  from.value=to.value='USD'; swap.listeners.click();
  assert.equal(requests.length,2); assert.equal(msg.innerText,'2.5 USD = 2.50 USD');
  amount.value='bad'; swap.listeners.click(); assert.equal(requests.length,2);
  assert.match(msg.innerText,/positive decimal/); assert.equal(submit.disabled,false);
  const html=fs.readFileSync(__dirname+'/../Currency Converter/index.html','utf8');
  assert.match(html,/<button id="swap-currencies" type="button" aria-label="Swap currencies"/);
  console.log('PASS: swap values/flags, amount preservation, submit targeting, in-flight abort, stale response protection, same-currency and invalid-input behavior, native accessible button.');
})().catch(e=>{console.error(e);process.exitCode=1;});

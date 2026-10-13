# Currency Converter

A small HTML, CSS, and vanilla JavaScript app for converting between the currency codes listed in `codes.js`.

## Run locally

```sh
git clone https://github.com/puneet26082006/Currency-Exchange-App.git
cd Currency-Exchange-App
python -m http.server 8000 --bind 127.0.0.1 --directory "Currency Converter"
```

Open [http://localhost:8000](http://localhost:8000). On Windows, `py -3` can replace `python`. You can also open [index.html](Currency%20Converter/index.html) with VS Code Live Server. No build step or package installation is needed.

## Use the app

1. Enter a positive decimal amount, such as `0.50` or `25.75`.
2. Choose the source and target currency.
3. Click **Get Exchange Rate** or press Enter in the amount field.
4. Read the conversion or the status message.

The initial conversion is 1 USD to INR. Empty, zero, negative, non-numeric, and excessively large amounts are rejected without changing what you typed. Results are rounded to two decimal places for display. Identical currencies are converted locally without a network request.

Changing a field marks the old result as outdated and cancels a pending conversion. Only the newest request can update the result. Stalled requests time out after 10 seconds and can be retried.

## Data and connectivity

The app uses the documented [Frankfurter v1 API](https://frankfurter.dev/v1/), fetching a unit rate with `base` and `symbols` and multiplying by the amount locally. No API key is needed. These are reference rates, not live trading quotes; the API may not return a rate for every pair in the dropdown. The app reports unavailable pairs, incomplete responses, and connection failures.

Network access is also needed for flag images and external icon styles. If a request fails, check the connection, try another pair, or retry later. No account or credentials are required.

## Project files

| File | Purpose |
| --- | --- |
| [index.html](Currency%20Converter/index.html) | Labeled form and result display |
| [script.js](Currency%20Converter/script.js) | Validation, requests, conversion, and status messages |
| [codes.js](Currency%20Converter/codes.js) | Currency codes and flag-country mapping |
| [style.css](Currency%20Converter/style.css) | Responsive layout and keyboard focus styles |

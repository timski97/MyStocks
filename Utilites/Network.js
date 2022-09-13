import React from 'react';
import Config from '../src/constants/Config';

export const getCost = name => {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + name + '?modules=price', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          // console.warn('data: ' + JSON.stringify(data));
          if (data.quoteSummary.result != null) {
            console.log(
              name,
              '    ' + data.quoteSummary.result[0].price.regularMarketPrice.raw,
            );
            resolve(data.quoteSummary.result[0].price.regularMarketPrice.raw);
          } else {
            reject();
          }
        });
      })
      .catch(err => {
        console.log(err);
        reject('Unknown error.Try again later.');
      });
  });
};

export const getDividends = name => {
  if (!name) {
    return null;
  }
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + name + '?modules=defaultKeyStatistics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          // console.warn(name,'data: ' + JSON.stringify(data));
          if (data.quoteSummary.result != null) {
            if (
              data.quoteSummary.result[0].defaultKeyStatistics.lastDividendValue
                .raw != undefined
            ) {
              resolve([
                'div',
                data.quoteSummary.result[0].defaultKeyStatistics
                  .lastDividendValue.raw * 4,
              ]);
            } else if (
              data.quoteSummary.result[0].defaultKeyStatistics.yield.raw !=
              undefined
            ) {
              resolve([
                'yield',
                data.quoteSummary.result[0].defaultKeyStatistics.yield.raw,
              ]);
            } else {
              resolve(['null']);
            }
          } else {
            console.log('errerrerr', name, data);
            reject();
          }
        });
      })
      .catch(err => {
        console.log('errr', name, err);
        reject('Unknown error.Try again later.');
      });
  });
};

export const getDollar = () => {
  return new Promise(function (resolve, reject) {
    fetch('https://www.cbr-xml-daily.ru/daily_json.js', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          // console.warn('data: ' + JSON.stringify(data.Valute.USD.Value));
          if (data) {
            resolve(data.Valute.USD.Value);
          } else {
            reject(data.error);
          }
        });
      })
      .catch(err => {
        console.log(err);
        reject('Unknown error.Try again later.');
      });
  });
};

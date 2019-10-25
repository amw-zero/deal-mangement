import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { makeDealManagement, makeServer } from './dealManagement.js';

function makeTestDealManagement(dealContext = []) {
  let save = jest.fn();
  let server = makeServer(dealContext, save);
  let dealManagement = makeDealManagement(server);
  let mocks = { save };

  return { dealManagement, mocks }
}

describe('viewing deals', () => {
  it('is able to retrieve deal data', () => {
    let { dealManagement } = makeTestDealManagement([{ size: 5 }]);

    dealManagement.viewDeals();

    expect(dealManagement.deals).toStrictEqual([{ size: 5 }]);
  });
});

describe('creating deals', () => {
  it('saves a deal when assets are selected', () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.makeNewDeal();
    dealManagement.dealForm.size = 5;
    dealManagement.dealForm.assets.push({ name: 'Asset 1' });
    dealManagement.save();

    expect(mocks.save).toHaveBeenCalledWith({ size: 5, assets: [{ name: 'Asset 1'}] });
    expect(dealManagement.deals).toStrictEqual([{ size: 5, assets: [{ name: 'Asset 1' }] }]);
  });

  it('communicates invalidity when the deal has no asset' , () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.save();

    expect(dealManagement.errors).toStrictEqual(["Deals must be tied to at least one asset"]);
  });
});

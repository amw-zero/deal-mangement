import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { makeDealManagement, makeServer } from './dealManagement.js';

function makeTestDealManagement(overrideOpts = {}) {
  let defaultOpts = { dealContext: [], assetSearchResults: [] };
  let opts = Object.assign(defaultOpts, overrideOpts);

  let save = jest.fn();
  let viewAssets = jest.fn(_ => opts.assetSearchResults);

  let server = makeServer(opts.dealContext, save, viewAssets);
  let dealManagement = makeDealManagement(server);
  let mocks = { save };

  return { dealManagement, mocks }
}

describe('viewing deals', () => {
  it('is able to retrieve deal data', () => {
    let { dealManagement } = makeTestDealManagement({ dealContext: [{ size: 5 }] });

    dealManagement.viewDeals();

    expect(dealManagement.deals).toStrictEqual([{ size: 5 }]);
  });
});

describe('creating deals', () => {
  it('saves a deal when all fields are specified', () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.dealForm.assets.push({ name: 'Asset 1' });
    dealManagement.dealForm.tenant = 'Test Tenant';
    dealManagement.save();

    expect(mocks.save).toHaveBeenCalledWith({ size: 5, assets: [{ name: 'Asset 1'}], tenant: 'Test Tenant' });
    expect(dealManagement.deals).toStrictEqual([{ size: 5, assets: [{ name: 'Asset 1' }], tenant: 'Test Tenant' }]);
  });

  it('communicates invalidity when the deal has no asset' , () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.save();

    expect(dealManagement.errors).toStrictEqual(["Deals must be tied to at least one asset"]);
  });

  it('is able to save after reporting invalidity', () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.save();

    expect(dealManagement.errors).toStrictEqual(["Deals must be tied to at least one asset"]);

    dealManagement.dealForm.assets.push({ name: 'Asset 1'});
    dealManagement.save();

    expect(dealManagement.errors).toStrictEqual([]);
    expect(dealManagement.deals).toStrictEqual([{ size: 5, assets: [{ name: 'Asset 1' }]}])
  });

  it('supports searching for assets', async () => {
    let asset1 = { name: 'Asset 1'};
    let { dealManagement, mocks } = makeTestDealManagement({ assetSearchResults: [asset1] });
    let assets = [
      asset1,
      { name: 'Asset 2' },          
    ];

    dealManagement.dealForm.size = 5;
    dealManagement.dealForm.assets = assets;

    let onDone = await dealManagement.searchForAssets('Asset 1');
    onDone(dealManagement);

    expect(dealManagement.assetSearchResults).toStrictEqual([{ name: 'Asset 1' }]);
  });
});

describe('view state', () => {
  it('resets the form object when requested', () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.errors = ["Error"];
    dealManagement.assetSearchResults = [{ name: 'Found Asset' }]

    dealManagement.resetDealForm();

    expect(dealManagement.dealForm).toStrictEqual({ assets: [] });
    expect(dealManagement.errors).toStrictEqual([]);
    expect(dealManagement.assetSearchResults).toStrictEqual([]);
  });
});
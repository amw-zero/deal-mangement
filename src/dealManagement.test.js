import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { makeDealManagement, makeServer } from './dealManagement.js';
import { dealsResponse, dealsErrorResponse } from './responses.js';

function makeTestDealManagement(overrideOpts = {}) {
  let defaultOpts = { dealContext: [], assetContext: [], assetSearchResults: [], stubRequests: {} };
  let opts = Object.assign(defaultOpts, overrideOpts);

  let httpClient = jest.fn(request => {
    if (request.path === '/deals.json' && request.method === 'GET') {
      return opts.dealContext;
    } else if (request.path.includes('/assets?search')) {
      return opts.assetSearchResults;
    } else if (request.path.includes('/assets')) {
      return opts.assetContext;
    }

    return [];
  });

  let server = makeServer(httpClient);
  let dealManagement = makeDealManagement(server);
  let mocks = { httpClient };

  return { dealManagement, mocks }
}

describe('viewing deals', () => {
  it('is able to retrieve deal data', async () => {
    let { dealManagement } = makeTestDealManagement({ dealContext: dealsResponse() });

    let onDone = await dealManagement.viewDeals();
    onDone(dealManagement);

    expect(dealManagement.deals).toStrictEqual([{
      tenant: 'Test Tenant',
      descriptionLabel: 'Size: 5 | Assets: Test Asset'
    }]);
  });

  it('displays an error when deal data cannot be retrieved', async() => {
    let { dealManagement } = makeTestDealManagement({ dealContext: dealsErrorResponse() });

    let onDone = await dealManagement.viewDeals();
    onDone(dealManagement);

    expect(dealManagement.deals).toStrictEqual([]);
    expect(dealManagement.errors).toStrictEqual(['Internal Server Error'])
  });
});

describe('creating deals', () => {
  it('saves a deal when all fields are specified', () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.dealForm.assets.push({ name: 'Asset 1' });
    dealManagement.dealForm.tenant = 'Test Tenant';
    dealManagement.save();

    expect(mocks.httpClient).toHaveBeenCalledWith({
      path: '/deals',
      method: 'POST',
      params:{ size: 5, assets: [{ name: 'Asset 1'}], tenant: 'Test Tenant' }
    });
    expect(dealManagement.deals).toStrictEqual([
      { 
        tenant: 'Test Tenant',
        descriptionLabel: 'Size: 5 | Assets: Asset 1'
      }
    ]);
  });

  it('communicates invalidity when the deal has no asset' , () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.save();

    expect(dealManagement.errors).toStrictEqual(["Deals must be tied to at least one asset"]);
    expect(mocks.httpClient).not.toHaveBeenCalled();
  });

  it('is able to save after reporting invalidity', () => {
    let { dealManagement, mocks } = makeTestDealManagement();

    dealManagement.dealForm.size = 5;
    dealManagement.save();

    expect(dealManagement.errors).toStrictEqual(["Deals must be tied to at least one asset"]);

    dealManagement.dealForm.assets.push({ name: 'Asset 1'});
    dealManagement.save();

    expect(dealManagement.errors).toStrictEqual([]);
    expect(dealManagement.deals).toStrictEqual([
      { tenant: undefined, descriptionLabel: 'Size: 5 | Assets: Asset 1' }
    ]);
  });

  it('supports searching for assets', async () => {
    let asset1 = { name: 'Asset 1'};
    let { dealManagement } = makeTestDealManagement({ assetSearchResults: [asset1] });
    let assets = [
      asset1,
      { name: 'Asset 2' },          
    ];

    dealManagement.dealForm.size = 5;
    dealManagement.dealForm.assets = assets;

    let onDone = await dealManagement.searchForAssets('Asset 1');
    onDone(dealManagement);

    expect(dealManagement.selectableAssets).toStrictEqual([{ name: 'Asset 1' }]);
  });

  it('can display all assets', async () => {
    let asset1 = { name: 'Asset 1'};    
    let { dealManagement } = makeTestDealManagement({ assetContext: [asset1] });

    let onDone = await dealManagement.viewAssets();
    onDone(dealManagement);

    expect(dealManagement.selectableAssets).toStrictEqual([{ name: 'Asset 1' }]);
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
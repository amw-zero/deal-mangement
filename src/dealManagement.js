function DealForm() {
  return {
    assets: []
  };
}

function assetString(assets) {
  if (!assets) {
    return "none";
  }
  return assets.map(a => a.name).join(", ")
}

function transformDeal(deal) {
  return {
    tenant: deal.tenant,
    descriptionLabel: `Size: ${deal.size} | Assets: ${assetString(deal.assets)}`
  };
}

function transformResponse(dealResponse) {
  return dealResponse.map(transformDeal);
}

let makeDealManagement = (server) => {
  return {
    dealForm: new DealForm(),
    deals: [],
    errors: [],
    tenant: null,
    assetSearchResults: [],
    server,
    resetDealForm() {
      this.dealForm = new DealForm();
      this.errors = [];
      this.assetSearchResults = [];
    },
    save() {
      let invalidExplanation = this.validate();
      if (invalidExplanation) {
        this.errors.push(invalidExplanation);
        return;
      } else {
        this.errors = [];
      }

      let newDeal = Object.assign({}, this.dealForm);

      this.deals.push(transformDeal(newDeal));
      let request = {
        path: '/deals',
        method: "POST",
        params: newDeal,
      };
      server.perform(request);
    },
    async searchForAssets(searchText) {
      let request = {
        path: `/assets?search=${searchText}`,
        method: "GET"
      }
      let results = await server.perform(request);
      return (draft) => draft.assetSearchResults = results;
    },

    validate() {
      if (this.dealForm.assets.length === 0) {
        return "Deals must be tied to at least one asset"
      }

      return null;
    },
    async viewDeals() {
      let dealResponse = await server.perform({ path: '/deals.json', method: "GET" });
      if (dealResponse.error) {
        return (draft) => { 
          draft.dealResponse = [];
          draft.errors = [dealResponse.error];
        }
      }

      let deals = transformResponse(dealResponse)
      return (draft) => { draft.deals = deals }
    }
  };
};

let makeServer = (httpClient) => {
  return {
    async perform(request) {
      return httpClient(request);
    }
  };
};

export { makeDealManagement, makeServer };

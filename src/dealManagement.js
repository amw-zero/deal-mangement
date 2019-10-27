function DealForm() {
  return {
    assets: []
  };
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

      let newDeal = Object.assign({}, this.dealForm) 
      this.deals.push(newDeal);
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
      console.log("Viewing deals");
      let deals = await server.perform({ path: '/deals', method: "GET" });
      console.log("received deals from server");
      console.log(deals);
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

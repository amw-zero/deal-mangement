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
    server,
    makeNewDeal() {
      this.dealForm = new DealForm();
      this.errors = [];
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
      server.save(newDeal);
    },
    validate() {
      if (this.dealForm.assets.length === 0) {
        return "Deals must be tied to at least one asset"
      }

      return null;
    },
    viewDeals() {
      this.deals = server.viewDeals()
    }
  };
};

let makeServer = (dealContext, save) => {
  return {
    viewDeals() {
      return dealContext;
    },
    save
  };
};

export { makeDealManagement, makeServer };

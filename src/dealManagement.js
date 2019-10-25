let makeDealManagement = (server) => {
  return {
    dealForm: {},
    deals: [],
    server,
    makeNewDeal() {
      this.dealForm = {};
    },
    save() {
      let newDeal = Object.assign({}, this.dealForm);
      this.deals.push(newDeal);
      server.save(newDeal);
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

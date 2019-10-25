let makeDealManagement = (server) => {
  return {
    size: 0,
    deals: [],
    server,
    save() {
      server.save({ size: this.size });
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

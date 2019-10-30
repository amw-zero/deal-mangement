let asset = {
  name: 'Test Asset'
};

let dealsResponse = (size = 5, tenant = 'Test Tenant', assets = [asset]) => {
  return [
    {
      size,
      tenant,
      assets
    }
  ];
};

let dealsErrorResponse = () => {
  return  {
    status: 500,
    error: 'Internal Server Error'
  }
};

export { dealsResponse, dealsErrorResponse };
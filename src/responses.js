let asset = {
  name: 'Test Asset'
};

let dealResponse = (size = 5, tenant = 'Test Tenant', assets = [asset]) => {
  return [
    {
      size,
      tenant,
      assets
    }
  ];
};

export { dealResponse };
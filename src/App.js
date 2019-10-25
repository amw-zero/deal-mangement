import React, { useState, useEffect } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Input, Select } from 'antd';
import produce from 'immer';

import { makeDealManagement, makeServer } from './dealManagement.js';

const { Option } = Select;

let deals = [
 { size: 100 },
 { size: 200 },
 { size: 300 },
 { size: 400 }
];

let assets = [
 { name: 'Asset 1' },
 { name: 'Asset 2' }
];

let server = makeServer(deals, () => { })
let dealManagement = makeDealManagement(server);

function App() {
  let [dealBehavior, setDealBehavior] = useState(dealManagement);

  useEffect(() => {
    execute(draftBehavior => draftBehavior.viewDeals());
  }, []);

  function execute(command) {
    let nextState = produce(dealBehavior, command);
    setDealBehavior(nextState);
  }

  function dealElements() {
    return dealBehavior.deals.map(dealElement);
  }

  function dealElement(deal, i) {
    return <div key={i}>
      <p>{deal.size}, assets: {assetString(deal.assets)}</p>
    </div>
  }

  function assetString(assets) {
    if (!assets) {
      return "none";
    }
    return assets.join(", ")
  }

  function handleSize(event) {
    let size = event.target.value;
    execute(draftBehavior => { draftBehavior.dealForm.size = size });
  }

  function newDeal() {
    execute(draftBehavior => { draftBehavior.makeNewDeal() });
  }

  function saveDeal() {
    execute(draftBehavior => { 
      draftBehavior.save()
      draftBehavior.makeNewDeal();
    });
  }

  function handleAsset(asset) {
    execute(draftBehavior => { draftBehavior.dealForm.assets.push(asset) });
  }

  console.log(dealBehavior);

  return (
    <div className="App">
      <button onClick={newDeal}>
        New Deal
      </button>
      <button onClick={saveDeal}>
        Save Deal
      </button>

      <Input placeholder="size" onChange={handleSize}/>
      
      <Select placeholder="Select Asset" style={{ width: 200 }} onChange={handleAsset}>
        <Option value={assets[0].name}>{assets[0].name}</Option>
        <Option value={assets[1].name}>{assets[1].name}</Option>        
      </Select>

      { dealElements() }
      { dealBehavior.errors.length > 0 ? dealBehavior.errors[0] : null }
    </div>
  );
}

export default App;

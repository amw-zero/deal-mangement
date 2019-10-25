import React, { useState, useEffect } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Input } from 'antd';
import produce from 'immer';

import { makeDealManagement, makeServer } from './dealManagement.js';

let deals = [
 { size: 100 },
 { size: 200 },
 { size: 300 },
 { size: 400 }
];

let server = makeServer(deals, () => { })
let dealManagement = makeDealManagement(server);

function App() {
  let [dealBehavior, setDealBehavior] = useState(dealManagement);

  useEffect(() => {
    execute(draftBehavior => draftBehavior.viewDeals());
  });

  function execute(command) {
    setDealBehavior(produce(dealBehavior, command));
  }

  function dealTags() {
    return dealBehavior.deals.map(dealTag);
  }

  function dealTag(deal) {
    return <p key={deal.size}>{deal.size}</p>;
  }

  function handleSize(event) {
    let size = event.target.value;
    execute(draftBehavior => { draftBehavior.dealForm.size = size });
  }

  function newDeal() {
    execute(draftBehavior => draftBehavior.makeNewDeal());
  }

  function saveDeal() {
    execute(draftBehavior => { 
      draftBehavior.save()
      draftBehavior.makeNewDeal();
    });
  }

  return (
    <div className="App">
      <button onClick={newDeal}>
        New Deal
      </button>
      <button onClick={saveDeal}>
        Save Deal
      </button>

      <Input placeholder="size" onChange={handleSize}/>

      { dealTags() }
    </div>
  );
}

export default App;

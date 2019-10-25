import React from 'react';
import logo from './logo.svg';
import './App.css';

import { makeDealManagement, makeServer } from './dealManagement.js';

let deals = [
 { size: 100 },
 { size: 200 },
 { size: 300 },
 { size: 400 }
];

let server = makeServer(deals, () => { })
let dealBehavior = makeDealManagement(server);
dealBehavior.viewDeals();

function dealTags() {
  return dealBehavior.deals.map(dealTag);
}

function dealTag(deal) {
  return <p key={deal.size}>{deal.size}</p>;
}

function App() {
  return (
    <div className="App">
      { dealTags() }
    </div>
  );
}

export default App;

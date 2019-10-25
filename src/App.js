import React, { useState, useEffect } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Button, Form, Input, Modal, Select } from 'antd';
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
  let [isDealModalVisible, setIsDealModalVisible] = useState(false);

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

  function showNewDealForm() {
    setIsDealModalVisible(true);
    execute(draftBehavior => { 
      draftBehavior.makeNewDeal() 
    });
  }

  function hideForm() {
    setIsDealModalVisible(false);
  }

  function saveDeal() {
    setIsDealModalVisible(false);
    execute(draftBehavior => { draftBehavior.save() });
  }

  function handleAsset(asset) {
    execute(draftBehavior => { draftBehavior.dealForm.assets.push(asset) });
  }

  return (
    <div className="App">
      <Button type="primary" onClick={showNewDealForm}>
        Add deal
      </Button>

      <Modal 
        visible={isDealModalVisible} 
        onCancel={hideForm} 
        okText={"Save"} 
        onOk={saveDeal}>

        <Form layout="vertical">

          <Form.Item label="Add deal">
          </Form.Item>

          <Form.Item>
            <Input placeholder="size" onChange={handleSize}/>
          </Form.Item>
        
          <Form.Item>
            <Select placeholder="Select Asset" style={{ width: 200 }} onChange={handleAsset}>
              <Option value={assets[0].name}>{assets[0].name}</Option>
              <Option value={assets[1].name}>{assets[1].name}</Option>        
            </Select>
          </Form.Item>

        </Form>

      </Modal>

      { dealElements() }
      { dealBehavior.errors.length > 0 ? dealBehavior.errors[0] : null }
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Alert, Button, Form, Input, List, Modal, Select } from 'antd';
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


function Deal(props) {
  function assetString(assets) {
    if (!assets) {
      return "none";
    }
    return assets.join(", ")
  }

  return <List.Item>
    <List.Item.Meta
      title="Deal"
      description={props.deal.size}
    />

    Assets: {assetString(props.deal.assets)}
  </List.Item>;
}

function DealList(props) {
  return <List
    itemLayout="vertical"
    dataSource={props.deals}
    renderItem={ deal => (
      <Deal deal={deal}></Deal>
    )}
  />
}

function App() {
  let [dealBehavior, setDealBehavior] = useState(dealManagement);
  let [isDealModalVisible, setIsDealModalVisible] = useState(false);

  useEffect(() => {
    updateState(draftBehavior => draftBehavior.viewDeals());
  }, []);

  function updateState(command) {
    let nextState = produce(dealBehavior, command);
    setDealBehavior(nextState);
  }  

  function handleSize(event) {
    let size = event.target.value;
    updateState(draftBehavior => { draftBehavior.dealForm.size = size });
  }

  function showNewDealForm() {
    setIsDealModalVisible(true);
    updateState(draftBehavior => { draftBehavior.makeNewDeal() });
  }

  function hideForm() {
    setIsDealModalVisible(false);
    updateState(draftBehavior => { draftBehavior.makeNewDeal() });    
  }

  function saveDeal() {
    updateState(draftBehavior => { draftBehavior.save() });
    setIsDealModalVisible(dealBehavior.errors.length === 0);    
  }

  function handleAsset(asset) {
    updateState(draftBehavior => { draftBehavior.dealForm.assets.push(asset) });
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

          <Form.Item label="Add deal" />

          <Form.Item>
            <Input placeholder="size" onChange={handleSize}/>
          </Form.Item>
        
          <Form.Item required={true}>
            <Select placeholder="Select Asset" style={{ width: 200 }} onChange={handleAsset}>
              <Option value={assets[0].name}>{assets[0].name}</Option>
              <Option value={assets[1].name}>{assets[1].name}</Option>        
            </Select>
          </Form.Item>


          { dealBehavior.errors.length > 0 ? <Alert message={dealBehavior.errors[0]} type="error" /> : null }
        </Form>

      </Modal>

      <DealList deals={dealBehavior.deals} />
    </div>
  );
}

export default App;

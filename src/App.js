import React, { useState, useEffect } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Alert, Button, Form, Input, Layout, List, Menu, Modal, Select } from 'antd';
import produce from 'immer';

import { makeDealManagement, makeServer } from './dealManagement.js';

const { Option } = Select;
const { Header, Content, Footer } = Layout;
const { Search } = Input

let deals = [
 { tenant: 'JCPenny', size: 100 },
 { tenant: 'Starbucks', size: 200 },
 { tenant: 'H&M', size: 300 },
 { tenant: 'Blue Bottle', size: 400 }
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
    <List.Item.Meta title={props.deal.tenant} />

    Size: {props.deal.size} | Assets: {assetString(props.deal.assets)}
  </List.Item>;
}

function DealListHeader(props) {
  return <Button type="default" onClick={props.showNewDealForm}>
    Add deal
  </Button>
}

function DealList(props) {
  return <List
    itemLayout="vertical"
    bordered
    dataSource={props.deals}
    header={<DealListHeader showNewDealForm={props.showNewDealForm}/>}
    renderItem={ deal => (
      <Deal deal={deal} />
    )}
  />
}

function App() {
  let [state, setState] = useState({ 
    dealManagement, 
    isDealModalVisible: false, 
    isAssetSearchLoading: false
  });

  useEffect(() => {
    updateState(draftState => draftState.dealManagement.viewDeals());
  }, []);

  function updateState(command) {
    setState(produce(state, command));
  }  

  function handleSize(event) {
    let size = event.target.value;
    updateState(draftState => { draftState.dealManagement.dealForm.size = size });
  }

  function showNewDealForm() {
    updateState(draftState => { 
      draftState.dealManagement.makeNewDeal() ;
      draftState.isDealModalVisible = true;
    });
  }

  function hideForm() {
    updateState(draftState => { 
      draftState.dealManagement.makeNewDeal();
      draftState.isDealModalVisible = false;
    });    
  }

  function saveDeal() {
    updateState(draftState => { 
      draftState.dealManagement.save();
      draftState.isDealModalVisible = draftState.dealManagement.errors.length !== 0;
    });
  }

  function handleAsset(asset) {
    updateState(draftState => { draftState.dealManagement.dealForm.assets.push(asset) });
  }

  function handleTenant(event) {
    let tenant = event.target.value;
    updateState(draftState => { draftState.dealManagement.dealForm.tenant = tenant });
  }

  function searchForAssets(searchText) {
    updateState(draftState => { draftState.isAssetSearchLoading = true });
    setTimeout(() => updateState(draftState => { draftState.isAssetSearchLoading= false }), 1000);
  }

  function assetSearchValidateStatus() {
    return state.isAssetSearchLoading ? "validating" : "";
  }

  return (
    <Layout>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['0']}
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="0">Deal Management</Menu.Item>          
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 64 }}>        
        <Modal 
          visible={state.isDealModalVisible} 
          onCancel={hideForm} 
          okText={"Save"} 
          onOk={saveDeal}>

            <Form layout="vertical">

              <Form.Item label="Add deal" />

              <Form.Item>
                <Input placeholder="Size" value={state.dealManagement.dealForm.size} onChange={handleSize}/>
              </Form.Item>

              <Form.Item>
                <Input placeholder="Tenant" value={state.dealManagement.dealForm.tenant} onChange={handleTenant}/>              
              </Form.Item>

              <Form.Item hasFeedback validateStatus={assetSearchValidateStatus()}>
                <Search placeholder="Search for assets" onChange={searchForAssets} />
              </Form.Item>
            
              <Form.Item required={true}>
                <Select placeholder="Select Asset" style={{ width: 200 }} value={state.dealManagement.dealForm.assets[0]} onChange={handleAsset}>
                  <Option value={assets[0].name}>{assets[0].name}</Option>
                  <Option value={assets[1].name}>{assets[1].name}</Option>        
                </Select>
              </Form.Item>

              { state.dealManagement.errors.length > 0 ? <Alert message={state.dealManagement.errors[0]} type="error" /> : null }
          </Form>

        </Modal>
        <div style={ { margin: 24, background: '#fff' } }>          
          <DealList deals={state.dealManagement.deals} showNewDealForm={showNewDealForm} />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Deal Manager ©2019 Created by amw-zero</Footer>
    </Layout>
  );
}

export default App;

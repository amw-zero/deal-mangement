import React, { createContext, useContext, useEffect, useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Alert, Button, Form, Input, Layout, List, Menu, Modal, Steps } from 'antd';
import produce from 'immer';

import { makeDealManagement, makeServer } from './dealManagement.js';

const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Step } = Steps;

let assets = [
  { name: 'Asset 1' },
  { name: 'Asset 2' }
];

let deals = [
  { tenant: 'JCPenny', size: 100 },
  { tenant: 'Starbucks', size: 200 },
  { tenant: 'H&M', size: 300 },
  { tenant: 'Blue Bottle', size: 400, assets: assets }
];

let searchedAssets = [
  { name: 'Asset 1' }
];

async function stubHttpClient(request) {
  if (request.path === '/deals.json' && request.method === 'GET') {
    return deals;

    let response = await fetch('/deals.json')
    return await response.json();
  } else if (request.path.includes('/assets?search')) {
    return searchedAssets;
  } else if (request.path.includes('/assets')) {
    return assets;
  }

  return [];  
}

let server = makeServer(stubHttpClient);
let dealManagement = makeDealManagement(server);

const StateContext = createContext();

function Deal(props) {  
  return <List.Item>
    <List.Item.Meta title={props.deal.tenant} />
    {props.deal.descriptionLabel}
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

function DealForm(props) {
  let [state, updateState] = useContext(StateContext);
  let [currentStep, setCurrentStep] = useState(0);
  let [selectedAssets, setSelectedAssets] = useState([]);

  const steps = [
    {
      title: 'Select assets',
      content: <SelectAssetsStep />
    },
    {
      title: 'Enter details',
      content: <Form layout="vertical">
        <Form.Item label="Size">
          <Input placeholder="Size" value={state.dealManagement.dealForm.size} onChange={handleSize}/>
        </Form.Item>        
        <Form.Item label="Tenant">
          <Input placeholder="Tenant" value={state.dealManagement.dealForm.tenant} onChange={handleTenant}/>              
        </Form.Item>
      </Form>
    },
    {
      title: 'Review',
      content: <ReviewStep />,
    },
  ];

  function SelectAssetsStep() {
    function searchForAssets(searchText) {
      updateState(draftState => { draftState.isAssetSearchLoading = true });
      setTimeout(async () => {
        let onDone = await state.dealManagement.searchForAssets(searchText);
        updateState(draftState => {
          draftState.isAssetSearchLoading= false;
          onDone(draftState.dealManagement);
        });
      }, 1000);
    }    

    return <Form layout="vertical">
      <Form.Item label="Selected">
        <List
          itemLayout="vertical"
          bordered
          dataSource={selectedAssets}
          renderItem={ asset => (
            <List.Item>{asset.name}</List.Item>
          )}
        />
      </Form.Item>
      <Form.Item hasFeedback validateStatus={assetSearchValidateStatus()}>
        <Search placeholder="Search for assets" onSearch={searchForAssets} />
      </Form.Item>
    
      <Form.Item label="Your assets">
        <List
          itemLayout="vertical"
          bordered
          dataSource={state.dealManagement.selectableAssets}
          renderItem={ asset => (
            <List.Item style={{ cursor: 'pointer '}} onClick={() => handleAsset(asset)}>{asset.name}</List.Item>
          )}
        />
      </Form.Item>

      { state.dealManagement.errors.length > 0 ? <Alert message={state.dealManagement.errors[0]} type="error" /> : null }
    </Form>
  }

  function ReviewStep() {
    return <div>
      <Form layout="vertical">
        <Form.Item label="Selected assets">
          <List
            itemLayout="vertical"
            bordered
            dataSource={selectedAssets}
            renderItem={ asset => (
              <List.Item>{asset.name}</List.Item>
            )}
          />
        </Form.Item>

        <h4>Details</h4>
        <Form.Item label="Size">
          <Input placeholder="Size" value={state.dealManagement.dealForm.size} onChange={handleSize}/>
        </Form.Item>        
        <Form.Item label="Tenant">
          <Input placeholder="Tenant" value={state.dealManagement.dealForm.tenant} onChange={handleTenant}/>              
        </Form.Item>
      </Form>
    </div>
  }

  function next() {
    setCurrentStep(currentStep + 1);
  }

  function prev() {
    setCurrentStep(currentStep - 1);
  }

  function handleSize(event) {
    let size = event.target.value;
    updateState(draftState => { draftState.dealManagement.dealForm.size = size });
  }

  function handleAsset(asset) {
    setSelectedAssets([asset, ...selectedAssets]);
    updateState(draftState => { draftState.dealManagement.dealForm.assets.push(asset) });
  }

  function handleTenant(event) {
    let tenant = event.target.value;
    updateState(draftState => { draftState.dealManagement.dealForm.tenant = tenant });
  }

  function saveDeal() {
    updateState(draftState => { 
      draftState.dealManagement.save();
      draftState.isDealModalVisible = draftState.dealManagement.errors.length !== 0;
    });
    setCurrentStep(0);    
    setSelectedAssets([]);
  }

  function hideForm() {
    updateState(draftState => { 
      draftState.isDealModalVisible = false;
    });
    setCurrentStep(0);
    setSelectedAssets([]);
  }  

  function assetSearchValidateStatus() {
    return state.isAssetSearchLoading ? "validating" : "";
  }

  function selectedAsset() {
    let assets = state.dealManagement.dealForm.assets;

    return assets[0] ? assets[0].name : undefined;
  }

  function nextButtonEnabled() {
    if (currentStep === 0) {
      return selectedAsset();
    }

    return true;
  }

  function Footer() {
    return <div>
      <Button onClick={hideForm}>Cancel</Button>
      { currentStep > 0 && <Button onClick={prev}>Previous</Button> }
      { currentStep < steps.length - 1 && <Button type="primary" disabled={!nextButtonEnabled()} onClick={next} >Next</Button> }
      { currentStep === steps.length - 1 && <Button type="primary" onClick={saveDeal}>Save</Button> }
    </div>
  }

  return <Modal 
    visible={state.isDealModalVisible}
    onCancel={hideForm}
    closable={false}
    okText={"Next"}
    footer={Footer()}>
      <Steps current={currentStep}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ marginTop: '14px' }}>
        {steps[currentStep].content}
      </div>
  </Modal>;
}

function App() {
  let [state, setState] = useState({ 
    dealManagement, 
    isDealModalVisible: false, 
    isAssetSearchLoading: false
  });

  function updateState(updateFunc) {
    let nextState = produce(state, updateFunc);
    setState(nextState);
  }

  let appState = [
    state,
    updateState
  ];

  useEffect(() => {
    let perform = async () => {
      let onViewDealsDone = await state.dealManagement.viewDeals();
      let onViewAssetsDone = await state.dealManagement.viewAssets();
      updateState(draft => {
        onViewDealsDone(draft.dealManagement);
        onViewAssetsDone(draft.dealManagement);
      });    
    };
    perform();
  }, []);

  function showNewDealForm() {
    updateState(draftState => { 
      draftState.dealManagement.resetDealForm() ;
      draftState.isDealModalVisible = true;
    });
  }  

  return (
    <StateContext.Provider value={appState}>
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
          <DealForm />
          <div style={ { margin: 24, background: '#fff' } }>          
            <DealList deals={state.dealManagement.deals} showNewDealForm={showNewDealForm} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Deal Manager ©2019 Created by amw-zero</Footer>
      </Layout>
    </StateContext.Provider>
  );
}

export default App;

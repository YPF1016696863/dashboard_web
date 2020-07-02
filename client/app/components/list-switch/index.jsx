/* eslint-disable func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Form,
  Select,
  TreeNode,
  Checkbox,
  Input,
  Switch,
  Tree,
  Button,
  Layout,
  Drawer,
  Modal
} from 'antd';
// import { appSettingsConfig } from '@/config/app-settings';
import './index.less';
import { Dashboard } from '@/services/dashboard';

let check=false;
class ListSwitch extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      swicthState:check,
    };
    Dashboard.get(
      { slug: this.props.slugId },
      dashboard => {
        // console.log(dashboard.background_image.slice(1,-1).split(",")[2]);
        check=dashboard.background_image.slice(1,-1).split(",")[2]==="true";
        // console.log(check);
        this.setState({
          swicthState:check,
      }); 
      },
      rejection => {
        
        
      }
    );
    
    
  }

  componentDidMount() {
    const { slugId } = this.props; 
    if (slugId) {
      this.getDashboard(slugId);
    }
  }

  onSwitchChange(e){
    console.log(e);
    this.props.getListSwitchCb(e);

  }

  getDashboard = slugId => {
    
    // Dashboard.get(
    //   { slug: slugId },
    //   dashboard => {
    //     console.log(dashboard.background_image.slice(1,-1).split(",")[2]);
    //     check=dashboard.background_image.slice(1,-1).split(",")[2]==="true";
    //     console.log(check);
    //     this.setState({
    //       swicthState:true,
    //     }); 
    //   },
    //   rejection => {
        
        
    //   }
    // );
  };
  

  render() {

    return (
      <div>
        <Switch 
          defaultChecked={this.state.swicthState} 
          checkedChildren="开启组件列表" 
          unCheckedChildren="关闭组件列表"
          onChange={e=>this.onSwitchChange(e)}
        />              
      </div>
    );
  }
}

ListSwitch.propTypes = {
  getListSwitchCb: PropTypes.func,  
  slugId: PropTypes.string,
};
ListSwitch.defaultProps = {
  getListSwitchCb: a => {},
  slugId: null,
};

export default function init(ngModule) {
  ngModule.component(
    'listSwitch',
    react2angular(
      Form.create()(ListSwitch),
      Object.keys(ListSwitch.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

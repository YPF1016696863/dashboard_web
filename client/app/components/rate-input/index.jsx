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
  Tree,
  Button,
  Layout,
  Drawer,
  Modal
} from 'antd';
// import { appSettingsConfig } from '@/config/app-settings';
import './index.less';
import { Dashboard } from '@/services/dashboard';

class RateInput extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      rateState:"20"
    };
  }

  componentDidMount() {
    const { slugId } = this.props;
    if (slugId) {
      this.getDashboard(slugId);
    }
  }

  onRateChange(e){
    // console.log(e);
    this.props.getRateCb(e);

  }

  getDashboard = slugId => {
    
    Dashboard.get(
      { slug: slugId },
      dashboard => {
        this.setState({
          rateState:dashboard.background_image===null?
          "2":dashboard.background_image.slice(1,-1).split(",")[1]
        });
        
       
      },
      rejection => {
        
        
      }
    );
  };
  

  render() {

    return (
     
      <Input 
        placeholder={this.state.rateState} 
        style={{    width: '17%',height:' 3%'}} 
        onChange={e=>this.onRateChange(e.target.value)} 
      />        
     
    );
  }
}

RateInput.propTypes = {
  getRateCb: PropTypes.func,  
  slugId: PropTypes.string,
};
RateInput.defaultProps = {
  getRateCb: a => {},
  slugId: null,
};

export default function init(ngModule) {
  ngModule.component(
    'rateInput',
    react2angular(
      Form.create()(RateInput),
      Object.keys(RateInput.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

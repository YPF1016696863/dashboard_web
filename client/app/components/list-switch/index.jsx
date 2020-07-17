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


class ListSwitch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      swicthState: null,
      load: false,
      selected: false,
      gridState:"3"
    };
    Dashboard.get(
      { slug: this.props.slugId },
      dashboard => {
        // console.log(dashboard.background_image.slice(1,-1).split(",")[2]);
        // let check=dashboard.background_image.slice(1,-1).split(",")[2]==="true";
        // console.log((dashboard.background_image.slice(1,-1).split(",")[3]));
        this.setState({
          swicthState: dashboard.background_image===null?true:
          dashboard.background_image.slice(1, -1).split(",")[2] === "true",
          gridState:dashboard.background_image===null?"3":
          dashboard.background_image.slice(1, -1).split(",")[3],
          load: true
        });
      },
      rejection => {


      }
    );


  }

  componentDidMount() {
    const { slugId } = this.props;
    // if (slugId) {
    //   this.getDashboard(slugId);
    // }
  }

  onSwitchChange(e) {
    // console.log(e);
    this.setState({
      selected: e
    });
    this.props.getListSwitchCb(e);

  }

  onGridChange(e){
    // console.log(e);
    this.props.getGridCb(e);

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
      <span>
        {this.state.load && (
        <Switch
          defaultChecked={this.state.swicthState}
          loading={!this.state.load}
          checkedChildren="手动布局"
          unCheckedChildren="自动布局"
          onChange={e => this.onSwitchChange(e)}
        />
        )}
        {!this.state.selected&&(
          <span>
            <span className="control-label" style={{color:'#fff'}}>组件数(1/2/3/6)：</span>
            <Input 
              placeholder={this.state.gridState} 
              style={{width: '20%',height: '3%'}}
              onChange={e=>this.onGridChange(e.target.value)}
            />
          </span>
         

        )}
      </span>
    );
  }
}

ListSwitch.propTypes = {
  getListSwitchCb: PropTypes.func,
  slugId: PropTypes.string,
  getGridCb: PropTypes.func,  
};
ListSwitch.defaultProps = {
  getListSwitchCb: a => { },
  slugId: null,
  getGridCb: a => {},
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

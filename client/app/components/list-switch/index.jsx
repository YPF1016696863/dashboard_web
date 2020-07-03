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
      gridState:0
    };
    Dashboard.get(
      { slug: this.props.slugId },
      dashboard => {
        // console.log(dashboard.background_image.slice(1,-1).split(",")[2]);
        // let check=dashboard.background_image.slice(1,-1).split(",")[2]==="true";
        // console.log((dashboard.background_image.slice(1,-1).split(",")[3]));
        this.setState({
          swicthState: dashboard.background_image.slice(1, -1).split(",")[2] === "true",
          gridState:dashboard.background_image.slice(1, -1).split(",")[3],
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
      <div>
        {this.state.load && (
        <Switch
          defaultChecked={this.state.swicthState}
          loading={!this.state.load}
          checkedChildren="开启组件列表"
          unCheckedChildren="关闭组件列表"
          onChange={e => this.onSwitchChange(e)}
        />
        )}
        {!this.state.selected&&(
          <div>
            <span className="control-label" style={{color:'#fff'}}>组件数(1/2/3/6)：</span>
            <Input 
              placeholder={this.state.gridState} 
              onChange={e=>this.onGridChange(e.target.value)}
            />
          </div>
         

        )}
      </div>
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

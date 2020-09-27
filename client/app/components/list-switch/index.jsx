/* eslint-disable func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Form,
  Input,
  Switch,
  Radio
} from 'antd';
// import { appSettingsConfig } from '@/config/app-settings';
import './index.less';
import { Dashboard } from '@/services/dashboard';

let editStateTemp = true;
let swicthStateTemp = true;
let checked = 1;
class ListSwitch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      swicthState: true,
      // load: false,
      // selected: true,
      gridState: "3",
      // editState: true,
      // value: 1,
    };
    Dashboard.get(
      { slug: this.props.slugId },
      dashboard => {
        // console.log(dashboard.background_image.slice(1,-1).split(",")[5]);
        // let check=dashboard.background_image.slice(1,-1).split(",")[2]==="true";
        // console.log((dashboard.background_image.slice(1,-1).split(",")[3]));
        editStateTemp = dashboard.background_image === null ? true :
          dashboard.background_image.slice(1, -1).split(",")[5] === "true";
        swicthStateTemp = dashboard.background_image === null ? true :
          dashboard.background_image.slice(1, -1).split(",")[2] === "true";
        checked = 1;
        if (!editStateTemp && swicthStateTemp) {
          checked = 1;
        } else if (!editStateTemp && !swicthStateTemp) {
          checked = 2;
        } else {
          checked = 3;
        }
        console.log(checked);
        this.setState({
          swicthState: dashboard.background_image === null ? true :
            dashboard.background_image.slice(1, -1).split(",")[2] === "true",
          // editState: dashboard.background_image === null ? true :
          //   dashboard.background_image.slice(1, -1).split(",")[5] === "true",
          gridState: dashboard.background_image === null ? "3" :
            dashboard.background_image.slice(1, -1).split(",")[3],
          // load: true,
          // checkedState: checked
        });
      },
      rejection => {


      }
    );


  }

  componentDidMount() {
  }

  // 手动布局
  // 自动布局
  // 固定
  onChange = e => {
    // console.log(e.target.value);
    switch (e.target.value) {
      case 1:
        console.log("手动布局");
        swicthStateTemp = true;
        editStateTemp = false;
        break;
      case 2:
        console.log("自动布局");
        swicthStateTemp = false;
        editStateTemp = false;
        break;
      case 3:
        console.log("固定");
        swicthStateTemp = true;
        editStateTemp = true;
        break;
      default:
        swicthStateTemp = true;
        editStateTemp = true;
        break;
    }
    // console.log(swicthStateTemp);
    // console.log(editStateTemp);
    this.setState({
      // editState: editStateTemp,
      swicthState: swicthStateTemp,
    });
    this.props.getListSwitchCb(swicthStateTemp);
    this.props.getEditSwitchCb(editStateTemp);
  };

  // onSwitchChange(e) {
  //   this.setState({
  //     swicthState: e
  //   });
  //   this.props.getListSwitchCb(e);
  // }

  // onEditChange(e) {
  //   this.setState({
  //     editState: e
  //   });
  //   this.props.getEditSwitchCb(e);
  // }

  onGridChange(e) {
    this.props.getGridCb(e);
  }



  render() {
    // console.log(this.state.checkedState);
    return (
      <span>
        <Radio.Group
          onChange={this.onChange}
          defaultValue={(function () {
            console.log(checked);
            return checked;
          })()
          }
        >
          <Radio style={{ color: '#fff' }} value={1}>手动布局</Radio>
          <Radio style={{ color: '#fff' }} value={2}>自动布局</Radio>
          <Radio style={{ color: '#fff' }} value={3}>固定</Radio>
        </Radio.Group>
        {/* {this.state.load && (
          <Switch
            defaultChecked={this.state.swicthState}
            loading={!this.state.load}
            checkedChildren="手动布局"
            unCheckedChildren="自动布局"
            onChange={e => this.onSwitchChange(e)}
          />
        )} */}
        <br />
        {!this.state.swicthState && (
          <span>
            <span className="control-label" style={{ color: '#fff' }}>组件数(1/2/3/6)：</span>
            <Input
              placeholder={this.state.gridState}
              style={{ width: '20%', height: '3%' }}
              onChange={e => this.onGridChange(e.target.value)}
            />
          </span>
        )}
        {/* {this.state.load && (
          <Switch
            defaultChecked={this.state.editState}
            loading={!this.state.load}
            checkedChildren="固定"
            unCheckedChildren="可动"
            onChange={e => this.onEditChange(e)}
          />
        )} */}
      </span>
    );
  }
}

ListSwitch.propTypes = {
  getListSwitchCb: PropTypes.func,
  slugId: PropTypes.string,
  getGridCb: PropTypes.func,
  getEditSwitchCb: PropTypes.func,
};
ListSwitch.defaultProps = {
  getListSwitchCb: a => { },
  slugId: null,
  getGridCb: a => { },
  getEditSwitchCb: a => { },
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

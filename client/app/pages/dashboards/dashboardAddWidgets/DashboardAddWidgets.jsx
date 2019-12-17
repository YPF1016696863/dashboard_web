import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { angular2react } from 'angular2react';
import { Modal, Button } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';

import './DashboardAddWidgets.less';
import { ChartsListSelectView } from '../charts-list-select';

let ChartsListSelectViewDOM;

class DashboardAddWidgets extends React.Component {
  /*
    constructor(props) {
      super(props);
    }
    */
  state = { visible: false, selectedWidget: null };

  componentDidMount() {
    ChartsListSelectViewDOM = angular2react(
      'chartsListSelectView',
      ChartsListSelectView,
      window.$injector
    );
  }

  // #20263B
  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
    this.props.addWidgetCb({widget:this.state.selectedWidget,paramMapping:{}});
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  selectWidgetCb = selectedWidget => {
    if(selectedWidget) {
      this.setState({
        selectedWidget
      });
    }
  };

  render() {
    return (
      <div>
        <span onClick={this.showModal}>添加可视化组件</span>
        <Modal
          destroyOnClose
          title="添加可视化组件"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="60vw"
          cancelText="取消"
          okText="添加"
        >
          <ChartsListSelectViewDOM selectWidgetCb={this.selectWidgetCb} />
        </Modal>
      </div>
    );
  }
}

DashboardAddWidgets.propTypes = {
  addWidgetCb: PropTypes.func
};
DashboardAddWidgets.defaultProps = {
  addWidgetCb: data => {}
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardAddWidgets',
    react2angular(
      DashboardAddWidgets,
      Object.keys(DashboardAddWidgets.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

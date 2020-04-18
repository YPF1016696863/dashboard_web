import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { angular2react } from 'angular2react';
import { Modal, Button } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';

import './DashboardAddWidgets.less'; 
import { Dashboard } from '@/services/dashboard';
import { currentUser } from '@/services/auth';
import LoadingState from '@/components/items-list/components/LoadingState';
import { ChartsListSelectView } from '../charts-list-select';

let ChartsListSelectViewDOM;

class DashboardAddWidgets extends React.Component {
  /*
    constructor(props) {
      super(props);
    }
    */
  state = {
    visible: false,
    selectedWidget: null,
    parameterMappings: null,
    isLoaded: false,
    dashboard: null
  };

  componentDidMount() {
    const { slugId } = this.props;

    if (slugId) {
      this.getDashboard(slugId);
    }

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
    this.props.addWidgetCb({
      widget: this.state.selectedWidget,
      paramMapping: this.state.parameterMappings
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  selectWidgetCb = (selectedWidget, parameterMappings) => {
    if (selectedWidget) {
      this.setState({
        selectedWidget,
        parameterMappings: parameterMappings || []
      });
    }
  };

  getDashboard = slugId => {
    this.setState({
      isLoaded: false,
      dashboard: null
    });
    Dashboard.get(
      { slug: slugId },
      dashboard => {
        this.setState({
          isLoaded: true,
          dashboard
        });
      },
      rejection => {
        this.setState({
          isLoaded: true,
          dashboard: null
        });
      }
    );
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
          {!this.state.isLoaded ? (
            <div className="align-center-div" style={{ paddingTop: '15%' }}>
              <LoadingState />
            </div>
          ) : (
            <ChartsListSelectViewDOM
              selectWidgetCb={this.selectWidgetCb}
              dashboard={this.state.dashboard}
            />
          )}
        </Modal>
      </div>
    );
  }
}

DashboardAddWidgets.propTypes = {
  addWidgetCb: PropTypes.func,
  slugId: PropTypes.string
};
DashboardAddWidgets.defaultProps = {
  addWidgetCb: data => {},
  slugId: ''
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

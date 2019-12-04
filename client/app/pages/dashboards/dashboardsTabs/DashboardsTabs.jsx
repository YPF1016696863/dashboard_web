import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Dropdown,
  Menu,
  Icon,
  Divider,
  Row,
  Col,
  Tree,
  Input,
  Checkbox,
  notification,
  Statistic,
  Switch,
  Tabs,
  Card
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { angular2react } from 'angular2react';
import * as _ from 'lodash';
import { Paginator } from '@/components/Paginator';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';
import Layout from '@/components/layouts/ContentWithSidebar';

import {
  wrap as itemsList,
  ControllerType
} from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { UrlStateStorage } from '@/components/items-list/classes/StateStorage';

import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Dashboard } from '@/services/dashboard';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';

import { DashboardsPreview } from '@/components/dashboards-preview/dashboards-preview';
import { durationHumanize } from '@/filters';
import PromiseRejectionError from '@/lib/promise-rejection-error';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;
const emptyChartImg = '/static/images/emptyChart.png';

let DashboardsPreviewDOM;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class DashboardsTabs extends React.Component {
  state = {};

  componentDidMount() {
    const { slugId } = this.props;

    this.setState({
      isLoaded: true,
      dashboard: null,
      isDashboardOwner: false
    });

    DashboardsPreviewDOM = angular2react(
      'dashboardsPreview',
      DashboardsPreview,
      window.$injector
    );

    if (slugId) {
      this.getDashboard(slugId);
    }

    notification.destroy();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.slugId !== this.props.slugId) {
      this.getDashboard(nextProps.slugId);
    }
  }

  getDashboard = slugId => {
    this.setState({
      isLoaded: false,
      dashboard: null,
      isDashboardOwner: false
    });
    Dashboard.get(
      { slug: slugId },
      dashboard => {
        this.setState({
          isLoaded: true,
          dashboard,
          isDashboardOwner:
            currentUser.id === dashboard.user.id ||
            currentUser.hasPermission('admin')
        });
      },
      rejection => {
        this.setState({
          isLoaded: true,
          dashboard: null,
          isDashboardOwner: false
        });
      }
    );
  };

  connectCb = (isLoaded, loadSuccess) => {
    this.setState({
      isLoaded
    });
  };

  deleteDashboard = () => {
    notification.error({
      message: `消息`,
      description: '功能暂未开放.',
      placement: 'bottomRight'
    });
  };

  render() {
    const { slugId } = this.props;

    console.log(this.state.isDashboardOwner);

    return (
      <>
        {!this.state.isLoaded && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && this.state.dashboard == null && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <img src={emptyChartImg} alt="" style={{ width: 100 }} />
            <br />
            <p>选择可视化面板</p>
          </div>
        )}
        {this.state.isLoaded && this.state.dashboard != null && (
          <DashboardsPreviewDOM slugId={slugId} connectCb={this.connectCb} />
        )}
      </>
    );
  }
}

DashboardsTabs.propTypes = {
  slugId: PropTypes.string
};

DashboardsTabs.defaultProps = {
  slugId: null
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsTabs',
    react2angular(DashboardsTabs, Object.keys(DashboardsTabs.propTypes), [
      '$scope',
      'appSettings'
    ])
  );
}

init.init = true;

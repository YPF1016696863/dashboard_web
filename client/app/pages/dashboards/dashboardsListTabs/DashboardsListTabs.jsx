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
  Table,
  Alert,
  Empty,
  BackTop,
  Tabs
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

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';

import { DashboardsPreview } from '@/components/dashboards-preview/dashboards-preview';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

let DashboardsPreviewDOM;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class DashboardsListTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true
    });

    DashboardsPreviewDOM = angular2react(
      'dashboardsPreview',
      DashboardsPreview,
      window.$injector
    );
  }

  render() {
    const { slugId } = this.props;

    return (
      <>
        {!this.state.isLoaded && <LoadingState />}
        {this.state.isLoaded && slugId == null && (
          <Empty
            description={<span>请从左侧点击选择可视化面板</span>}
            style={{ paddingTop: '10%'}}
          />
        )}
        {this.state.isLoaded && slugId != null && (
          <Tabs defaultActiveKey="1" type="card" className="queries-tab">
            <TabPane tab="可视化面板预览" key="1">
              <DashboardsPreviewDOM slugId={slugId} />
            </TabPane>
            <TabPane tab="可视化面板设置" key="2">
              正在开发
            </TabPane>
          </Tabs>
        )}
      </>
    );
  }
}

DashboardsListTabs.propTypes = {
  slugId: PropTypes.string
};

DashboardsListTabs.defaultProps = {
  slugId: null
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsListTabs',
    react2angular(
      DashboardsListTabs,
      Object.keys(DashboardsListTabs.propTypes),
      ['$scope', 'appSettings']
    )
  );
}

init.init = true;

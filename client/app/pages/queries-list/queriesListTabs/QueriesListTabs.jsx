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

import QueriesListEmptyState from './QueriesListEmptyState';

import { policy } from '@/services/policy';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;
class QueriesListTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      queryResult: null
    });
  }

  componentDidUpdate(prevProps) {

    if(this.state.isLoaded && _.isEqual(this.props.queryResult,{isLoading:true})){
      // eslint-disable-next-line
      this.setState({
        isLoaded: false,
        queryResult: null
      });
    }

    if(!_.isEqual(this.props.queryResult,prevProps.queryResult)) {
      if(this.props.queryResult != null) {
        // eslint-disable-next-line
        this.setState({
          isLoaded: true,
          queryResult:this.props.queryResult
        });
      }
    }
  }

  render() {
    const { appSettings } = this.props;

    const newDataSourceProps = {
      type: 'primary',
      ghost: true,
      size: 'small',
      onClick: policy.isCreateDataSourceEnabled()
        ? this.showCreateSourceDialog
        : null,
      disabled: !policy.isCreateDataSourceEnabled()
    };

    return (
      <>
        {!this.state.isLoaded && <LoadingState />}
        {this.state.isLoaded && this.state.queryResult == null && (
          <Empty
            description="请从左侧点击选择数据集"
            style={{ paddingTop: '10%' }}
          />
        )}
        {this.state.isLoaded && this.state.queryResult != null && (
          <Tabs defaultActiveKey="1" type="card" className="queries-tab">
            <TabPane tab="数据预览" key="1">
              <Alert
                message="预览数据为该数据集的部分数据."
                type="warning"
                closable
              />
            </TabPane>
            <TabPane tab="数据集设置" key="2">
              Content of Tab Pane 2
            </TabPane>
            <TabPane tab="关联图表" key="3">
              Content of Tab Pane 3
            </TabPane>
          </Tabs>
        )}
      </>
    );
  }
}

QueriesListTabs.propTypes = {
  queryResult: PropTypes.object
};

QueriesListTabs.defaultProps = {
  queryResult: null
};

export default function init(ngModule) {
  ngModule.component(
    'queriesListTabs',
    react2angular(QueriesListTabs, Object.keys(QueriesListTabs.propTypes), [
      '$scope',
      'appSettings'
    ])
  );
}

init.init = true;

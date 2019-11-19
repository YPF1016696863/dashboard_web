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

import { policy } from '@/services/policy';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class DataSourceTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      queryResult: null
    });
  }

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(this.props.sourceId, prevProps.sourceId) &&
      this.props.sourceId > 0
    ) {
      this.getQuery(this.props.sourceId);
    }

    if (
        !_.isEqual(this.props.sourceId, prevProps.sourceId) &&
        this.props.sourceId == null
    ) {
      // eslint-disable-next-line
      this.setState({
        queryResult: null
      });
    }
  }

  getQuery(id) {
    this.setState({
      isLoaded: false,
      queryResult: null
    });
    Query.resultById({ id })
      .$promise.then(res => {
        this.setState({
          isLoaded: true,
          queryResult: this.normalizedTableData(res.query_result)
        });
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          queryResult: 'empty'
        });
      });
  }

  normalizedTableData(data) {
    if (data === 'empty') {
      return null;
    }
    return {
      columns: _.map(data.data.columns, column => ({
        title: column.friendly_name,
        dataIndex: column.name
      })),
      rows: data.data.rows
    };
  }

  render() {
    return (
      <>
        {!this.state.isLoaded && <LoadingState />}
        {this.state.isLoaded && this.state.queryResult == null && (
          <Empty
            description="请从左侧点击选择数据源"
            style={{ paddingTop: '10%' }}
          />
        )}
        {this.state.isLoaded &&
          this.state.queryResult != null &&
          this.state.queryResult !== 'empty' && (
            <Tabs defaultActiveKey="1" type="card" className="queries-tab">
              <TabPane tab="数据预览" key="1">
                <Alert
                  message="预览数据为该数据集的部分数据."
                  type="warning"
                  closable
                />
                <br />
                <Table
                  columns={this.state.queryResult.columns}
                  dataSource={this.state.queryResult.rows}
                  pagination={{ pageSize: 100 }}
                />
              </TabPane>
              <TabPane tab="数据集设置" key="2">
                Content of Tab Pane 2
              </TabPane>
            </Tabs>
          )}
      </>
    );
  }
}

DataSourceTabs.propTypes = {
  sourceId: PropTypes.string
};

DataSourceTabs.defaultProps = {
  sourceId: null
};

export default function init(ngModule) {
  ngModule.component(
    'sourceTabs',
    react2angular(DataSourceTabs, Object.keys(DataSourceTabs.propTypes), [
      '$scope',
      'appSettings'
    ])
  );
}

init.init = true;

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

import { ChartsPreview } from '@/components/charts-preview/charts-preview';
import { EditVisualizationDialog } from '@/components/edit-visualization-dialog/edit-visualization-dialog';
import { IMG_ROOT } from '@/services/data-source';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

let ChartsPreviewDOM;
let EditVisualizationDialogDOM;

const emptyChart = '/static/images/emptyChart.png';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class ChartsTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      queryResult: null,
      visualization: null
    });
    ChartsPreviewDOM = angular2react(
      'chartsPreview',
      ChartsPreview,
      window.$injector
    );

    EditVisualizationDialogDOM = angular2react(
      'editVisualizationDialog',
      EditVisualizationDialog,
      window.$injector
    );
  }

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(this.props.displayId, prevProps.displayId) &&
      this.props.displayId
    ) {
      this.getQuery(this.props.displayId);
    }

    if (
      !_.isEqual(this.props.displayId, prevProps.displayId) &&
      this.props.displayId == null
    ) {
      // eslint-disable-next-line
      this.setState({
        queryResult: null
      });
    }
  }

  getQueryId() {
    return _.split(this.props.displayId, ':')[0];
  }

  getChartId() {
    return _.split(this.props.displayId, ':')[1];
  }

  getQuery(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];

    this.setState({
      isLoaded: false,
      queryResult: null,
      visualization: null
    });

    Query.query({ id: queryId })
      .$promise.then(query => {
        query
          .getQueryResultPromise()
          .then(queryRes => {
            this.setState({
              isLoaded: true,
              visualization: null,
              queryResult: queryRes
            });

            if (visualizationId) {
              this.setState({
                visualization: _.find(
                  query.visualizations,
                  // eslint-disable-next-line eqeqeq
                  visualization => visualization.id == visualizationId
                )
              });
            }
          })
          .catch(err => {
            this.setState({
              isLoaded: true,
              visualization: null,
              queryResult: 'empty'
            });
          });
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          visualization: null,
          queryResult: 'empty'
        });
      });
  }

  // eslint-disable-next-line class-methods-use-this
  normalizedTableColumn(queryRes) {
    return _.map(queryRes.getColumns(), column => ({
      title: column.friendly_name,
      dataIndex: column.name
    }));
  }

  render() {
    return (
      <>
        {!this.state.isLoaded && <LoadingState />}
        {this.state.isLoaded && this.state.queryResult == null && (
          <img className="p-5" src={emptyChart} alt="empty" width="100" />
        )}
        {this.state.isLoaded && this.state.queryResult === 'empty' && (
          <Empty
            description="该可视化组件暂无数据"
            style={{ paddingTop: '10%' }}
          >
            <Button
              type="primary"
              href={'/queries/' + this.getQueryId() + '/source'}
              target="_blank"
            >
              设置数据
            </Button>
          </Empty>
        )}
        {this.state.isLoaded &&
          this.state.queryResult != null &&
          this.state.queryResult !== 'empty' && (
            <>
              {this.state.visualization === null ? (
                <>
                  <Menu selectedKeys={[]} mode="horizontal">
                    <Menu.Item key="add-vis">
                      <a
                        href={'/queries/' + this.getQueryId() + '/source'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon type="file-add" />
                        新建可视化组件
                      </a>
                    </Menu.Item>
                    <Menu.Item key="edit-query">
                      <a
                        href={'/queries/' + this.getQueryId() + '/source'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon type="edit" />
                        编辑数据集
                      </a>
                    </Menu.Item>
                  </Menu>
                  <Table
                    columns={this.normalizedTableColumn(this.state.queryResult)}
                    dataSource={this.state.queryResult.getData()}
                    pagination={{ pageSize: 100 }}
                  />
                </>
              ) : (
                <>
                  <Menu selectedKeys={[]} mode="horizontal">
                    <Menu.Item key="edit-vis">
                      <Icon type="edit" />
                      编辑可视化组件
                    </Menu.Item>
                    <Menu.Item key="delete-vis">
                      <Icon type="delete" />
                      删除
                    </Menu.Item>
                  </Menu>
                  <ChartsPreviewDOM
                    visualization={this.state.visualization}
                    queryResult={this.state.queryResult}
                  />
                </>
              )}
            </>
          )}
      </>
    );
  }
}

ChartsTabs.propTypes = {
  displayId: PropTypes.string
  // displayType: PropTypes.string
};

ChartsTabs.defaultProps = {
  displayId: null
  // displayType: null
};

export default function init(ngModule) {
  ngModule.component(
    'chartsTabs',
    react2angular(ChartsTabs, Object.keys(ChartsTabs.propTypes), [
      '$scope',
      'appSettings'
    ])
  );
}

init.init = true;

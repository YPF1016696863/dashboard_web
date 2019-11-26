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

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

let ChartsPreviewDOM;
let EditVisualizationDialogDOM;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class ChartsListTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      queryResult: null,
      visualization: null,
      query: null
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

  getQuery(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];

    this.setState({
      isLoaded: false,
      queryResult: null,
      visualization: null,
      query: null
    });

    Query.query({ id: queryId })
      .$promise.then(query => {
        this.setState({
          query
        });
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
          <Empty
            description="请从左侧点击选择可视化组件"
            style={{ paddingTop: '10%' }}
          />
        )}
        {this.state.isLoaded && this.state.queryResult === 'empty' && (
          <Empty
            description="该可视化组件暂无数据"
            style={{ paddingTop: '10%' }}
          >
            <Button
              type="primary"
              href={'/queries/' + this.props.displayId + '/source'}
              target="_blank"
            >
              设置数据
            </Button>
          </Empty>
        )}
        {this.state.isLoaded &&
          this.state.queryResult != null &&
          this.state.queryResult !== 'empty' && (
            <Tabs defaultActiveKey="1" type="card" className="queries-tab">
              <TabPane tab="预览" key="1">
                {this.state.visualization === null ? (
                  <Table
                    columns={this.normalizedTableColumn(this.state.queryResult)}
                    dataSource={this.state.queryResult.getData()}
                    pagination={{ pageSize: 100 }}
                  />
                ) : (
                  <ChartsPreviewDOM
                    visualization={this.state.visualization}
                    queryResult={this.state.queryResult}
                  />
                )}
              </TabPane>
              {this.state.visualization === null ? null : (
                <TabPane tab="设置" key="2">
                  {this.state.visualization === null ? null : (
                    <EditVisualizationDialogDOM
                      resolve={{
                        query: this.state.query,
                        queryResult: this.state.queryResult,
                        visualization: this.state.visualization
                      }}
                    />
                  )}
                </TabPane>
              )}
            </Tabs>
          )}
      </>
    );
  }
}

ChartsListTabs.propTypes = {
  displayId: PropTypes.string
  // displayType: PropTypes.string
};

ChartsListTabs.defaultProps = {
  displayId: null
  // displayType: null
};

export default function init(ngModule) {
  ngModule.component(
    'chartsListTabs',
    react2angular(ChartsListTabs, Object.keys(ChartsListTabs.propTypes), [
      '$scope',
      'appSettings'
    ])
  );
}

init.init = true;

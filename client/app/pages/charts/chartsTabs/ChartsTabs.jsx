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
      visualization: null,
      query: null
    });

    EditVisualizationDialogDOM = angular2react(
      'editVisualizationDialog',
      EditVisualizationDialog,
      window.$injector
    );

    this.getQuery(this.props.queryId + ':' + this.props.chartId);
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
              visualization: null,
              queryResult: queryRes
            });

            if (visualizationId) {
              this.setState({
                isLoaded: true,
                visualization: _.find(
                  query.visualizations,
                  // eslint-disable-next-line eqeqeq
                  visualization => visualization.id == visualizationId
                )
              });
            }else{
              this.setState({
                isLoaded: true,
                visualization: null,
                queryResult: 'empty'
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
        {!this.state.isLoaded && (<div style={{paddingTop:'20vh'}}><LoadingState /></div>)}
        {this.state.isLoaded && this.state.queryResult == null && (
          <img className="p-5" src={emptyChart} alt="empty" width="100" />
        )}
        {this.state.isLoaded && this.state.queryResult === 'empty' && (
          <Empty
            description={
              <span style={{ color: '#fff' }}>该可视化组件暂无数据</span>
            }
          >
            <Button type="primary" href="" target="_blank">
              设置数据
            </Button>
          </Empty>
        )}
        {this.state.isLoaded &&
          this.state.queryResult != null &&
          this.state.queryResult !== 'empty' && (
            <EditVisualizationDialogDOM
              resolve={{
                query: this.state.query,
                queryResult: this.state.queryResult,
                visualization: this.state.visualization
              }}
            />
          )}
      </>
    );
  }
}

ChartsTabs.propTypes = {
  queryId: PropTypes.string,
  chartId: PropTypes.string
};

ChartsTabs.defaultProps = {
  queryId: null,
  chartId: null
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

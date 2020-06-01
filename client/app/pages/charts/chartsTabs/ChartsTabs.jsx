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
      chartType: this.props.chartType ? this.props.chartType : 'new',
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.chartType !== this.props.chartType) {
      this.setState({
        chartType: nextProps.chartType
      });
    }
  }

  getQuery(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];

    this.setState({
      isLoaded: false,
      chartType: this.props.chartType ? this.props.chartType : 'new',
      queryResult: null,
      visualization: null,
      query: null
    });

    if (queryId === "unset") {
      const query = Query.newQuery();
      query.id = "unset";
      this.setState({
        isLoaded: true,
        chartType: this.props.chartType ? this.props.chartType : 'new',
        query,
        queryResult: {},
        visualization: null
      });
      return;
    }



    Query.query({ id: queryId })
      .$promise.then(query => {
        this.setState({
          query
        });
        // console.log(this.state.query);



        query
          .getQueryResultPromise()
          .then(queryRes => {
            this.setState({
              visualization: null,
              queryResult: queryRes
            });
            if (visualizationId !== 'new') {
              this.setState({
                isLoaded: true,
                visualization: _.find(
                  query.visualizations,
                  // eslint-disable-next-line eqeqeq
                  visualization => visualization.id == visualizationId
                )
              });
              this.setState({
                chartType: this.state.visualization.type
              });
            } else {
              this.setState({
                isLoaded: true,
                chartType: this.props.chartType ? this.props.chartType : 'new',
                visualization: null
              });
            }
          })
          .catch(err => {
            query
              .getQueryResultByText(-1, this.state.query.query)
              .toPromise()
              .then(queryRes => {
                this.setState({
                  visualization: null,
                  queryResult: queryRes
                });
                if (visualizationId !== 'new') {
                  this.setState({
                    isLoaded: true,
                    visualization: _.find(
                      query.visualizations,
                      // eslint-disable-next-line eqeqeq
                      visualization => visualization.id == visualizationId
                    )
                  });
                  this.setState({
                    chartType: this.state.visualization.type
                  });
                } else {
                  this.setState({
                    isLoaded: true,
                    chartType: this.props.chartType ? this.props.chartType : 'new',
                    visualization: null
                  });
                }
              })
              .catch(ex => {
                this.setState({
                  isLoaded: true,
                  chartType: 'new',
                  visualization: null,
                  queryResult: null
                });
              });
          });
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          chartType: 'new',
          visualization: null,
          queryResult: null
        });
      });
  }

  render() {
    return (
      <>
        {!this.state.isLoaded && (
          <div style={{ paddingTop: '20vh' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && this.state.chartType === 'new' && (
          <div style={{ textAlign: 'center', paddingTop: '20vh' }}>
            <img className="p-5" src={emptyChart} alt="empty" width="100" />
            <p style={{ color: '#fff' }}>新建可视化组件,请在左侧选择图表类型</p>
          </div>
        )}
        {this.state.isLoaded &&
          this.state.queryResult != null &&
          this.state.chartType !== 'new' && (
            <EditVisualizationDialogDOM
              chartType={this.state.chartType}
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
  chartId: PropTypes.string,
  chartType: PropTypes.string
};

ChartsTabs.defaultProps = {
  queryId: null,
  chartId: null,
  chartType: null
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

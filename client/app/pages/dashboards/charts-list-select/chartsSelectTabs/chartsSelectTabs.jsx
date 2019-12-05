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
  message,
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

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;
let ChartsPreviewDOM;
const emptyChartImg = '/static/images/emptyChart.png';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class ChartsSelectTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      queryResult: null,
      visualization: null,
      visType: null
    });

    ChartsPreviewDOM = angular2react(
        'chartsPreview',
        ChartsPreview,
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
      visualization: null,
      visType: null
    });

    Query.query({ id: queryId })
      .$promise.then(query => {
        query
          .getQueryResultPromise()
          .then(queryRes => {
            this.setState({
              isLoaded: true,
              visualization: null,
              queryResult: queryRes,
              visType: null
            });
            if (!visualizationId) {
              const visOption = _.cloneDeep(
                _.first(
                  _.orderBy(
                    query.visualizations,
                    visualization => visualization.id
                  )
                )
              );
              if (_.has(visOption, 'options')) {
                visOption.options.itemsPerPage = 20;
              }
              this.setState({
                visualization: visOption,
                visType: 'Q'
              });
            } else {
              this.setState({
                visualization: _.find(
                  query.visualizations,
                  // eslint-disable-next-line eqeqeq
                  visualization => visualization.id == visualizationId
                ),
                visType: 'V'
              });
            }
          })
          .catch(err => {
            this.setState({
              isLoaded: true,
              visualization: null,
              queryResult: 'empty',
              visType: null
            });
          });
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          visualization: null,
          queryResult: 'empty',
          visType: null
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
        {!this.state.isLoaded && (
          <>
            <div className="align-center-div" style={{ paddingTop: '15%' }}>
              <LoadingState />
            </div>

          </>
        )}
        {this.state.isLoaded && this.state.queryResult == null && (
          <>
            <div className="align-center-div" style={{ paddingTop: '15%' }}>
              <img src={emptyChartImg} alt="" style={{ width: 100 }} />
            </div>
          </>
        )}
        {this.state.isLoaded && this.state.queryResult === 'empty' && (
          <Empty
            description={
              <span style={{ color: '#fff' }}>该可视化组件暂无数据</span>
            }
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
              {/* eslint-disable-next-line no-nested-ternary */}
              {this.state.visType === 'Q' ? (
                <>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <ChartsPreviewDOM
                    visualization={this.state.visualization}
                    queryResult={this.state.queryResult}
                  />
                </>
              ) : this.state.visType === 'V' ? (
                <>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <ChartsPreviewDOM
                    visualization={this.state.visualization}
                    queryResult={this.state.queryResult}
                  />
                </>
              ) : null}
            </>
          )}
      </>
    );
  }
}

ChartsSelectTabs.propTypes = {
  displayId: PropTypes.string
  // displayType: PropTypes.string
};

ChartsSelectTabs.defaultProps = {
  displayId: null
  // displayType: null
};

export default function init(ngModule) {
  ngModule.component(
    'chartsSelectTabs',
    react2angular(ChartsSelectTabs, Object.keys(ChartsSelectTabs.propTypes), [
      '$scope',
      'appSettings',
      '$window'
    ])
  );
}

init.init = true;

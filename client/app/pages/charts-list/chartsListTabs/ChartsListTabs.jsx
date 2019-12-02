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
import { EditVisualizationDialog } from '@/components/edit-visualization-dialog/edit-visualization-dialog';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

let ChartsPreviewDOM;
let EditVisualizationDialogDOM;
const emptyChartImg = '/static/images/emptyChart.png';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class ChartsListTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      queryResult: null,
      visualization: null,
      visType: null,
      canEdit: false
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
      visualization: null,
      visType: null,
      canEdit: false
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
              visType: null,
              canEdit: currentUser.canEdit(query) || query.can_edit
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
              visType: null,
              canEdit: false
            });
          });
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          visualization: null,
          queryResult: 'empty',
          visType: null,
          canEdit: false
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
            <Menu selectedKeys={[]} mode="horizontal">
              <Menu.Item key="add-vis">
                <Button type="link" disabled>
                  <Icon type="file-add" />
                  新建可视化组件
                </Button>
              </Menu.Item>
              <Menu.Item key="edit-query">
                <Button type="link" disabled>
                  <Icon type="edit" />
                  编辑数据集
                </Button>
              </Menu.Item>
            </Menu>
            <div className="align-center-div" style={{ paddingTop: '15%' }}>
              <LoadingState />
            </div>
          </>
        )}
        {this.state.isLoaded && this.state.queryResult == null && (
          <>
            <Menu selectedKeys={[]} mode="horizontal">
              <Menu.Item key="add-vis">
                <Button type="link" disabled>
                  <Icon type="file-add" />
                  新建可视化组件
                </Button>
              </Menu.Item>
              <Menu.Item key="edit-query">
                <Button type="link" disabled>
                  <Icon type="edit" />
                  编辑数据集
                </Button>
              </Menu.Item>
            </Menu>
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
                  <Menu selectedKeys={[]} mode="horizontal">
                    <Menu.Item key="add-vis">
                      <Button
                        type="link"
                        onClick={() => {
                          if (this.state.canEdit) {
                            this.props.$window.open(
                              'query/' + this.getQueryId() + '/charts/new',
                              '新建可视化组件'
                            );
                          } else {
                            message.warning(
                              '无法新建可视化组件,无有效编辑权限'
                            );
                          }
                        }}
                      >
                        <Icon type="file-add" />
                        新建可视化组件
                      </Button>
                    </Menu.Item>
                    <Menu.Item key="edit-query">
                      <Button
                        type="link"
                        onClick={() => {
                          if (this.state.canEdit) {
                            this.props.$window.open(
                              '/queries/' + this.getQueryId() + '/source',
                              '编辑数据集'
                            );
                          } else {
                            message.warning('无法编辑数据集,无有效编辑权限');
                          }
                        }}
                      >
                        <Icon type="edit" />
                        编辑数据集
                      </Button>
                    </Menu.Item>
                  </Menu>
                  <ChartsPreviewDOM
                    visualization={this.state.visualization}
                    queryResult={this.state.queryResult}
                  />
                </>
              ) : this.state.visType === 'V' ? (
                <>
                  <Menu selectedKeys={[]} mode="horizontal">
                    <Menu.Item key="edit-vis">
                      <a
                        href={
                          'query/' +
                          this.getQueryId() +
                          '/charts/' +
                          this.getChartId()
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon type="edit" />
                        编辑可视化组件
                      </a>
                    </Menu.Item>
                    <Menu.Item key="delete-vis">
                      <Icon type="delete" style={{ color: 'red' }} />
                      <span style={{ color: 'red' }}>删除</span>
                    </Menu.Item>
                  </Menu>
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
      'appSettings',
      '$window'
    ])
  );
}

init.init = true;

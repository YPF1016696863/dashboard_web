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
  Tabs,
  Switch,
  Statistic,
  Card,
  Input
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
      query: null,
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
      query: null,
      queryResult: null,
      visualization: null,
      visType: null,
      canEdit: false
    });

    Query.query({ id: queryId })
      .$promise.then(query => {
        this.setState({ query });
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
              query: null,
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
          query: null,
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
            <Tabs defaultActiveKey="1" type="card" className="queries-tab">
              <TabPane tab="可视化组件预览" key="1" disabled>
                <div className="align-center-div" style={{ paddingTop: '15%' }}>
                  <LoadingState />
                </div>
              </TabPane>
              <TabPane tab="编辑可视化组件" key="2" disabled />
            </Tabs>
          </>
        )}
        {this.state.isLoaded && this.state.queryResult == null && (
          <>
            <Tabs defaultActiveKey="1" type="card" className="queries-tab">
              <TabPane tab="可视化组件预览" key="1" disabled>
                <div className="align-center-div" style={{ paddingTop: '15%' }}>
                  <img src={emptyChartImg} alt="" style={{ width: 100 }} />
                </div>
              </TabPane>
              <TabPane tab="编辑可视化组件" key="2" disabled />
            </Tabs>
          </>
        )}
        {this.state.isLoaded && this.state.queryResult === 'empty' && (
          <Tabs defaultActiveKey="1" type="card" className="queries-tab">
            <TabPane tab="可视化组件预览" key="1" disabled>
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
            </TabPane>
            <TabPane tab="编辑可视化组件" key="2" disabled />
          </Tabs>
        )}
        {this.state.isLoaded &&
          this.state.queryResult != null &&
          this.state.queryResult !== 'empty' && (
            <>
              {/* eslint-disable-next-line no-nested-ternary */}
              {this.state.visType === 'Q' ? (
                <>
                  <Tabs
                    defaultActiveKey="1"
                    type="card"
                    className="queries-tab"
                  >
                    <TabPane tab="可视化组件数据预览" key="1">
                      <ChartsPreviewDOM
                        visualization={this.state.visualization}
                        queryResult={this.state.queryResult}
                      />
                    </TabPane>
                    <TabPane tab="新建设置" key="2">
                      <Descriptions title={this.state.query.name}>
                        <Descriptions.Item label="数据集创建时间">
                          {this.state.query.created_at}
                        </Descriptions.Item>
                        <Descriptions.Item label="ID">
                          {this.state.visualization.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建者">
                          {this.state.query.user.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="可编辑">
                          {this.state.canEdit ? (
                            <Switch
                              disabled
                              defaultChecked
                              checkedChildren="是"
                            />
                          ) : (
                            <Switch disabled unCheckedChildren="否" />
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="最近更新自">
                          {this.state.query.last_modified_by.name}
                        </Descriptions.Item>
                      </Descriptions>
                      <Statistic
                        title="数据集:"
                        value={this.state.query.query}
                      />
                      <br />
                      <p style={{ fontSize: '14px' }}>可视化组件共享设置:</p>
                      <Card
                        bodyStyle={{
                          paddingTop: '10px',
                          paddingBottom: '10px'
                        }}
                      >
                        <Statistic
                          title="可视化组件共享"
                          value=" "
                          prefix={
                            <Switch
                              checkedChildren="开"
                              unCheckedChildren="关"
                              defaultChecked={false}
                            />
                          }
                        />
                        <Row>
                          <Col span={18}>
                            <Input
                              value={this.state.query.api_key}
                              readOnly
                            />
                          </Col>
                          <Col span={6}>
                            <Button
                              disabled
                              type="primary"
                              style={{ marginLeft: '15px' }}
                            >
                              <Icon type="copy" /> 拷贝API Key
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                      <p style={{ fontSize: '14px' }}>其他设置:</p>
                      <Button
                        type="primary"
                        target="_blank"
                        href={
                          'query/' +
                          this.getQueryId() +
                          '/charts/' +
                          this.getChartId()
                        }
                      >
                        <i className="fa fa-edit m-r-5" />
                        编辑可视化组件
                      </Button>
                      <br />
                      <br />
                      <Button disabled>
                        <Icon type="delete" />
                        删除可视化组件
                      </Button>
                    </TabPane>
                  </Tabs>
                </>
              ) : this.state.visType === 'V' ? (
                <>
                  <Tabs
                    defaultActiveKey="1"
                    type="card"
                    className="queries-tab"
                  >
                    <TabPane tab="可视化组件数据预览" key="1">
                      <ChartsPreviewDOM
                        visualization={this.state.visualization}
                        queryResult={this.state.queryResult}
                      />
                    </TabPane>
                    <TabPane tab="设置可视化组件" key="2">
                      <Descriptions title={this.state.visualization.name}>
                        <Descriptions.Item label="更新时间">
                          {this.state.visualization.updated_at}
                        </Descriptions.Item>
                        <Descriptions.Item label="ID">
                          {this.state.visualization.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建者">
                          {this.state.query.user.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="可编辑">
                          {this.state.canEdit ? (
                            <Switch
                              disabled
                              defaultChecked
                              checkedChildren="是"
                            />
                          ) : (
                            <Switch disabled unCheckedChildren="否" />
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="可视化组件类型">
                          {this.state.visualization.type}
                        </Descriptions.Item>
                      </Descriptions>
                      <Statistic
                        title="该可视化组建由以下数据集创建:"
                        value={this.state.query.name}
                      />
                      <br />
                      <p style={{ fontSize: '14px' }}>其他设置:</p>
                      <Button
                        type="primary"
                        target="_blank"
                        href={
                          'query/' +
                          this.getQueryId() +
                          '/charts/' +
                          this.getChartId()
                        }
                      >
                        <i className="fa fa-edit m-r-5" />
                        编辑可视化组件
                      </Button>
                      <br />
                      <br />
                      <Button disabled>
                        <Icon type="delete" />
                        删除可视化组件
                      </Button>
                    </TabPane>
                  </Tabs>
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

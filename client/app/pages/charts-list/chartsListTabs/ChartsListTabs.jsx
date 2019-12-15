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
  Form,
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

const { TextArea } = Input;

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
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && this.state.queryResult == null && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <img src={emptyChartImg} alt="" style={{ width: 100 }} />
          </div>
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
              {this.state.visType === 'Q' ? null : this.state.visType ===
                'V' ? (
                // eslint-disable-next-line react/jsx-indent
                <div style={{ padding: '15px' }}>
                  <Descriptions>
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
                      {this.state.canEdit ? '是' : '否'}
                    </Descriptions.Item>
                    <Descriptions.Item label="可视化组件类型">
                      {this.state.visualization.type}
                    </Descriptions.Item>
                  </Descriptions>
                  <Statistic
                    title="该可视化组件由以下数据集创建:"
                    value={this.state.query.name}
                  />
                  <br />
                  <p style={{ fontSize: '14px' }}>可视化组件描述:</p>
                  <TextArea placeholder="可视化组件描述" rows={4} />
                  <br />
                  <br />
                  <div align="right">
                    <Button type="primary" onClick={() => {}}>
                      <Icon type="save" />
                      保存
                    </Button>
                  </div>
                  <Divider />
                  <p style={{ fontSize: '14px' }}>可视化组件共享设置:</p>
                  <Form>
                    <Form.Item
                      label="共享可视化组件"
                      labelAlign="left"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 1, offset: 17 }}
                    >
                      <Switch
                        checkedChildren="开"
                        unCheckedChildren="关"
                        defaultChecked={false}
                      />
                    </Form.Item>
                    <Form.Item
                      label="共享可视化组件URL"
                      labelAlign="left"
                      labelCol={{ span: 2 }}
                      wrapperCol={{ span: 22 }}
                    >
                      <Input
                        value="暂时无法获取可视化组件链接地址"
                        readOnly
                        addonAfter={
                          <Button type="link">
                            <Icon type="copy" /> 拷贝连接
                          </Button>
                        }
                      />
                    </Form.Item>
                  </Form>
                  <br />
                  <p style={{ fontSize: '14px' }}>可视化组件预览:</p>
                  <Row>
                    <Col span={12}>
                      <ChartsPreviewDOM
                        visualization={this.state.visualization}
                        queryResult={this.state.queryResult}
                      />
                    </Col>
                  </Row>
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
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Button disabled>
                    <Icon type="delete" />
                    删除可视化组件
                  </Button>
                </div>
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

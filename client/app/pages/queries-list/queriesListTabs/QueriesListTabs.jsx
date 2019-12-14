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
  message,
  Input,
  Tabs,
  Switch,
  Statistic
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

import notification from '@/services/notification';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class QueriesListTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      canEdit: false,
      query: null,
      queryResultRaw: null,
      queryResult: null,
      runtime: {
        name: null
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(this.props.queryId, prevProps.queryId) &&
      this.props.queryId > 0
    ) {
      this.getQuery(this.props.queryId);
    }

    if (
      !_.isEqual(this.props.queryId, prevProps.queryId) &&
      this.props.queryId == null
    ) {
      // eslint-disable-next-line
      this.setState({
        canEdit: false,
        query: null,
        queryResultRaw: null,
        queryResult: null,
        runtime: {
          name: null
        }
      });
    }
  }

  getQuery(id) {
    this.setState({
      isLoaded: false,
      canEdit: false,
      query: null,
      queryResultRaw: null,
      queryResult: null,
      runtime: {
        name: null
      }
    });

    Query.query({ id })
      .$promise.then(query => {
        this.setState({
          query,
          canEdit: currentUser.canEdit(query) || query.can_edit,
          runtime: {
            name: query.name
          }
        });
        query
          .getQueryResultPromise()
          .then(queryRes => {
            this.setState({
              isLoaded: true,
              queryResultRaw: queryRes,
              queryResult: this.normalizedTableData(queryRes.query_result)
            });
          })
          .catch(err => {
            this.setState({
              isLoaded: true,
              canEdit: false,
              query: null,
              queryResultRaw: null,
              queryResult: 'empty',
              runtime: {
                name: null
              }
            });
          });
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          canEdit: false,
          query: null,
          queryResultRaw: null,
          queryResult: 'empty',
          runtime: {
            name: null
          }
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

  // eslint-disable-next-line class-methods-use-this
  updateFriendlyName() {
    // TODO: 触发这个函数的时候，数据已经保存到this.state.queryResultRaw中，需要使用api将数据保存到服务端，具体用法需要研究api使用，
    message.error('暂时无法将数据集别名保存至服务器，该功能正在开发当中...');
  }

  // eslint-disable-next-line class-methods-use-this
  friendlyNameOnChange(id, record, event) {
    _.find(
      _.get(this.state.queryResultRaw, 'query_result.data.columns', []),
      record
    ).friendly_name = event.target.value;
    this.setState({
      isLoaded: true,
      queryResultRaw: this.state.queryResultRaw,
      queryResult: this.normalizedTableData(
        this.state.queryResultRaw.query_result
      )
    });
  }

  saveQuery(customOptions, data) {
    const { query } = this.state;
    return new Promise((resolve, reject) => {
      let request = data;

      if (request) {
        // Don't save new query with partial data
        if (query.isNew()) {
          return reject();
        }
        request.id = query.id;
        request.version = query.version;
      } else {
        request = _.pick(query, [
          'schedule',
          'query',
          'id',
          'description',
          'name',
          'data_source_id',
          'options',
          'latest_query_data_id',
          'version',
          'is_draft'
        ]);
      }

      const options = Object.assign(
        {},
        {
          successMessage: '保存成功',
          errorMessage: '无法保存'
        },
        customOptions
      );

      if (options.force) {
        delete request.version;
      }

      Query.save(
        request,
        updatedQuery => {
          notification.success(options.successMessage);
          query.version = updatedQuery.version;
          resolve();
        },
        error => {
          reject(error);
        }
      );
    });
  }

  render() {
    return (
      <>
        {!this.state.isLoaded && <LoadingState />}
        {this.state.isLoaded && this.state.queryResult == null && (
          <Empty
            description="请从左侧点击选择数据集"
            style={{ paddingTop: '10%' }}
          />
        )}
        {this.state.isLoaded && this.state.queryResult === 'empty' && (
          <Empty description="该数据集暂无数据" style={{ paddingTop: '10%' }}>
            <Button
              type="primary"
              href={'/queries/' + this.props.queryId + '/source'}
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
              {/* <TabPane tab="数据预览" key="1">
                <Alert
                  message="预览数据为该数据集的部分数据."
                  type="warning"
                  closable
                />
                <br />
                <Table
                  columns={this.state.queryResult.columns}
                  dataSource={this.state.queryResult.rows}
                  pagination={{ pageSize: 20 }}
                />
              </TabPane> */}
              <TabPane
                tab="数据集设置"
                key="1"
                style={{ paddingRight: '10px' }}
              >
                <Descriptions
                  title={
                    <Input
                      placeholder={this.state.query.name}
                      addonBefore="数据集名称"
                      value={this.state.runtime.name}
                      onChange={e => {
                        this.setState(
                          {
                            runtime: {
                              name: e.target.value
                            }
                          },
                          () => {}
                        );
                      }}
                      allowClear
                    />
                  }
                >
                  <Descriptions.Item label="数据集创建时间">
                    {this.state.query.created_at}
                  </Descriptions.Item>
                  <Descriptions.Item label="ID">
                    {this.state.query.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建者">
                    {this.state.query.user.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="可编辑">
                    {this.state.canEdit ? (
                      <Switch disabled defaultChecked checkedChildren="是" />
                    ) : (
                      <Switch disabled unCheckedChildren="否" />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="最近更新自">
                    {this.state.query.last_modified_by.name}
                  </Descriptions.Item>
                </Descriptions>
                <Statistic title="数据集:" value={this.state.query.query} />
                <br />
                <Statistic
                  title="该数据集已应用于组件数量:"
                  value={
                    _.isArray(this.state.query.visualizations)
                      ? this.state.query.visualizations.length
                      : '无法显示'
                  }
                />
                <br />
                <Alert
                  message="预览数据为该数据集的部分数据."
                  type="warning"
                  closable
                />  
                <Table
                  columns={this.state.queryResult.columns}
                  dataSource={this.state.queryResult.rows}
                  pagination={{ pageSize: 20 }}
                />
                <br />
                <div align="right">
                  <Button
                    disabled={!this.state.runtime.name}
                    type="primary"
                    onClick={() => {
                      this.saveQuery(undefined, {
                        name: this.state.runtime.name
                      }).then(()=>{
                        this.props.cbAfterUpdate(this.state.query.id);
                      });
                    }}
                  >
                    <Icon type="upload" />
                    更新数据集设置
                  </Button>
                </div>             
                <p style={{ fontSize: '14px' }}>新建可视化组件:</p>
                <Button
                  type="primary"
                  href={'/query/' + this.state.query.id + '/charts/new'}
                  target="_blank"
                >
                  <Icon type="pie-chart" />
                  新建可视化组件
                </Button>
                <br />
                <br />
                <p style={{ fontSize: '14px' }}>其他设置:</p>
                <Button
                  type="primary"
                  target="_blank"
                  href={'/queries/' + this.props.queryId + '/source'}
                >
                  <i className="fa fa-edit m-r-5" />
                  编辑数据集
                </Button>
                <br />
                <br />             
                <Button type="danger">
                  <Icon type="delete" />
                  删除数据集
                </Button>
              </TabPane>
            </Tabs>
          )}
      </>
    );
  }
}

QueriesListTabs.propTypes = {
  queryId: PropTypes.string,
  cbAfterUpdate: PropTypes.func
};

QueriesListTabs.defaultProps = {
  queryId: null,
  cbAfterUpdate: a=>{}
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

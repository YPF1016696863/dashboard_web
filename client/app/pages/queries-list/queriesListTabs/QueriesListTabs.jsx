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
class QueriesListTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      queryResultRaw: null,
      queryResult: null
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
        queryResultRaw: null,
        queryResult: null
      });
    }
  }

  getQuery(id) {
    this.setState({
      isLoaded: false,
      queryResultRaw: null,
      queryResult: null
    });
    Query.resultById({ id })
      .$promise.then(res => {
        this.setState({
          isLoaded: true,
          queryResultRaw: res,
          queryResult: this.normalizedTableData(res.query_result)
        });
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          queryResultRaw: null,
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

  // eslint-disable-next-line class-methods-use-this
  updateFriendlyName() {
    // TODO: 触发这个函数的时候，数据已经保存到this.state.queryResultRaw中，需要使用api将数据保存到服务端，具体用法需要研究api使用，
    message.error("暂时无法将数据集别名保存至服务器，该功能正在开发当中...");
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
                <p style={{ fontSize: '14px' }}>设置数据集列名称别名:</p>
                <Table
                  bordered
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: '名称',
                      dataIndex: 'name',
                      key: 'name'
                    },
                    {
                      title: '别名',
                      dataIndex: 'friendly_name',
                      key: 'friendly_name',
                      render: (text, record, index) => {
                        return (
                          <Input
                            placeholder="别名"
                            value={text}
                            allowClear
                            onChange={e =>
                              this.friendlyNameOnChange(index, record, e)
                            }
                          />
                        );
                      }
                    }
                  ]}
                  dataSource={_.get(
                    this.state.queryResultRaw,
                    'query_result.data.columns',
                    []
                  )}
                />
                <div align="right">
                  <Button type="primary" onClick={this.updateFriendlyName}>
                    <Icon type="upload" />
                    更新数据集别名
                  </Button>
                </div>

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
  queryId: PropTypes.string
};

QueriesListTabs.defaultProps = {
  queryId: null
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

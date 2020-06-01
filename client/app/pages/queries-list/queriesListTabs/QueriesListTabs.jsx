import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Form,
  Dropdown,
  Menu,
  Icon,
  Divider,
  Row,
  Col,
  Tree,
  Tag,
  Table,
  Alert,
  Empty,
  message,
  Input,
  Popconfirm,
  Skeleton,
  Switch,
  Statistic,
  Modal
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
import { ParameterValueInput } from '@/components/ParameterValueInput';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Query } from '@/services/query';
import { Group } from '@/services/group';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import UserGroupPermissionDialog from '@/components/groups/UserGroupPermissionDialog';
import notification from '@/services/notification';
import { navigateToWithSearch } from '@/services/navigateTo';
import { TablePreview } from '@/components/table-preview/table-preview';

let TablePreviewDOM;

const { TreeNode, DirectoryTree } = Tree;
const { TextArea } = Input;
const ButtonGroup = Button.Group;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class QueriesListTabs extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({
      isLoaded: true,
      query: null,
      queryResultRaw: null,
      queryResult: null,
      tableData: null,
      showDeleteModal: false,
      runTimeLoading: false,
      permissions: {
        loading: false,
        groups: null
      }
    });

    if (this.queryId !== null) {
      this.getQuery(this.props.queryId);
    }

    TablePreviewDOM = angular2react(
      'tablePreview',
      TablePreview,
      window.$injector
    );
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
        query: null,
        queryResultRaw: null,
        tableData: null,
        queryResult: null,
        runTimeLoading: false
      });
    }
  }

  getTemporaryQueryResult() {
    this.setState({
      queryResultRaw: null,
      queryResult: null,
      runTimeLoading: true
    });
    this.state.query
      .getQueryResultByText(-1, this.state.query.query)
      .toPromise()
      .then(queryRes => {
        this.setState({
          runTimeLoading: false,
          queryResultRaw: queryRes,
          queryResult: this.normalizedTableData(queryRes.query_result)
        });
      })
      .catch(err => {
        this.setState({
          runTimeLoading: false,
          queryResultRaw: null,
          tableData: null,
          queryResult: null
        });
      });
  }

  // 点击数据集后触发
  getQuery(id) {
    this.setState({
      isLoaded: false,
      runTimeLoading: true,
      query: null,
      queryResultRaw: null,
      tableData: null,
      queryResult: null,
    });
    if (!id) {
      this.setState({
        isLoaded: true,
        runTimeLoading: false,
        query: null,
        queryResultRaw: null,
        tableData: null,
        queryResult: 'empty',
      });
      return;
    }

    Query.query({ id })
      .$promise.then((query) => {
        this.setState({
          query,
          isLoaded: true,
          tableData: _.find(
            query.visualizations,
            (visualization) => visualization.type === 'TABLE'
          ),
        });
        query
          .getQueryResultPromise()
          .then((queryRes) => {
            this.setState({
              runTimeLoading: false,
              queryResultRaw: queryRes,
              queryResult: this.normalizedTableData(queryRes.query_result),
            });
            this.getGroupsWithPermission();
          })
          .catch((err) => {
            query
              .getQueryResultByText(-1, this.state.query.query)
              .toPromise()
              .then((queryRes) => {
                this.setState({
                  runTimeLoading: false,
                  queryResultRaw: queryRes,
                  queryResult: this.normalizedTableData(queryRes.query_result),
                });
                this.getGroupsWithPermission();
              })
              .catch((ex) => {
                this.setState({
                  isLoaded: true,
                  runTimeLoading: false,
                  queryResultRaw: null,
                  // tableData: null,
                  queryResult: null,
                });
              });
          });
      })
      .catch((exFinal) => {
        this.setState({
          isLoaded: true,
          runTimeLoading: false,
          query: null,
          queryResultRaw: null,
          tableData: null,
          queryResult: null,
        });
      });
  }

  deleteQuery = () => {
    if (this.state.query && this.state.query.id) {
      if (
        this.state.query.visualizations &&
        this.state.query.visualizations.length > 1
      ) {
        this.setState({ showDeleteModal: true });
      } else {
        this.setState({ isLoaded: false });
        Query.delete(
          { id: this.state.query.id },
          () => {
            message.success('数据集' + this.state.query.name + '已删除.');
            this.props.queriesTabCb(null);
            this.setState({
              isLoaded: true,
              query: null,
              queryResultRaw: null,
              tableData: null,
              queryResult: null
            });
          },
          () => {
            message.error('无法删除,请刷新页面后重试.');
            this.setState({ isLoaded: true });
          }
        );
      }
    } else {
      message.error('无法删除,请刷新页面后重试.');
    }
  };

  handleDeleteOk = () => {
    this.setState({ isLoaded: false });
    Query.delete(
      { id: this.state.query.id },
      () => {
        message.success('数据集' + this.state.query.name + '已删除.');
        this.props.queriesTabCb(null);
        this.setState({
          isLoaded: true,
          query: null,
          queryResultRaw: null,
          tableData: null,
          queryResult: null,
          showDeleteModal: false
        });
      },
      () => {
        message.error('无法删除,请刷新页面后重试.');
        this.setState({ isLoaded: true, showDeleteModal: false });
      }
    );
  };

  handleDeleteCancel = () => {
    this.setState({ showDeleteModal: false });
  };

  getGroupsWithPermission = () => {
    const { query } = this.state;
    this.setState({
      permissions: {
        loading: true,
        groups: null
      }
    });

    if (!query) {
      message.warning('无法获取该数据集分组权限设置,请刷新页面');
    }

    Group.groupsByQueryId({ id: query.id }, result => {
      this.setState({
        permissions: {
          loading: false,
          groups: _.map(result, group => {
            return {
              key: group.id,
              group: group.name,
              groupid: group.id,
              viewonly: group.view_only
            }
          })
        }
      });
    }, err => {
      message.warning('无法获取该数据集分组权限设置.');
      this.setState({
        permissions: {
          loading: false,
          groups: null
        }
      });
    });
  }

  normalizedTableData(data) {
    // console.log(data);
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
        {this.state.isLoaded && this.state.query == null && (
          <Empty
            description="请从左侧点击选择数据集"
            style={{ paddingTop: '10%' }}
          />
        )}
        {this.state.isLoaded && this.state.query != null && (
          <>
            <Modal
              title="以下可视化组件正在使用该数据集显示数据"
              visible={this.state.showDeleteModal}
              onOk={this.handleDeleteOk}
              onCancel={this.handleDeleteCancel}
              okButtonProps={{ type: 'danger' }}
              okText="确认删除"
              cancelText="取消"
            >
              {_.map(this.state.query.visualizations, visualization =>
                visualization.type === 'TABLE' ? null : (
                  <p>{visualization.name}</p>
                )
              )}
              <Alert
                message="确认"
                description="删除该数据集会同时删除基于该数据集建立的所有可视化组件."
                type="warning"
                showIcon
              />
            </Modal>
            <div style={{ padding: '10px' }}>
              <div style={{ width: '100%' }}>
                <Descriptions title="数据集信息">
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
                    {!this.state.query.readOnly() ? '是' : '否'}
                  </Descriptions.Item>
                  <Descriptions.Item label="最近更新自">
                    {this.state.query.last_modified_by.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="数据集">
                    {this.state.query.query}
                  </Descriptions.Item>
                  <Descriptions.Item label="该数据集已应用于组件数量">
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {_.isArray(this.state.query.visualizations)
                      ? this.state.query.visualizations.length >= 1
                        ? this.state.query.visualizations.length - 1
                        : '无法显示'
                      : '无法显示'}
                  </Descriptions.Item>
                </Descriptions>
                <b style={{ fontSize: '14px' }}>数据集共享设置:</b>
                <div style={{ paddingRight: '10px' }}>
                  <Form>
                    <Form.Item
                      label="数据集对其他人可见"
                      labelAlign="left"
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 4, offset: 10 }}
                    >
                      <Switch
                        disabled={this.state.query.readOnly()}
                        checkedChildren="开"
                        unCheckedChildren="关"
                        defaultChecked={!this.state.query.is_draft}
                        onChange={checked => {
                          this.saveQuery(null, {
                            is_draft: !checked
                          });
                        }}
                      />
                    </Form.Item>
                  </Form>
                </div>
                {
                  currentUser.isAdmin ? (
                    <>
                      <Divider />
                      <p style={{ fontSize: '14px' }}>数据集权限设定:</p>
                      <p>
                        <Table
                          locale={{ emptyText: "暂无数据" }}
                          tableLayout="fixed"
                          columns={[
                            {
                              title: '用户分组',
                              dataIndex: 'group',
                              key: 'group',
                              render: text => text,
                            },
                            {
                              title: '只读',
                              dataIndex: 'viewonly',
                              key: 'viewonly',
                              render: viewonly => (
                                <Tag color={viewonly ? 'blue' : 'green'}>
                                  {viewonly ? '只读' : '读写'}
                                </Tag>
                              )
                            },
                            {
                              title: '操作',
                              key: 'action',
                              render: (text, record) => {
                                return (
                                  <span>
                                    <Switch
                                      checkedChildren="读写"
                                      unCheckedChildren="只读"
                                      size="small"
                                      checked={!record.viewonly}
                                      onChange={
                                        (checked, event) => {
                                          this.setState({
                                            permissions: {
                                              loading: true
                                            }
                                          });
                                          Group.updateQueryPermission({
                                            id: record.groupid, query_id: this.state.query.id
                                          },
                                            { view_only: !checked }, () => {
                                              this.getGroupsWithPermission();
                                            }, err => {
                                              message.error("修改读写权限失败.");
                                            });

                                        }
                                      }
                                    />
                                    <Divider type="vertical" />
                                    <Button
                                      size="small"
                                      type="link"
                                      onClick={e => {
                                        this.setState({
                                          permissions: {
                                            loading: true
                                          }
                                        });
                                        Group.removeQuery(
                                          {
                                            id: record.groupid, query_id: this.state.query.id
                                          },
                                          () => {
                                            this.getGroupsWithPermission();
                                            message.success("删除用户分组.");
                                          }, err => {
                                            message.error("删除用户分组权限失败.");
                                          });
                                      }}
                                    >
                                      <Icon type="delete" />删除
                                    </Button>
                                  </span>
                                )
                              },
                            }
                          ]}
                          dataSource={this.state.permissions.groups}
                          loading={this.state.permissions.loading}
                        />
                      </p>
                      <div align="right">
                        <UserGroupPermissionDialog
                          component={this.state.query}
                          componentType='query'
                          callback={() => { this.getGroupsWithPermission(); }}
                        />
                      </div>
                    </>
                  ) : null
                }
              </div>
              <Divider />
              <div style={{ width: '100%' }}>
                <b style={{ fontSize: '14px' }}>数据集描述:</b>
                <div>
                  <TextArea
                    disabled={this.state.query.readOnly()}
                    placeholder="数据集描述"
                    rows={4}
                    value={this.state.query.description}
                    onChange={e => {
                      this.setState({
                        query: _.extend(this.state.query, {
                          description: e.target.value
                        })
                      });
                    }}
                  />
                </div>
                <div align="right" style={{ paddingTop: '10px' }}>
                  <Button
                    type="primary"
                    disabled={this.state.query.readOnly()}
                    onClick={() => {
                      this.saveQuery(null, {
                        description: this.state.query.description
                      });
                    }}
                  >
                    <Icon type="save" />
                    保存
                  </Button>
                </div>
                <b style={{ fontSize: '14px' }}>新建可视化组件:</b>
                <div align="right" style={{ paddingTop: '10px' }}>
                  <Button
                    type="primary"
                    onClick={e => {
                      navigateToWithSearch(
                        '/query/' + this.state.query.id + '/charts/new'
                      );
                    }}
                  >
                    <Icon type="pie-chart" />
                    新建可视化组件
                  </Button>
                </div>
                <hr />
                <b style={{ fontSize: '14px' }}>其他设置:</b>
                <br />
                {
                  !this.state.query.readOnly() ? (
                    <>
                      <Button
                        type="primary"
                        onClick={e => {
                          navigateToWithSearch(
                            '/queries/' + this.props.queryId + '/source'
                          );
                        }}
                      >
                        <i className="fa fa-edit m-r-5" />
                        编辑数据集
                      </Button>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <Popconfirm
                        placement="topLeft"
                        title="确认删除数据集?"
                        onConfirm={this.deleteQuery}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Button type="danger">
                          <Icon type="delete" />
                          删除数据集
                        </Button>
                      </Popconfirm>
                    </>
                  ) : null
                }
              </div>
              <Divider />
              <div style={{ width: '100%', float: 'left' }}>
                <b style={{ fontSize: '14px' }}>数据集参数配置:</b>
                {this.state.query.getParametersDefs().length <= 0 ? (
                  <Row>
                    <Col span={24}>
                      <p>该数据集没有设置参数</p>
                      <div align="right">
                        <ButtonGroup>
                          <Button
                            type="primary"
                            onClick={e => {
                              this.getTemporaryQueryResult();
                              message.success("数据刷新完成.");
                            }}
                          >
                            <Icon type="sync" />
                            刷新预览
                          </Button>
                          {
                            !this.state.query.readOnly() ? (
                              <Button
                                type="primary"
                                onClick={e => {
                                  navigateToWithSearch(
                                    '/queries/' + this.props.queryId + '/source'
                                  );
                                }}
                              >
                                <Icon type="setting" />
                                设置参数
                              </Button>
                            ) : null
                          }
                        </ButtonGroup>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Row>
                    {_.map(this.state.query.getParametersDefs(), parameter => (
                      <Col span={12}>
                        <Form>
                          <Form.Item
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            label={parameter.title}
                            help={
                                'ID:' + parameter.name + ',类型:' + parameter.type
                              }
                          >
                            <ParameterValueInput
                              type={parameter.type}
                              value={parameter.normalizedValue}
                              parameter={parameter}
                              enumOptions={parameter.enumOptions}
                              queryId={parameter.queryId}
                              onSelect={value => {
                                  parameter.setValue(value);
                                }}
                            />
                          </Form.Item>
                        </Form>
                      </Col>
                      ))}
                    <Col span={24}>
                      <div align="right">
                        <ButtonGroup>
                          <Button
                            type="primary"
                            onClick={e => {
                                message.info("注: 预览数据不会改变数据集原始数据,改变参数设置请点击'设置参数'按钮.");
                                this.getTemporaryQueryResult();
                              }}
                          >
                            <Icon type="sync" />
                            刷新预览
                          </Button>
                          <Button
                            type="primary"
                            onClick={e => {
                                navigateToWithSearch(
                                  '/queries/' + this.props.queryId + '/source'
                                );
                              }}
                          >
                            <Icon type="setting" />
                            设置参数
                          </Button>
                        </ButtonGroup>
                      </div>
                    </Col>
                  </Row>
                  )}
              </div>
              <div style={{ width: '100%', float: 'left' }}>
                <b style={{ fontSize: '14px' }}>数据集数据预览:</b>
                {this.state.queryResult == null ? (
                  <Empty description="该数据集暂无数据" />
                ) : (
                  <>
                    <div
                      style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#25374C'
                        }}
                      id="Preview"
                    >
                      {this.state.runTimeLoading ? (
                        <LoadingState />
                      ) : (
                        <TablePreviewDOM
                          visualization={this.state.tableData}
                          queryResult={this.state.queryResultRaw}
                        />
                      )}
                    </div>
                  </>
                  )}
              </div>
            </div>
          </>
        )}
      </>
    );
  }
}

QueriesListTabs.propTypes = {
  queryId: PropTypes.string,
  queriesTabCb: PropTypes.func
};

QueriesListTabs.defaultProps = {
  queryId: null,
  queriesTabCb: a => { }
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

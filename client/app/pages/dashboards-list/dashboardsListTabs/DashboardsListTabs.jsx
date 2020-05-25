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
  Tag,
  Input,
  Checkbox,
  notification,
  Popconfirm,
  Switch,
  Tabs,
  Form,
  message
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
import InputWithCopy from '@/components/InputWithCopy';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Dashboard } from '@/services/dashboard';
import { Group } from '@/services/group';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';

import { DashboardsPreview } from '@/components/dashboards-preview/dashboards-preview';
import UserGroupPermissionDialog from '@/components/groups/UserGroupPermissionDialog';
import { durationHumanize } from '@/filters';
import PromiseRejectionError from '@/lib/promise-rejection-error';
import { navigateToWithSearch } from '@/services/navigateTo';
import { $http } from '@/services/ng';
import { appSettingsConfig } from '@/config/app-settings';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;
const { TextArea } = Input;

const emptyChartImg = '/static/images/emptyChart.png';
const API_SHARE_URL =
  appSettingsConfig.server.backendUrl + '/api/dashboards/{id}/share';
const DASHBOARD_SHARE_URL = window.location.origin + '/public/dashboards/';

let DashboardsPreviewDOM;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class DashboardsListTabs extends React.Component {
  state = {};

  componentDidMount() {
    const { slugId } = this.props;

    this.setState({
      isLoaded: true,
      dashboard: null,
      runtime: {
        share: {
          public: null,
          apiurl: null,
          saving: false,
          disabled: true
        }
      },
      permissions: {
        loading: false,
        groups: null
      }
    });

    DashboardsPreviewDOM = angular2react(
      'dashboardsPreview',
      DashboardsPreview,
      window.$injector
    );

    if (slugId) {
      this.getDashboard(slugId);
    }

    notification.destroy();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.slugId !== this.props.slugId) {
      if (!nextProps.slugId) {
        this.setState({
          isLoaded: true,
          dashboard: null
        });
      } else {
        this.getDashboard(nextProps.slugId);
      }
    }
  }

  getDashboard = slugId => {
    this.setState({
      isLoaded: false,
      dashboard: null
    });
    Dashboard.get(
      { slug: slugId },
      dashboard => {
        this.setState({
          runtime: {
            share: {
              public: dashboard.publicAccessEnabled
                ? DASHBOARD_SHARE_URL + dashboard.api_key
                : '打开可视化面板共享按钮以获取url链接',
              api: _.replace(API_SHARE_URL, '{id}', dashboard.id),
              saving: false,
              disabled: dashboard.is_draft
            }
          },
          isLoaded: true,
          dashboard
        });
        if (
          !(
            currentUser.id === dashboard.user.id ||
            currentUser.hasPermission('admin')
          )
        ) {
          message.warning('该可视化仪表盘由其他用户创建.');
        }
        this.getGroupsWithPermission();
      },
      rejection => {
        this.setState({
          isLoaded: true,
          dashboard: null
        });
      }
    );
  };

  deleteDashboard = () => {
    if (this.state.dashboard && this.state.dashboard.id) {
      this.setState({ isLoaded: false });
      this.state.dashboard.$delete().then(
        res => {
          message.success(
            '可视化仪表板' + this.state.dashboard.name + '已删除.'
          );
          this.props.dashboardTabCb(null);
          this.setState({ isLoaded: true, dashboard: null });
        },
        err => {
          message.error('无法删除,请刷新页面后重试.');
          this.setState({ isLoaded: true });
        }
      );
    } else {
      message.error('无法删除,请刷新页面后重试.');
    }
  };

  updateDashboard = data => {
    _.extend(this.state.dashboard, data);
    data = _.extend({}, data, {
      slug: this.state.dashboard.id,
      version: this.state.dashboard.version
    });
    Dashboard.save(
      data,
      dashboard => {
        _.extend(this.state.dashboard, _.pick(dashboard, _.keys(data)));
        message.success('可视化面板更新成功');
      },
      error => {
        message.error('可视化面板更新失败', '出现错误');
      }
    );
  };

  onChange = checked => {
    if (checked) {
      this.enableAccess();
    } else {
      this.disableAccess();
    }
  };

  enableAccess = () => {
    const { dashboard } = this.state;
    this.setState({
      runtime: {
        share: {
          saving: true
        }
      }
    });

    if (this.state.runtime.share.api) {
      $http
        .post(this.state.runtime.share.api)
        .success(data => {
          dashboard.publicAccessEnabled = true;
          this.setState({
            runtime: {
              share: {
                public: DASHBOARD_SHARE_URL + data.api_key,
                api: _.replace(API_SHARE_URL, '{id}', dashboard.id),
                saving: false
              }
            }
          });
        })
        .error(() => {
          message.error('未能打开此可视化面板的共享');
          this.setState({
            runtime: {
              share: {
                public: '打开可视化面板共享按钮以获取url链接',
                api: _.replace(API_SHARE_URL, '{id}', dashboard.id),
                saving: false
              }
            }
          });
        })
        .finally(() => { });
    } else {
      message.error('无法访问服务器,打开/关闭共享失败,请刷新页面后重试');
      this.setState({
        runtime: {
          share: {
            public: DASHBOARD_SHARE_URL + dashboard.api_key,
            api: _.replace(API_SHARE_URL, '{id}', dashboard.id),
            saving: false,
            disabled: false
          }
        }
      });
    }
  };

  disableAccess = () => {
    const { dashboard } = this.state;
    this.setState({
      runtime: {
        share: {
          saving: true
        }
      }
    });

    if (this.state.runtime.share.api) {
      $http
        .delete(this.state.runtime.share.api)
        .success(() => {
          dashboard.publicAccessEnabled = false;
          delete dashboard.api_key;
          this.setState({
            runtime: {
              share: {
                public: '打开可视化面板共享按钮以获取url链接',
                api: _.replace(API_SHARE_URL, '{id}', dashboard.id),
                saving: false
              }
            }
          });
        })
        .error(() => {
          message.error('未能关闭此可视化面板的共享');
          this.setState({
            runtime: {
              share: {
                public: DASHBOARD_SHARE_URL + dashboard.api_key,
                api: _.replace(API_SHARE_URL, '{id}', dashboard.id),
                saving: false,
                disabled: false
              }
            }
          });
        })
        .finally(() => { });
    } else {
      message.error('无法访问服务器,打开/关闭共享失败,请刷新页面后重试');
      this.setState({
        runtime: {
          share: {
            public: DASHBOARD_SHARE_URL + dashboard.api_key,
            api: _.replace(API_SHARE_URL, '{id}', dashboard.id),
            saving: false,
            disabled: false
          }
        }
      });
    }
  };

  getGroupsWithPermission = () => {
    const { dashboard } = this.state;
    this.setState({
      permissions: {
        loading: true,
        groups: null
      }
    });

    Group.groupsByDashboardId({ id: this.state.dashboard.id }, result => {
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
      message.warning('无法获取该仪表板分组权限设置.');
      this.setState({
        permissions: {
          loading: false,
          groups: null
        }
      });
    });
  }

  render() {
    const { slugId } = this.props;
    return (
      <>
        {!this.state.isLoaded && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && this.state.dashboard == null && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <img src={emptyChartImg} alt="" style={{ width: 100 }} />
            <br />
            <p>选择可视化面板</p>
          </div>
        )}
        {this.state.isLoaded && this.state.dashboard != null && (
          <div style={{ paddingTop: '10px' }}>
            <div style={{ width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
              <Descriptions title="可视化仪表盘信息">
                <Descriptions.Item label="更新时间">
                  {this.state.dashboard.updated_at}
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  {this.state.dashboard.version}
                </Descriptions.Item>
                <Descriptions.Item label="创建者">
                  {this.state.dashboard.created_by.name}
                </Descriptions.Item>
                <Descriptions.Item label="可编辑">
                  {!this.state.dashboard.readOnly() ? '是' : '否'}
                </Descriptions.Item>
                <Descriptions.Item label="面板引用ID">
                  {this.state.dashboard.slug}
                </Descriptions.Item>
                <Descriptions.Item label="该面板中可视化组件数量">
                  {this.state.dashboard.widgets.length}
                </Descriptions.Item>
              </Descriptions>
              <b style={{ fontSize: '14px' }}>可视化面板共享设置:</b>
              <div style={{ paddingRight: '10px' }}>
                <Form>
                  <hr />
                  <Form.Item
                    label="可视化面板对其他人可见"
                    labelAlign="left"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 4, offset: 10 }}
                  >
                    <Switch
                      disabled={this.state.dashboard.readOnly()}
                      checkedChildren="开"
                      unCheckedChildren="关"
                      defaultChecked={!this.state.dashboard.is_draft}
                      onChange={checked => {
                        this.updateDashboard({
                          is_draft: !checked
                        });
                        if (!checked) {
                          // Set public share
                          this.disableAccess();
                        } else {
                          this.setState({
                            runtime: {
                              share: {
                                public: this.state.dashboard.publicAccessEnabled
                                  ? DASHBOARD_SHARE_URL + this.state.dashboard.api_key
                                  : '打开可视化面板共享按钮以获取url链接',
                                api: _.replace(API_SHARE_URL, '{id}', this.state.dashboard.id),
                                saving: false,
                                disabled: false
                              }
                            }
                          });
                        }
                      }}
                    />
                  </Form.Item>
                  <hr />
                  <Form.Item
                    label="共享可视化面板"
                    labelAlign="left"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 4, offset: 10 }}
                  >
                    <Switch
                      disabled={this.state.runtime.share.disabled || this.state.dashboard.readOnly()}
                      checkedChildren="开"
                      unCheckedChildren="关"
                      checked={this.state.dashboard.publicAccessEnabled}
                      onChange={this.onChange}
                      loading={this.state.runtime.share.saving}
                    />
                  </Form.Item>
                  <Form.Item
                    label="共享可视化面板URL"
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                  >
                    <InputWithCopy value={this.state.runtime.share.public} />
                  </Form.Item>
                </Form>
                <hr />
              </div>
              {
                currentUser.isAdmin ? (
                  <>
                    <p style={{ fontSize: '14px' }}>可视化仪表板权限设定:</p>
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
                                        Group.updateDashboardPermission({
                                          id: record.groupid, dashboard_id: this.state.dashboard.id
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
                                      Group.removeDashboard(
                                        { 
                                          id: record.groupid, dashboard_id: this.state.dashboard.id 
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
                        component={this.state.dashboard}
                        componentType='dashboard'
                        callback={() => { this.getGroupsWithPermission(); }}
                      />
                    </div>
                    <hr />
                  </>
                ) : null
              }
            </div>

            <div style={{ width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
              <b style={{ fontSize: '14px' }}>可视化仪表板描述:</b>
              <TextArea
                disabled={this.state.dashboard.readOnly()}
                placeholder="可视化仪表板描述"
                rows={6}
                value={this.state.dashboard.description}
                onChange={e => {
                  this.setState({
                    dashboard: _.extend(this.state.dashboard, {
                      description: e.target.value
                    })
                  });
                }}
              />

              <div align="right" style={{ paddingTop: '10px' }}>
                <Button
                  disabled={this.state.dashboard.readOnly()}
                  type="primary"
                  onClick={e => {
                    this.updateDashboard({
                      description: this.state.dashboard.description
                    });
                  }}
                >
                  <Icon type="save" />
                  保存
                </Button>
              </div>
              <b style={{ fontSize: '14px' }}>预览:</b>
              <br />
              <Button
                type="primary"
                target="_blank"
                href={'/view/' + this.state.dashboard.slug}
              >
                <Icon type="dashboard" />
                预览可视化面板
              </Button>
              <br />
              <br />
              {
                !this.state.dashboard.readOnly() ? (
                  <>
                    <b style={{ fontSize: '14px' }}>其他设置:</b>
                    <br />
                    <Button
                      type="primary"
                      disabled={slugId == null || this.state.dashboard.readOnly()}
                      onClick={e => {
                        navigateToWithSearch('dashboards/' + slugId);
                      }}
                    >
                      <i className="fa fa-edit m-r-5" />
                      编辑可视化面板
                    </Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Popconfirm
                      placement="topLeft"
                      title="确认删除可视化仪表盘?"
                      onConfirm={this.deleteDashboard}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button type="danger" disabled={this.state.dashboard.readOnly()}>
                        <Icon type="delete" />
                        删除可视化面板
                      </Button>
                    </Popconfirm>
                  </>
                ) : null
              }
            </div>
          </div>
        )}
      </>
    );
  }
}

DashboardsListTabs.propTypes = {
  slugId: PropTypes.string,
  dashboardTabCb: PropTypes.func.isRequired
};

DashboardsListTabs.defaultProps = {
  slugId: null
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsListTabs',
    react2angular(
      DashboardsListTabs,
      Object.keys(DashboardsListTabs.propTypes),
      ['$scope', 'appSettings']
    )
  );
}

init.init = true;

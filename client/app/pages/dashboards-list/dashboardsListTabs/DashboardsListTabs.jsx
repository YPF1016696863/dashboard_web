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
  Input,
  Checkbox,
  notification,
  Statistic,
  Switch,
  Tabs,
  Card,
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
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Dashboard } from '@/services/dashboard';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';

import { DashboardsPreview } from '@/components/dashboards-preview/dashboards-preview';
import { durationHumanize } from '@/filters';
import PromiseRejectionError from '@/lib/promise-rejection-error';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;
const { TextArea } = Input;

const emptyChartImg = '/static/images/emptyChart.png';

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
        name: null
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
      this.getDashboard(nextProps.slugId);
    }
  }

  getDashboard = slugId => {
    this.setState({
      isLoaded: false,
      dashboard: null,
      runtime: {
        name: null
      }
    });
    Dashboard.get(
      { slug: slugId },
      dashboard => {
        this.setState({
          isLoaded: true,
          dashboard,
          runtime: {
            name: dashboard.name
          }
        });
        if (
          !(
            currentUser.id === dashboard.user.id ||
            currentUser.hasPermission('admin')
          )
        ) {
          message.warning('该可视化仪表盘由其他用户创建.');
        }
      },
      rejection => {
        this.setState({
          isLoaded: true,
          dashboard: null
        });
      }
    );
  };

  connectCb = (isLoaded, loadSuccess) => {
    this.setState({
      isLoaded
    });
  };

  deleteDashboard = () => {
    notification.error({
      message: `消息`,
      description: '功能暂未开放.',
      placement: 'bottomRight'
    });
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

  render() {
    const { slugId } = this.props;

    return (
      <>
        {!this.state.isLoaded && (
          <Tabs defaultActiveKey="1" type="card" className="queries-tab">
            {/*
            <TabPane tab="可视化面板预览" key="1" disabled>
              <div className="align-center-div" style={{ paddingTop: '15%' }}>
                <LoadingState />
              </div>
            </TabPane>
            */}
            <TabPane tab="可视化面板设置" key="2" disabled />
          </Tabs>
        )}
        {this.state.isLoaded && this.state.dashboard == null && (
          <Tabs defaultActiveKey="1" type="card" className="queries-tab">
            {/*
            <TabPane tab="可视化面板预览" key="1" disabled>
              <div className="align-center-div" style={{ paddingTop: '15%' }}>
                <img src={emptyChartImg} alt="" style={{ width: 100 }} />
                <br />
                <p>选择可视化面板</p>
              </div>
            </TabPane>
            */}
            <TabPane tab="可视化面板设置" key="2" disabled />
          </Tabs>
        )}
        {this.state.isLoaded && this.state.dashboard != null && (
          <Tabs defaultActiveKey="1" type="card" className="queries-tab">
            {/*
            <TabPane tab="可视化面板预览" key="1">
              <DashboardsPreviewDOM
                slugId={slugId}
                connectCb={this.connectCb}
              />
            </TabPane>
            */}
            <TabPane
              tab="可视化面板设置"
              key="2"
              style={{ paddingRight: '10px' }}
            >
              <Descriptions
                title={
                  <Input
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
                <Descriptions.Item label="更新时间">
                  {this.state.dashboard.updated_at}
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  {this.state.dashboard.version}
                </Descriptions.Item>
                <Descriptions.Item label="创建者">
                  {this.state.dashboard.user.name}
                </Descriptions.Item>
                <Descriptions.Item label="可编辑">
                  {this.state.dashboard.can_edit ? (
                    <Switch disabled defaultChecked checkedChildren="是" />
                  ) : (
                    <Switch disabled unCheckedChildren="否" />
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="面板引用ID">
                  {this.state.dashboard.slug}
                </Descriptions.Item>
              </Descriptions>

              <Statistic
                title="该面板中可视化组件数量"
                value={this.state.dashboard.widgets.length}
              />
              <br />
              <p style={{ fontSize: '14px' }}>可视化面板共享设置:</p>
              <Card bodyStyle={{ paddingTop: '10px', paddingBottom: '10px' }}>
                <Statistic
                  title="可视化面板共享"
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
                    <Input value="暂时无法获取可视化面板链接地址" readOnly />
                  </Col>
                  <Col span={6}>
                    <Button type="primary" style={{ marginLeft: '15px' }}>
                      <Icon type="copy" /> 拷贝连接
                    </Button>
                  </Col>
                </Row>
              </Card>
              <br />
              <p style={{ fontSize: '14px' }}>可视化仪表板描述:</p>
              <TextArea placeholder="可视化仪表板描述" rows={7} />
              <br />
              <br />
              <div align="right">
                <Button
                  type="primary"
                  onClick={() => {
                    this.updateDashboard({
                      name: this.state.runtime.name
                    });
                  }}
                >
                  <Icon type="dashboard" />
                  更新可视化仪表盘
                </Button>
              </div>
              <br />
              <br />
              <p style={{ fontSize: '14px' }}>其他设置:</p>
              <Button
                type="primary"
                disabled={slugId == null}
                target="_blank"
                href={'dashboards/' + slugId}
              >
                <i className="fa fa-edit m-r-5" />
                编辑可视化面板
              </Button>
              <br />
              <br />
              <Button type="danger" onClick={this.deleteDashboard}>
                <Icon type="delete" />
                删除可视化面板
              </Button>
            </TabPane>
          </Tabs>
        )}
      </>
    );
  }
}

DashboardsListTabs.propTypes = {
  slugId: PropTypes.string
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

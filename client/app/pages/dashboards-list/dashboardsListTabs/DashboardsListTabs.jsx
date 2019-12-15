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
      dashboard: null
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
      dashboard: null
    });
    Dashboard.get(
      { slug: slugId },
      dashboard => {
        this.setState({
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
          <div style={{ padding: '10px' }}>
            <Descriptions>
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
                {this.state.dashboard.can_edit ? '是' : '否'}
              </Descriptions.Item>
              <Descriptions.Item label="面板引用ID">
                {this.state.dashboard.slug}
              </Descriptions.Item>
              <Descriptions.Item label="该面板中可视化组件数量">
                {this.state.dashboard.widgets.length}
              </Descriptions.Item>
            </Descriptions>
            <br />
            <p style={{ fontSize: '14px' }}>可视化仪表板描述:</p>
            <TextArea placeholder="可视化仪表板描述" rows={4} />
            <br />
            <br />
            <div align="right">
              <Button type="primary" onClick={() => {}}>
                <Icon type="save" />
                保存
              </Button>
            </div>
            <Divider />
            <p style={{ fontSize: '14px' }}>可视化面板共享设置:</p>

            <Form>
              <Form.Item
                label="共享可视化面板"
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
                label="共享可视化面板URL"
                labelAlign="left"
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 22 }}
              >
                <Input
                  value="暂时无法获取可视化面板链接地址"
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
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <p style={{ fontSize: '14px' }}>预览:</p>
                <Button type="primary">
                  <Icon type="dashboard" />
                  预览可视化面板
                </Button>
              </Col>

              <Col span={24}>
                <br />
              </Col>

              <Col span={24}>
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
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button type="danger" onClick={this.deleteDashboard}>
                  <Icon type="delete" />
                  删除可视化面板
                </Button>
              </Col>
            </Row>
          </div>
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

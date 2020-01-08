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
  Alert,
  Modal,
  Form,
  message
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';

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

import './dashboards-search.css';

import { policy } from '@/services/policy';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class DashboardsListSearch extends React.Component {
  state = {
    dashboard: null,
    editMode: false,
    rename: null,
    selected: null,
    dashboardName: '',
    all: null,
    filtered: null,
    loading: true,
    visible: false
  };

  componentDidMount() {
    Dashboard.allDashboards().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });

      if(this.props.slugId) {
        this.setState({
          selected: this.props.slugId
        });
        this.props.dashboardSearchCb([this.props.slugId]);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.slugId === null) {
      this.reload();
    }
  }

  // eslint-disable-next-line react/sort-comp
  reload(holdTab) {
    let dashboardid = null;
    let dashboard = null;
    if (holdTab) {
      dashboardid = this.state.selected;
      dashboard = this.state.dashboard;
    }
    this.props.dashboardSearchCb([dashboardid]);
    this.setState({
      dashboard,
      selected: dashboardid,
      all: null,
      filtered: null,
      loading: true
    });
    Dashboard.allDashboards().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });
    });
  }

  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
    this.props.dashboardSearchCb(null);
    if (value === '' || value === null) {
      this.setState({
        filtered: allItems
      });
    } else {
      this.setState({
        filtered: _.filter(allItems, item => item.name.includes(value))
      });
    }
  }

  orderBy(value) {
    this.props.dashboardSearchCb(null);
    this.setState({
      filtered: _.orderBy(this.state.filtered, item => item[value])
    });
  }

  updateDashboard = data => {
    _.extend(this.state.dashboard, data);
    data = _.extend({}, data, {
      slug: this.state.dashboard.id,
      version: this.state.dashboard.version
    });
    Dashboard.save(
      data,
      dashboard => {
        message.success('可视化面板信息更新成功');
        this.reload(true);
      },
      error => {
        message.error('可视化面板更新失败', '出现错误');
      }
    );
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  hideModal = () => {
    this.setState({
      visible: false
    });
    if (policy.isCreateDashboardEnabled()) {
      if (_.isEmpty(this.state.dashboardName)) {
        message.error('仪表板名称不能为空');
        return;
      }

      this.props.$http
        .post(this.props.appSettings.server.backendUrl + '/api/dashboards', {
          name: this.state.dashboardName
        })
        .success(response => {
          this.props.$location
            .path(`/dashboards/${response.slug}`)
            .search('edit')
            .replace();
        });
    }
  };

  newName = e => {
    const { value } = e.target;
    this.setState({ dashboardName: value });
  };

  render() {
    const { appSettings } = this.props;

    return (
      <>
        {this.state.loading && <LoadingState />}
        {!this.state.loading && (
          <>
            <Row>
              <Col>
                <Row>
                  <Col span={12}>
                    <div style={{ fontWeight: 'bold', paddingBottom: '10px' }}>
                      可视化仪表盘列表:
                    </div>
                  </Col>
                  <Col span={11} align="right">
                    {policy.isCreateDashboardEnabled() ? (
                      <Modal
                        destroyOnClose
                        title="新建仪表盘"
                        visible={this.state.visible}
                        onOk={this.hideModal}
                        onCancel={this.hideModal}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Form
                          onSubmit={this.handleSubmit}
                          className="login-form"
                        >
                          <Form.Item label="仪表盘名称">
                            <Input
                              prefix={
                                <Icon
                                  type="dashboard"
                                  style={{ color: 'rgba(0,0,0,.25)' }}
                                />
                              }
                              placeholder="新仪表盘"
                              onChange={this.newName}
                            />
                          </Form.Item>
                        </Form>
                      </Modal>
                    ) : (
                      <Modal
                        destroyOnClose
                        title="新建仪表盘"
                        visible={this.state.visible}
                        onOk={this.hideModal}
                        onCancel={this.hideModal}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Alert
                          message="错误"
                          description="无法创建可视化仪表板，原因：权限受限"
                          type="warning"
                          showIcon
                        />
                      </Modal>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col span={18}>
                    <Search
                      placeholder="搜索可视化仪表板..."
                      size="small"
                      onChange={e => {
                        this.searchBy(e.target.value);
                      }}
                    />
                  </Col>
                  <Col span={2} offset={1}>
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item
                            key="1"
                            onClick={() => this.orderBy('name')}
                          >
                            <Icon type="sort-ascending" />
                            按名称排序
                          </Menu.Item>
                          <Menu.Item
                            key="2"
                            onClick={() => this.orderBy('created_at')}
                          >
                            <Icon type="clock-circle" />
                            按创建时间排序
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button icon="menu-fold" size="small" />
                    </Dropdown>
                  </Col>
                  <Col span={2}>
                    <Button
                      icon="reload"
                      size="small"
                      onClick={() => {
                        this.reload();
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={8}><Button size="small" type="link" style={{color:"#3d4d66"}} onClick={this.showModal}><Icon type="plus-square" style={{color:"#13cd66"}} />新建仪表盘</Button></Col>
              <Col span={8}><Button size="small" type="link" style={{color:"#3d4d66"}}><Icon type="folder-add" style={{color:"#faaa39"}} />新建文件夹</Button></Col>
              <Col span={8}><Button size="small" type="link" style={{color:"#3d4d66"}}><Icon type="folder-open" style={{color:"#3685f2"}} />移动到</Button></Col>
              <Col span={24}><Divider style={{marginTop:"5px", marginBottom:"0"}} /></Col>
            </Row>
            <Row>
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  defaultExpandedKeys={['datavis-group#ungrouped']}
                  onSelect={(value, node, extra) => {
                    const stillEdit = value[0] === this.state.selected;
                    this.setState({
                      selected: value[0],
                      editMode: stillEdit,
                      dashboard: _.find(
                        this.state.all,
                        dashboard => dashboard.slug === value[0]
                      )
                    });
                    this.props.dashboardSearchCb(value);
                  }}
                  selectedKeys={[this.state.selected]}
                >
                  <TreeNode
                    title="可视化仪表板(无分组)"
                    key="datavis-group#ungrouped"
                    selectable={false}
                  >
                    {_.map(this.state.filtered, item => {
                      return (
                        <TreeNode
                          icon={
                            <Icon
                              type="dashboard"
                              style={{ color: '#801336' }}
                            />
                          }
                          title={
                            <span
                              onDoubleClick={event => {
                                this.setState({ editMode: true });
                              }}
                            >
                              {this.state.editMode &&
                              this.state.selected &&
                              this.state.selected === item.slug ? (
                                <Input
                                  autoFocus
                                  size="small"
                                  value={this.state.rename}
                                  onFocus={event => {
                                    this.setState({ rename: item.name });
                                  }}
                                  onChange={event => {
                                    this.setState(
                                      {
                                        rename: event.target.value
                                      },
                                      () => {}
                                    );
                                  }}
                                  onBlur={() => {
                                    this.setState({ editMode: false });
                                    if (this.state.rename === item.name) {
                                      console.log('NO CHANGE');
                                    } else {
                                      this.setState({ loading: true });
                                      this.updateDashboard({
                                        name: this.state.rename
                                      });
                                    }
                                  }}
                                  onPressEnter={() => {
                                    this.setState({ editMode: false });
                                    if (this.state.rename === item.name) {
                                      console.log('NO CHANGE');
                                    } else {
                                      this.setState({ loading: true });
                                      this.updateDashboard({
                                        name: this.state.rename
                                      });
                                    }
                                  }}
                                />
                              ) : (
                                item.name
                              )}
                            </span>
                          }
                          key={item.slug}
                          isLeaf
                        />
                      );
                    })}
                  </TreeNode>
                </DirectoryTree>
              </Col>
            </Row>
          </>
        )}
      </>
    );
  }
}

DashboardsListSearch.propTypes = {
  slugId: PropTypes.string,
  dashboardSearchCb: PropTypes.func.isRequired
};

DashboardsListSearch.defaultProps = {
  slugId:null
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsListSearch',
    react2angular(
      DashboardsListSearch,
      Object.keys(DashboardsListSearch.propTypes),
      ['appSettings', '$http', '$location']
    )
  );
}

init.init = true;

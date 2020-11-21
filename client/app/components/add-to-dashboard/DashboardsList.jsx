import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Dropdown,
  Menu,
  Icon,
  Modal,
  Row,
  Col,
  Tree,
  Input,
  Alert,
  Empty,
  message,
  Tabs
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';

import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';
import {
  editableMappingsToParameterMappings,
  synchronizeWidgetTitles
} from '@/components/ParameterMappingInput';
import {
  wrap as itemsList,
  ControllerType
} from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { UrlStateStorage } from '@/components/items-list/classes/StateStorage';
import { navigateTo } from '@/services/navigateTo';
import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';
import { Dashboard } from '@/services/dashboard';
import { Widget } from '@/services/widget';
import { policy } from '@/services/policy';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

export class DashboardsList extends React.Component {
  state = {
    visible: false,
    selected: null,
    all: null,
    filtered: null,
    loading: true,
    selectedName: '选择仪表板'
  };

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.reload, prevProps.reload)) {
      this.reload(true);
    }
  }

  getDashboardOverview() {
    const visualizationId = this.props.visualization.id;

    if (!visualizationId) {
      this.setState({
        selected: null,
        all: null,
        filtered: null
      });
      return Promise.resolve('OK');
    }

    return Dashboard.dashboardsOverview()
      .$promise.then(overview => {
        // split overview response into two parts:
        // part 1:
        this.setState(
          {
            all: _.filter(
              overview,
              dashboard =>
                !_.find(
                  dashboard.visualizations,
                  visualization => visualization === _.parseInt(visualizationId)
                )
            ),
            filtered: _.filter(
              overview,
              dashboard =>
                !_.find(
                  dashboard.visualizations,
                  visualization => visualization === _.parseInt(visualizationId)
                )
            )
          },
          () => {}
        );
      })
      .catch(err => {
        console.log(err);
        this.setState({
          selected: null,
          all: null,
          filtered: null
        });
      });
  }

  showModal = () => {
    this.reload();
  };

  handleOk = e => {
    if (this.state.selected === null) {
      message.warning('请选择一个仪表板.');
      return;
    }
    this.addWidget();
  };

  handleCancel = e => {
    this.setState({
      visible: false,
      selected: null
    });
  };

  addWidget = () => {
    this.setState({
      loading: true
    });
    Dashboard.get(
      { slug: this.state.selected },
      dashboard => {
        const visualization = this.props.visualization;

        const widget = new Widget({
          visualization_id: visualization.id,
          dashboard_id: dashboard.id,
          options: {
            isHidden: false,
            position: {},
            parameterMappings: editableMappingsToParameterMappings({})
          },
          visualization,
          text: ''
        });

        const position = dashboard.calculateNewWidgetPosition(widget);
        widget.options.position.col = position.col;
        widget.options.position.row = position.row;
        const widgetsToSave = [
          widget,
          ...synchronizeWidgetTitles(
            widget.options.parameterMappings,
            dashboard.widgets
          )
        ];

        return Promise.all(widgetsToSave.map(w => w.save())).then(() => {
          message.success(
            '可视化组件' +
              visualization.name +
              '已经添加到仪表板' +
              dashboard.name
          );
          this.setState({
            loading: false,
            visible: false
          });
          this.props.onSuccess();
        });
      },
      rejection => {
        message.error('获取可视化面板失败,请刷新后重试.');
        this.setState({
          loading: false
        });
      }
    );
  };

  reload() {
    this.setState({
      loading: true,
      selected: null,
      visible: true
    });
    this.setState({ loading: true });
    Promise.all([this.getDashboardOverview()]).finally(() => {
      this.setState({ loading: false });
    });
  }

  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
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
    this.setState({
      filtered: _.reverse(_.orderBy(this.state.filtered, item => item[value]))
    });
  }

  render() {
    const { appSettings } = this.props;
    const { selectedName } = this.state;
    return (
      <>
        <Button type="primary" onClick={this.showModal}>
          <i className="fa fa-plus m-r-5" />
          添加至仪表板
        </Button>
        <Modal
          destroyOnClose
          title="选择仪表板"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="25vw"
          cancelText="取消"
          okText="添加"
        >
          {this.state.loading && (
            <div
              className="scrollbox"
              style={{ maxHeight: '45vh', minHeight: '45vh' }}
            >
              <LoadingState />
            </div>
          )}
          {!this.state.loading && (
            <div style={{ maxHeight: '50vh' }}>
              <Row>
                <Col>
                  <Row>
                    <Col span={12}>
                      <div
                        style={{ fontWeight: 'bold', paddingBottom: '10px' }}
                      >
                        仪表板列表:
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={18}>
                      <Search
                        placeholder="搜索查询..."
                        size="small"
                        onChange={e => {
                          this.searchBy(e.target.value);
                        }}
                      />
                    </Col>
                    <Col span={2} offset={1}>
                      <Dropdown
                        overlay={(
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
                        )}
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
                <Col>
                  <div
                    className="scrollbox"
                    style={{ maxHeight: '45vh', minHeight: '45vh' }}
                  >
                    <DirectoryTree
                      defaultExpandAll
                      onSelect={(value, node, extra) => {
                        this.setState({ selected: value[0] });
                      }}
                      selectedKeys={[this.state.selected]}
                    >
                      <TreeNode
                        icon={(
                          <Icon
                            type="container"
                            style={{ color: 'darkmagenta' }}
                          />
                          )}
                        title="可视化仪表盘总集合(无分组)"
                        key="datavis-group#ungrouped"
                      >
                        {_.map(this.state.filtered, item => (                          
                          <TreeNode
                            icon={(
                              <Icon
                                type="dashboard"
                                style={{ color: '#801336' }}
                              />
                            )}
                            title={item.name}
                            key={item.slug}
                            isLeaf
                          />
                        ))}
                      </TreeNode>
                    </DirectoryTree>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </>
    );
  }
}

DashboardsList.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  visualization: PropTypes.object,
  onSuccess: PropTypes.func
};

DashboardsList.defaultProps = {
  visualization: null,
  onSuccess: ()=>{}
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsList',
    react2angular(DashboardsList, Object.keys(DashboardsList.propTypes), [
      'appSettings',
      '$location'
    ])
  );
}

init.init = true;

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
  Modal,
  Table,
  Alert,
  Empty,
  BackTop,
  message,
  Popconfirm,
  Switch,
  Statistic,
  Form,
  Input
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { angular2react } from 'angular2react';
import * as _ from 'lodash';
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
import { Dashboard } from '@/services/dashboard';
import notification from '@/services/notification';
import { navigateToWithSearch, navigateTo } from '@/services/navigateTo';
import InputWithCopy from '@/components/InputWithCopy';
import { appSettingsConfig } from '@/config/app-settings';
import { $http } from '@/services/ng';
import { DashboardsList } from '@/components/add-to-dashboard/DashboardsList';

const { TextArea } = Input;

let ChartsPreviewDOM;
let EditVisualizationDialogDOM;
const emptyChartImg = '/static/images/emptyChart.png';
const API_SHARE_URL =
  appSettingsConfig.server.backendUrl + '/api/visualizations/{id}/share';
const VISUALIZATION_SHARE_URL =
  window.location.origin + '/public/visualizations/';
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class ChartsListTabs extends React.Component {
  state = {};

  columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '30%'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '20%'
    },
    {
      title: '上次更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at'
    }
  ];

  componentDidMount() {
    this.setState({
      isLoaded: true,
      query: null,
      queryResult: null,
      visualization: null,
      visType: null,
      canEdit: false,
      showDeleteModal: false,
      dashboards: {
        referenced: [],
        unreferenced: []
      },
      runtime: {
        share: {
          public: null,
          apiurl: null,
          saving: false
        }
      }
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
      // eslint-disable-next-line react/no-did-update-set-state

      Promise.all([
        this.getQuery(this.props.displayId),
        this.getDashboardOverview(this.props.displayId)
      ]).finally(() => {
      });
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

  getDashboardOverview(id) {
    this.setState({ isLoaded: false });
    const visualizationId = _.split(id, ':')[1];

    if (!id) {
      this.setState({
        dashboards: {
          referenced: [],
          unreferenced: [],
          isLoaded: true
        }
      });

      return Promise.resolve('OK');
    }

    return Dashboard.dashboardsOverview()
      .$promise.then(overview => {
        // split overview response into two parts:
        // part 1:
        this.setState(
          {
            isLoaded: true,
            dashboards: {
              referenced: _.filter(
                overview,
                dashboard =>
                  !!_.find(
                    dashboard.visualizations,
                    visualization =>
                      visualization === _.parseInt(visualizationId)
                  )
              ),
              unreferenced: _.filter(
                overview,
                dashboard =>
                  !_.find(
                    dashboard.visualizations,
                    visualization =>
                      visualization === _.parseInt(visualizationId)
                  )
              )
            }
          },
          () => { }
        );
      })
      .catch(err => {
        this.setState({
          isLoaded: true,
          dashboards: {
            referenced: [],
            unreferenced: []
          }
        });
      });
  }

  getQuery(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];

    if (!id) {
      this.setState({
        isLoaded: true,
        query: null,
        queryResult: null,
        visualization: null,
        visType: null,
        canEdit: false
      });
      return Promise.resolve('OK');
    }

    this.setState({
      isLoaded: false,
      query: null,
      queryResult: null,
      visualization: null,
      visType: null,
      canEdit: false
    });

    return Query.query({ id: queryId })
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
              const visualization = _.find(
                query.visualizations,
                // eslint-disable-next-line eqeqeq
                vis => vis.id == visualizationId
              );
              visualization.publicAccessEnabled = !!_.get(
                visualization,
                'api_key',
                null
              );

              this.setState({
                visualization,
                visType: 'V',
                runtime: {
                  share: {
                    public: visualization.publicAccessEnabled
                      ? this.generateIframeCode(VISUALIZATION_SHARE_URL + visualization.api_key)
                      : '打开可视化面板共享按钮以获取url链接',
                    api: _.replace(API_SHARE_URL, '{id}', visualization.id),
                    saving: false
                  }
                }
              });
            }
          })
          .catch(err => {
            this.setState({
              query: null,
              isLoaded: true,
              visualization: 'empty',
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
          visualization: 'empty',
          queryResult: 'empty',
          visType: null,
          canEdit: false
        });
      });
  }

  deleteVisualization = () => {
    if (this.state.visualization && this.state.visualization.id) {
      if (this.state.dashboards.referenced.length > 0) {
        this.setState({ showDeleteModal: true });
      } else {
        this.setState({ isLoaded: false });
        this.props.Visualization.delete(
          { id: this.state.visualization.id },
          res => {
            message.success(
              '可视化仪组件' + this.state.visualization.name + '已删除.'
            );
            this.props.chartsTabCb(null);
            this.setState({ isLoaded: true, visualization: null });
          },
          err => {
            message.error('无法删除,请刷新页面后重试.');
            this.setState({ isLoaded: true });
          }
        );
      }
    } else {
      message.error('无法删除,请刷新页面后重试.');
    }
  };

  updateVisualization = data => {
    if (this.state.visualization && this.state.visualization.id) {
      this.props.Visualization.save(
        _.extend(this.state.visualization, data),
        result => {
          message.success('更新成功.');
        },
        () => {
          message.error('无法更新,请刷新页面后重试.');
        }
      );
    } else {
      message.error('无法更新,请刷新页面后重试.');
    }
  };

  handleDeleteOk = () => {
    this.setState({ isLoaded: false });
    this.props.Visualization.delete(
      { id: this.state.visualization.id },
      res => {
        message.success(
          '可视化仪组件' + this.state.visualization.name + '已删除.'
        );
        this.props.chartsTabCb(null);
        this.setState({
          isLoaded: true,
          visualization: null,
          showDeleteModal: false
        });
      },
      err => {
        message.error('无法删除,请刷新页面后重试.');
        this.setState({ isLoaded: true, showDeleteModal: false });
      }
    );
  };

  handleDeleteCancel = () => {
    this.setState({ showDeleteModal: false });
  };

  onChange = checked => {
    if (checked) {
      this.enableAccess();
    } else {
      this.disableAccess();
    }
  };

  enableAccess = () => {
    const { visualization } = this.state;
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
          visualization.publicAccessEnabled = true;
          this.setState({
            runtime: {
              share: {
                public: this.generateIframeCode(VISUALIZATION_SHARE_URL + data.api_key),
                api: _.replace(API_SHARE_URL, '{id}', visualization.id),
                saving: false
              }
            }
          });
        })
        .error(() => {
          message.error('未能打开此可视化组件的共享');
          this.setState({
            runtime: {
              share: {
                public: '打开可视化组件共享按钮以获取url链接',
                api: _.replace(API_SHARE_URL, '{id}', visualization.id),
                saving: false
              }
            }
          });
        })
        .finally(() => { });
    } else {
      message.error('无法访问服务器,打开/关闭共享失败,请刷新页面后重试');
    }
  };

  disableAccess = () => {
    const { visualization } = this.state;
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
          visualization.publicAccessEnabled = false;
          delete visualization.api_key;
          this.setState({
            runtime: {
              share: {
                public: '打开可视化组件共享按钮以获取url链接',
                api: _.replace(API_SHARE_URL, '{id}', visualization.id),
                saving: false
              }
            }
          });
        })
        .error(() => {
          message.error('未能关闭此可视化组件的共享');
          this.setState({
            runtime: {
              share: {
                public: this.generateIframeCode(VISUALIZATION_SHARE_URL + visualization.api_key),
                api: _.replace(API_SHARE_URL, '{id}', visualization.id),
                saving: false
              }
            }
          });
        })
        .finally(() => { });
    } else {
      message.error('无法访问服务器,打开/关闭共享失败,请刷新页面后重试');
    }
  };

  generateIframeCode = (url) => {
    return '<iframe src="'+url+'" frameborder="0" scrolling="no" allowtransparency="true"></iframe>';
  };

  render() {
    return (
      <>
        {!this.state.isLoaded && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && this.state.visualization == null && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <img src={emptyChartImg} alt="" style={{ width: 100 }} />
          </div>
        )}
        {this.state.isLoaded && this.state.visualization === 'empty' && (
          <Empty
            description={
              <span style={{ color: '#fff' }}>该可视化组件暂无数据</span>
            }
            style={{ paddingTop: '10%' }}
          >
            <Button
              type="primary"
              onClick={e => {
                navigateToWithSearch(
                  '/queries/' + this.getQueryId() + '/source'
                );
              }}
            >
              设置数据
            </Button>
          </Empty>
        )}
        {this.state.isLoaded &&
          this.state.visualization !== 'empty' &&
          this.state.visualization != null && (
            <>
              <Modal
                title="可视化组件正在被以下仪表板使用"
                visible={this.state.showDeleteModal}
                onOk={this.handleDeleteOk}
                onCancel={this.handleDeleteCancel}
                okButtonProps={{ type: 'danger' }}
                okText="确认删除"
                cancelText="取消"
              >
                {_.map(this.state.dashboards.referenced, dashboard => (
                  <p>{dashboard.name}</p>
                ))}
                <Alert
                  message="确认"
                  description="删除该组件不会影响可视化仪表板的正常使用,该组件将会在仪表板中删除."
                  type="warning"
                  showIcon
                />
              </Modal>
              {/* eslint-disable-next-line no-nested-ternary */}
              {this.state.visType === 'Q' ? null : this.state.visType ===
                'V' ? (
                  // eslint-disable-next-line react/jsx-indent
                  <div style={{ paddingRight: '10px', paddingTop: '10px' }}>
                    <div style={{ width: '50%', float: 'left'}}>
                      <Descriptions title="可视化组件信息" style={{ paddingRight: '10px' }}>
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
                        <Descriptions.Item label="该可视化组件由以下数据集创建:">
                          {this.state.query.name}
                        </Descriptions.Item>
                      </Descriptions>
                      {/* <Statistic
                        title="该可视化组件由以下数据集创建:"
                        value={this.state.query.name}
                      /> */}
                      <b style={{ fontSize: '14px' }}>可视化组件共享设置:</b>
                      <div style={{ paddingRight: '10px' }}>
                        <Form>
                          <Form.Item
                            label="共享可视化组件"
                            labelAlign="left"
                            labelCol={{ span: 10 }}
                            wrapperCol={{ span: 4, offset: 10 }}
                          >
                            <Switch
                              checkedChildren="开"
                              unCheckedChildren="关"
                              checked={this.state.visualization.publicAccessEnabled}
                              onChange={this.onChange}
                              loading={this.state.runtime.share.saving}
                            />
                          </Form.Item>
                          <Form.Item
                            label="共享可视化组件URL"
                            labelAlign="left"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                          >
                            <InputWithCopy value={this.state.runtime.share.public} />
                          </Form.Item>
                        </Form>
                      </div>

                      <b style={{ fontSize: '14px' }}>可视化组件预览:</b>
                      <Row>
                        <Col span={12} style={{ width: "30vw", height: "35vh" }} id="Preview">
                          <ChartsPreviewDOM
                            visualization={this.state.visualization}
                            queryResult={this.state.queryResult}
                          />
                        </Col>
                      </Row>
                    </div>
                    <div style={{ width: '50%', float: 'right' }}>
                      <b style={{ fontSize: '14px' }}>可视化组件描述:</b>
                      <TextArea
                        placeholder="可视化组件描述"
                        rows={6}
                        value={this.state.visualization.description}
                        onChange={e => {
                          this.setState({
                            visualization: _.extend(this.state.visualization, {
                              description: e.target.value
                            })
                          });
                        }}
                      />
                      <div align="right">
                        <Button
                          type="primary"
                          onClick={e => {
                            this.updateVisualization({
                              description: this.state.visualization.description
                            });
                          }}
                        >
                          <Icon type="save" />
                          保存
                        </Button>
                      </div>
                      <b style={{ fontSize: '14px' }}>其他设置:</b>
                      <br />
                      <Button
                        type="primary"
                        onClick={e => {
                          navigateToWithSearch(
                            'query/' +
                            this.getQueryId() +
                            '/charts/' +
                            this.getChartId()
                          );
                        }}
                      >
                        <i className="fa fa-edit m-r-5" />
                        编辑可视化组件
                      </Button>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <Popconfirm
                        placement="topLeft"
                        title="确认删除可视化组件?"
                        onConfirm={this.deleteVisualization}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Button type="danger">
                          <Icon type="delete" />
                          删除可视化组件
                        </Button>
                      </Popconfirm>
                      <br />
                      <br />
                      <Divider />
                      <b style={{ fontSize: '14px' }}>可视化组件仪表板设置:</b>
                      <Table
                        pagination={{
                          pageSize: 5
                        }}
                        columns={this.columns}
                        dataSource={this.state.dashboards.referenced}
                      />
                      <DashboardsList
                        visualization={this.state.visualization}
                        onSuccess={() => {
                          this.getDashboardOverview(this.props.displayId);
                        }}
                      />
                    </div> 
                  </div>
                ) : null}
            </>
          )}
      </>
    );
  }
}

ChartsListTabs.propTypes = {
  displayId: PropTypes.string,
  chartsTabCb: PropTypes.func.isRequired
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
      'Visualization'
    ])
  );
}

init.init = true;

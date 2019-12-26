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
import { Dashboard } from '@/services/dashboard';
import notification from '@/services/notification';
import { navigateToWithSearch } from '@/services/navigateTo';
import InputWithCopy from '@/components/InputWithCopy';
import { appSettingsConfig } from '@/config/app-settings';
import { $http } from '@/services/ng';

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

  componentDidMount() {
    this.setState({
      isLoaded: true,
      query: null,
      queryResult: null,
      visualization: null,
      visType: null,
      canEdit: false,
      showDeleteModal: false,
      referencedDashboards: [],
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

    if (!id) {
      this.setState({
        isLoaded: true,
        query: null,
        queryResult: null,
        visualization: null,
        visType: null,
        canEdit: false
      });
      return;
    }

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
                      ? VISUALIZATION_SHARE_URL + visualization.api_key
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
              isLoaded: true,
              query: null,
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
      // this.setState({ showDeleteModal: true });

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
                public: VISUALIZATION_SHARE_URL + data.api_key,
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
        .finally(() => {});
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
                public: VISUALIZATION_SHARE_URL + visualization.api_key,
                api: _.replace(API_SHARE_URL, '{id}', visualization.id),
                saving: false
              }
            }
          });
        })
        .finally(() => {});
    } else {
      message.error('无法访问服务器,打开/关闭共享失败,请刷新页面后重试');
    }
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
                {_.map(this.state.referencedDashboards, dashboard => (
                  <p>{dashboard}</p>
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
                <div style={{ padding: '15px' }}>
                  <Descriptions title="可视化组件设置">
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
                  <p style={{ fontSize: '14px' }}>可视化仪表板描述:</p>
                  <TextArea
                    placeholder="可视化仪表板描述"
                    rows={4}
                    value={this.state.visualization.description}
                    onChange={e => {
                      this.setState({
                        visualization: _.extend(this.state.visualization, {
                          description: e.target.value
                        })
                      });
                    }}
                  />
                  <br />
                  <br />
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
                  <Divider />
                  <p style={{ fontSize: '14px' }}>可视化组件共享设置:</p>
                  <Form style={{paddingLeft:'20px'}}>
                    <Form.Item
                      label="共享可视化组件"
                      labelAlign="left"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 1, offset: 17 }}
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
                      labelCol={{ span: 2 }}
                      wrapperCol={{ span: 22 }}
                    >
                      <InputWithCopy value={this.state.runtime.share.public} />
                    </Form.Item>
                  </Form>
                  <br />
                  <p style={{ fontSize: '14px' }}>可视化组件预览:</p>
                  <Row>
                    <Col span={12} style={{width:"30vw",height:"35vh"}} id="Preview">
                      <ChartsPreviewDOM
                        visualization={this.state.visualization}
                        queryResult={this.state.queryResult}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <p style={{ fontSize: '14px' }}>其他设置:</p>
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

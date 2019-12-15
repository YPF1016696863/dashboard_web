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
  Empty,
  BackTop,
  message,
  Tabs
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

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import './charts-search.css';

import { policy } from '@/services/policy';
import notification from '@/services/notification';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class ChartsListSearch extends React.Component {
  state = {
    visualization: null,
    editMode: false,
    rename: null,
    selected: null,
    all: null,
    filtered: null,
    loading: true
  };

  componentDidMount() {
    Query.allQueries().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });
    });
  }

  reload(holdTab) {

    let type = null;
    let selected = null;
    let visualization = null;
    if (holdTab) {
      type = 'V';
      selected = this.state.selected;
      visualization = this.state.visualization;
    }

    this.props.querySearchCb(type,selected);

    this.setState({
      selected,
      visualization,
      all: null,
      filtered: null,
      loading: true
    });
    Query.allQueries().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });
    });
  }

  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
    this.props.querySearchCb(null, null);
    if (value === '' || value === null) {
      this.setState({
        filtered: allItems
      });
    } else {
      this.setState({
        filtered: _.filter(allItems, item => {
          if (!item.visualizations || item.visualizations.length < 1) {
            return false;
          }
          item.visualizations = _.filter(item.visualizations, visualization =>
            visualization.name.includes(value)
          );
          return (
            _.filter(item.visualizations, visualization =>
              visualization.name.includes(value)
            ).length > 0
          );
        })
      });
    }
  }

  orderBy(value) {
    this.props.querySearchCb(null, null);
    this.setState({
      filtered: _.reverse(_.orderBy(this.state.filtered, item => item[value]))
    });
  }

  findVisualization(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];
    const { all } = this.state;

    return _.find(
      _.get(_.find(all, query => query.id === _.parseInt(queryId)), 'visualizations', []),
      visualization => visualization.id === _.parseInt(visualizationId)
    );
  }

  visualizationRender() {
    const { filtered } = this.state;
    const tempNodes = [];
    _.map(filtered, query =>
      _.map(query.visualizations, visualization => {
        if (!visualization.name.includes('Table')) {
          tempNodes.push(
            <TreeNode
              icon={<Icon type="pie-chart" style={{ color: '#428bca' }} />}
              title={
                <span
                  onDoubleClick={event => {
                    this.setState({ editMode: true });
                  }}
                >
                  {this.state.editMode &&
                  this.state.selected &&
                  _.isEqual(
                    this.state.selected,
                    query.id + ':' + visualization.id
                  ) ? (
                    <Input
                      autoFocus
                      size="small"
                      value={this.state.rename}
                      onFocus={event => {
                        this.setState({
                          rename: visualization.name
                        });
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
                        if (this.state.rename === visualization.name) {
                          console.log('NO CHANGE');
                        } else {
                          this.setState({ loading: true });
                          this.updateVisualization({name:this.state.rename});
                        }
                      }}
                      onPressEnter={() => {
                        this.setState({ editMode: false });
                        if (this.state.rename === visualization.name) {
                          console.log('NO CHANGE');
                        } else {
                          this.setState({ loading: true });
                          this.updateVisualization({name:this.state.rename});
                        }
                      }}
                    />
                  ) : (
                    visualization.name
                  )}
                </span>
              }
              key={query.id + ':' + visualization.id}
              isLeaf
            />
          );
        }
      })
    );

    return tempNodes;
  }

  updateVisualization(data) {
    this.props.Visualization.save(
      _.extend(this.state.visualization, data),
      result => {
        notification.success('保存成功');
        this.setState({
          loading: false
        });
      },
      () => {
        notification.error('无法保存');
        this.setState({
          loading: false
        });
      }
    );
  }

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
                      可视化组件列表:
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={18}>
                    <Search
                      placeholder="搜索可视化组件..."
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
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  defaultExpandedKeys={['datavis-group#ungrouped']}
                  onSelect={(value, node, extra) => {
                    const stillEdit = value[0] === this.state.selected;
                    this.setState({
                      selected: value[0],
                      editMode: stillEdit,
                      visualization: this.findVisualization(value[0])
                    });
                    this.props.querySearchCb(
                      node.node.isLeaf() ? 'V' : 'Q',
                      value[0]
                    );
                  }}
                  selectedKeys={[this.state.selected]}
                >
                  <TreeNode
                    title="可视化组件(无分组)"
                    key="datavis-group#ungrouped"
                    selectable={false}
                  >
                    {this.visualizationRender()}
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

ChartsListSearch.propTypes = {
  querySearchCb: PropTypes.func
};

ChartsListSearch.defaultProps = {
  querySearchCb: (a, b) => {}
};

export default function init(ngModule) {
  ngModule.component(
    'chartsListSearch',
    react2angular(ChartsListSearch, Object.keys(ChartsListSearch.propTypes), [
      'appSettings',
      'Visualization'
    ])
  );
}

init.init = true;

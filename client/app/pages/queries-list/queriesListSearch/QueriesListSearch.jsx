import React from 'react';
import {
  message,
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
  Popover,
  Empty,
  BackTop,
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

import './queries-search.css';

import { policy } from '@/services/policy';
import notification from '@/services/notification';
import { navigateToWithSearch } from '@/services/navigateTo';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class QueriesListSearch extends React.Component {
  state = {
    editMode: false,
    rename: null,
    selected: null,
    all: null,
    filtered: null,
    loading: true
  };

  componentDidMount() {
    if (this.props.queryId !== null) {
      this.setState({
        selected: this.props.queryId
      });
      this.props.querySearchCb([this.props.queryId]);
    }
    localStorage.setItem('lastSelectedDataSourceId', null);
    Query.allQueries().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.queryId === null) {
      this.reload();
    }
  }

  reload(holdTab) {
    let queryid = null;
    if (holdTab) {
      queryid = this.state.selected;
    } else {
      this.props.querySearchCb(null);
    }
    localStorage.setItem('lastSelectedDataSourceId', queryid);

    this.setState({
      selected: queryid,
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
    this.props.querySearchCb(null);
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
    this.props.querySearchCb(null);
    this.setState({
      filtered: _.reverse(_.orderBy(this.state.filtered, item => item[value]))
    });
  }

  // eslint-disable-next-line class-methods-use-this
  saveQuery(query, customOptions, data) {
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
          successMessage: '数据集信息更新成功',
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
          message.success(options.successMessage);
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
                      数据列表:
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
              <Col span={8}>
                <Button
                  size="small"
                  type="link"
                  style={{ color: '#3d4d66' }}
                  onClick={e => {
                    navigateToWithSearch('/queries/new');
                  }}
                >
                  <Icon type="plus-square" style={{ color: '#13cd66' }} />
                  新建数据集
                </Button>
              </Col>
              <Col span={8}>
                <Button size="small" type="link" style={{ color: '#3d4d66' }}>
                  <Icon type="folder-add" style={{ color: '#faaa39' }} />
                  新建文件夹
                </Button>
              </Col>
              <Col span={8}>
                <Button size="small" type="link" style={{ color: '#3d4d66' }}>
                  <Icon type="folder-open" style={{ color: '#3685f2' }} />
                  移动到
                </Button>
              </Col>
              <Col span={24}>
                <Divider style={{ marginTop: '5px', marginBottom: '0' }} />
              </Col>
            </Row>
            <Row>
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  defaultExpandAll
                  onSelect={(value, node, extra) => {
                    const stillEdit = value[0] === this.state.selected;
                    this.setState({ selected: value[0], editMode: stillEdit });
                    this.props.querySearchCb(value);
                  }}
                  selectedKeys={[this.state.selected]}
                >
                  <TreeNode
                    title="数据查询(无分组)"
                    key="datavis-group#ungrouped"
                  >
                    {_.map(this.state.filtered, item => {
                      return (
                        <TreeNode
                          icon={
                            <Icon
                              type="file-search"
                              style={{ color: '#FAAA39' }}
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
                              _.parseInt(this.state.selected) === item.id ? (
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
                                      this.saveQuery(item, undefined, {
                                        name: this.state.rename
                                      }).then(() => {
                                        this.reload(true);
                                      });
                                    }
                                  }}
                                  onPressEnter={() => {
                                    this.setState({ editMode: false });
                                    if (this.state.rename === item.name) {
                                      console.log('NO CHANGE');
                                    } else {
                                      this.setState({ loading: true });
                                      this.saveQuery(item, undefined, {
                                        name: this.state.rename
                                      }).then(() => {
                                        this.reload(true);
                                      });
                                    }
                                  }}
                                />
                              ) : (
                                item.name
                              )}
                            </span>
                          }
                          key={item.id}
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

QueriesListSearch.propTypes = {
  querySearchCb: PropTypes.func.isRequired,
  queryId: PropTypes.string
};

QueriesListSearch.defaultProps = {
  queryId: null
};

export default function init(ngModule) {
  ngModule.component(
    'queriesListSearch',
    react2angular(QueriesListSearch, Object.keys(QueriesListSearch.propTypes), [
      'appSettings',
      '$location'
    ])
  );
}

init.init = true;

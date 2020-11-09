/* eslint-disable func-names */
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

import { policy } from '@/services/policy';
import { $http } from "@/services/ng";
import { appSettingsConfig } from "@/config/app-settings";

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;
const FOLDER_STRUCTURE_URL =
  appSettingsConfig.server.backendUrl + '/api/folder_structures';
let selectName = '';
let selectId = '';
class QueriesListNomodal extends React.Component {
  state = {
    visible: false,
    selected: null,
    all: null,
    filtered: null,
    loading: true,
    selectedName: '',
    nameState: false,
  };

  // 初始化方法 获取url中的id 得到对应 数据集名称  (如何及时更新)
  constructor(props) {
    super(props);
    selectName = '';
    const url = window.location.href;
    selectId = "";
    for (let i = url.indexOf("query") + 6; i < url.length; i += 1) {
      if (url[i] === '/') {
        break;
      } else {
        selectId += url[i];
      }
    }
    Query.allQueries().$promise.then(res => {
      _.forEach(res, function (value, key) {
        if (value.id + "" === selectId) {
          // console.log(value.id+"::"+value.name);
          selectName = value.name;
          localStorage.setItem('lastSelectedDataSourceName', selectName);
        }

      });
      this.setState({
        selectedName: selectName,
        nameState: true,
      })
    })

  }


  componentDidMount() {
    if (FOLDER_STRUCTURE_URL) {
      $http
        .get(FOLDER_STRUCTURE_URL)
        .success(data => this.setState(
          {
            treelist: this.convertToTreeData(
              data.filter(item => item.catalog === "query"), null)
          })
        )
    }
  }





  componentWillReceiveProps(nextProps, nextContext) {
    this.setState(
      { chartType: nextProps.chartType }
    )
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.reload, prevProps.reload)) {
      this.reload(true);
    }
  }


  showModal = () => {
    this.setState({
      loading: true,
      selected: null,
      visible: true
    });
    localStorage.setItem('lastSelectedDataSourceId', null);
    Query.allQueries().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false,
      });
    });
  };

  handleOk = () => {
    if (this.state.selected === null) {
      message.warning('请选择一个数据集.');
      return;
    }
    const allItems = _.cloneDeep(this.state.all);

    _.filter(allItems, item => {
      if (item.id + '' === this.state.selected) {
        selectName = item.name
      }
    });

    localStorage.setItem('lastSelectedDataSourceId', this.state.selected);

    localStorage.setItem('lastSelectedDataSourceName', selectName);

    let folderId = null;
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i += 1) {
      const pair = vars[i].split("=");
      if (pair[0] === "folder_id" && pair[1].substr(0, 1) === 's') { folderId = pair[1].substring(1) }
    }

    navigateTo("/query/" + this.state.selected + "/charts/new?type=" +
    this.props.chartType + "&folder_id=" +  folderId);

    this.setState({
      visible: false,
      selected: null,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
      selected: null
    });
  };

  reload() {
    this.props.querySearchCb(null);
    this.setState({
      selected: null,
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

  renderTree = (treelist, idx) => {
    const allItems = _.cloneDeep(this.state.all);
    const folderItem = _.filter(allItems, item3 => item3.folder_id != null)
    return treelist.map(item => {
      if (!item.children) {
        return (
          <TreeNode title={item.title} key={item.key}>
            {_.map(
              _.filter(
                folderItem, item1 =>
                item1.folder_id.toString() === item.key.substring(1)),
              item2 => (
                <TreeNode
                  icon={(
                    <Icon
                      type="file-search"
                      style={{ color: '#FAAA39' }}
                    />
                  )}
                  title={(
                    <span
                      onDoubleClick={() => {
                        this.setState({ editMode: true });
                      }}
                    >
                      {this.state.editMode &&
                        this.state.selected &&
                        _.parseInt(this.state.selected) === item2.id &&
                        !item2.readOnly() ? (
                          <Input
                            autoFocus
                            size="small"
                            value={this.state.rename}
                            onFocus={() => {
                              this.setState({ rename: item2.name });
                            }}
                            onChange={event => {
                              this.setState(
                                {
                                  rename: event.target.value
                                },
                                () => { }
                              );
                            }}
                            onBlur={() => {
                              this.setState({ editMode: false });
                              if (this.state.rename === item2.name) {
                                console.log('NO CHANGE');
                              } else {
                                this.setState({ loading: true });
                                this.saveQuery(item2, undefined, {
                                  name: this.state.rename
                                }).then(() => {
                                  this.reload(true);
                                });
                              }
                            }}
                            onPressEnter={() => {
                              this.setState({ editMode: false });
                              if (this.state.rename === item2.name) {
                                console.log('NO CHANGE');
                              } else {
                                this.setState({ loading: true });
                                this.saveQuery(item2, undefined, {
                                  name: this.state.rename
                                }).then(() => {
                                  this.reload(true);
                                });
                              }
                            }}
                          />
                        ) : (
                          item2.name
                        )}
                    </span>
                  )}
                  key={item2.id}
                  isLeaf
                />
              ))}
          </TreeNode>
        )
      }
      return (
        <TreeNode title={item.title} key={item.key}>
          {_.map(_.filter(folderItem, item1 => item1.folder_id.toString() === item.key.substring(1)), item2 => (
            <TreeNode
              icon={(
                <Icon
                  type="file-search"
                  style={{ color: '#FAAA39' }}
                />
              )}
              title={(
                <span
                  onDoubleClick={() => {
                    this.setState({ editMode: true });
                  }}
                >
                  {this.state.editMode &&
                    this.state.selected &&
                    _.parseInt(this.state.selected) === item2.id &&
                    !item2.readOnly() ? (
                      <Input
                        autoFocus
                        size="small"
                        value={this.state.rename}
                        onFocus={() => {
                          this.setState({ rename: item2.name });
                        }}
                        onChange={event => {
                          this.setState(
                            {
                              rename: event.target.value
                            },
                            () => { }
                          );
                        }}
                        onBlur={() => {
                          this.setState({ editMode: false });
                          if (this.state.rename === item2.name) {
                            console.log('NO CHANGE');
                          } else {
                            this.setState({ loading: true });
                            this.saveQuery(item2, undefined, {
                              name: this.state.rename
                            }).then(() => {
                              this.reload(true);
                            });
                          }
                        }}
                        onPressEnter={() => {
                          this.setState({ editMode: false });
                          if (this.state.rename === item2.name) {
                            console.log('NO CHANGE');
                          } else {
                            this.setState({ loading: true });
                            this.saveQuery(item2, undefined, {
                              name: this.state.rename
                            }).then(() => {
                              this.reload(true);
                            });
                          }
                        }}
                      />
                    ) : (
                      item2.name
                    )}
                </span>
              )}
              key={item2.id}
              isLeaf
            />
          ))}
          {this.renderTree(item.children)}
        </TreeNode>
      )
    })
  };

  convertToTreeData(data, pid) {
    const result = []
    let temp = []
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].parent_id === pid) {
        const obj = { 'title': data[i].name, 'key': "s" + data[i].id }
        temp = this.convertToTreeData(data, data[i].id)
        if (temp.length > 0) {
          obj.children = temp
        }
        result.push(obj)
      }
    }
    return result
  }

  render() {
    const { appSettings } = this.props;
    const { selectedName } = this.state;
    // selectName = localStorage.getItem('lastSelectedDataSourceName');

    return (
      <>
        {this.state.nameState && <Input
          placeholder={this.state.selectedName}
          onClick={this.showModal}
        />}
        <Modal
          destroyOnClose
          title="选择数据集"
          visible={this.state.visible}
          onOk={() => this.handleOk(this.state.chartType)}
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
                        // 传入id
                        this.props.querySearchCb(value);
                      }}
                      selectedKeys={[this.state.selected]}
                    >
                      <TreeNode
                        title="数据查询(无分组)"
                        key="datavis-group#ungrouped"
                      >
                        {_.map(this.state.filtered, item => (
                          <TreeNode
                            icon={(
                              <Icon
                                type="file-search"
                                style={{ color: '#FAAA39' }}
                              />
                            )}
                            title={item.name}
                            // + ', id: [' + item.id + ']'
                            key={item.id}
                            isLeaf
                          />
                        ))}
                      </TreeNode>
                      {this.state.treelist ? this.renderTree(this.state.treelist) : <></>}
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

QueriesListNomodal.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  chartType: PropTypes.string,
  querySearchCb: PropTypes.func
};

QueriesListNomodal.defaultProps = {
  chartType: null,
  querySearchCb: a => { }
};

export default function init(ngModule) {
  ngModule.component(
    'queriesListNomodal',
    react2angular(QueriesListNomodal, Object.keys(QueriesListNomodal.propTypes), [
      'appSettings',
      '$location'
    ])
  );
}

init.init = true;

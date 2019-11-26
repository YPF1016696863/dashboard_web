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

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class QueriesListSearch extends React.Component {
  state = {
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

  reload() {
    this.props.querySearchCb(null);
    this.setState({
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
                  <Col span={11} align="right">
                    <Button
                      ghost
                      type="primary"
                      size="small"
                      target="_blank"
                      href="/queries/new"
                    >
                      <i className="fa fa-plus m-r-5" />
                      新建数据查询
                    </Button>
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
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  defaultExpandAll
                  onSelect={(value, node, extra) => {
                    this.props.querySearchCb(value);
                  }}
                >
                  <TreeNode title="数据查询(无分组)" key="datavis-group#ungrouped">
                    {_.map(this.state.filtered, item => (
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title={item.name + ', id: [' + item.id + ']'}
                        key={item.id}
                        isLeaf
                      />
                    ))}
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
  querySearchCb: PropTypes.func.isRequired
};

QueriesListSearch.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'queriesListSearch',
    react2angular(QueriesListSearch, Object.keys(QueriesListSearch.propTypes), [
      'appSettings'
    ])
  );
}

init.init = true;

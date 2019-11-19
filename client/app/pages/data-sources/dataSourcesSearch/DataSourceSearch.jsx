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
  Tabs,
  Avatar
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import { DataSource, IMG_ROOT } from '@/services/data-source';
import LoadingState from '@/components/items-list/components/LoadingState';

import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import { $route } from '@/services/ng';
import navigateTo from '@/services/navigateTo';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class DataSourceSearch extends React.Component {
  state = {
    all: null,
    filtered: null,
    loading: true
  };

  componentDidMount() {
    Promise.all([
      DataSource.query().$promise,
      DataSource.types().$promise
    ]).then(values => {
      console.log(values[0]);
      this.setState({
        all: values[0],
        filtered: values[0],
        loading: false
      });
    });
  }

  reload() {
    // this.props.sourceSearchCb(null);
    this.setState({
      all: null,
      filtered: null,
      loading: true
    });
    Promise.all([
      DataSource.query().$promise,
      DataSource.types().$promise
    ]).then(values => {
      console.log(values[0]);
      this.setState({
        all: values[0],
        filtered: values[0],
        loading: false
      });
    });
  }

  searchBy(value) {
    // this.props.sourceSearchCb(null);
    this.setState({
      filtered: _.filter(this.state.all, item => item.name.includes(value))
    });
  }

  orderBy(value) {
    // this.props.sourceSearchCb(null);
    this.setState({
      filtered: _.orderBy(this.state.filtered, item => item[value])
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
                <div style={{ fontWeight: 'bold', paddingBottom: '10px' }}>
                  数据源列表:
                </div>
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
                    this.props.sourceSearchCb(value);
                  }}
                >
                  <TreeNode title="数据源(无分组)" key="ungrouped">
                    {_.map(this.state.filtered, item => (
                      <TreeNode
                        icon={
                          <Avatar
                            shape="square"
                            size={30}
                            src={`${IMG_ROOT}/${item.type}.png`}
                            style={{ paddingRight: '15px' }}
                          />
                        }
                        title={
                          item.name +
                          ', [' +
                          (item.view_only ? '只读权限' : '读写权限') +
                          ']'
                        }
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

DataSourceSearch.propTypes = {
  sourceSearchCb: PropTypes.func.isRequired
};

DataSourceSearch.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'sourceListSearch',
    react2angular(DataSourceSearch, Object.keys(DataSourceSearch.propTypes), [
      'appSettings'
    ])
  );
}

init.init = true;

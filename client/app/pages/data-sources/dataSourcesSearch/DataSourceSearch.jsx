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
import { navigateTo } from '@/services/navigateTo';
import CreateSourceDialog from '@/components/CreateSourceDialog';
import helper from '@/components/dynamic-form/dynamicFormHelper';
import { CreateNewFolder } from '@/components/create-new-folder/CreateNewFolder';
import {MoveToFolder} from "@/components/move-to-folder/MoveToFolder";

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createDataSource"] }] */
class DataSourceSearch extends React.Component {
  state = {
    all: null,
    filtered: null,
    loading: true,
    dataSourceTypes: null,
    runtime: {
      selected: null,
      editing: false
    }
    /*
    structure:{
      current: null,
      parent: null
    }
    */
  };

  componentDidMount() {
    Promise.all([
      DataSource.query().$promise,
      DataSource.types().$promise
    ]).then(values => {
      this.setState({
        all: values[0],
        filtered: values[0],
        loading: false,
        dataSourceTypes: values[1]
      });
    });
  }

  showCreateSourceDialog = () => {
    CreateSourceDialog.showModal({
      $translate: this.props.$translate.instant,
      types: this.state.dataSourceTypes,
      sourceType: 'Data Source',
      imageFolder: IMG_ROOT,
      helpTriggerPrefix: 'DS_',
      onCreate: this.createDataSource
    }).result.then((result = {}) => {
      console.log(result);
      if (result.success) {
        this.reload();
      }
    });
  };

  createDataSource(selectedType, values) {
    const target = { options: {}, type: selectedType.type };
    helper.updateTargetWithValues(target, values);

    return DataSource.save(target)
      .$promise.then(dataSource => {
        return dataSource;
      })
      .catch(error => {
        if (!(error instanceof Error)) {
          error = new Error(_.get(error, 'data.message', '保存失败.'));
        }
        return Promise.reject(error);
      });
  }

  reload() {
    // this.props.sourceSearchCb(null);
    this.setState({
      all: null,
      filtered: null,
      loading: true
    });
    Promise.all([DataSource.query().$promise]).then(values => {
      this.setState({
        all: values[0],
        filtered: values[0],
        loading: false
      });
    });
  }

  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
    // this.props.sourceSearchCb(null);
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
                <Row>
                  <Col span={12}>
                    <div style={{ fontWeight: 'bold', paddingBottom: '10px' }}>
                      数据源列表:
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
                  onClick={
                    policy.isCreateDataSourceEnabled()
                      ? this.showCreateSourceDialog
                      : null
                  }
                  disabled={!policy.isCreateDataSourceEnabled()}
                >
                  <Icon type="plus-square" style={{ color: '#13cd66' }} />
                  新建数据源
                </Button>
              </Col>
              <Col span={8}>
                <CreateNewFolder onSuccess={name => alert(name)} />
              </Col>
              <Col span={8}>
                <MoveToFolder current={null} structure={null} />
              </Col>
              <Col span={24}>
                <Divider style={{ marginTop: '5px', marginBottom: '0' }} />
              </Col>
            </Row>
            <Row>
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  expandAction="doubleClick"
                  onSelect={(value, node, extra) => {
                    localStorage.setItem(
                      'lastSelectedDataSourceId',
                      value && value.length ? value[0] : null
                    );

                    this.setState({
                      runtime: {
                        selected: node.node.props,
                        editing:
                          value[0] ===
                          _.get(this.state.runtime, 'selected.eventKey', null)
                      }
                    });

                    this.props.sourceSearchCb(value);
                  }}
                >
                  <TreeNode
                    title={
                      _.get(this.state.runtime, 'selected.eventKey', null) ===
                        'root' && this.state.runtime.editing ? (
                          <Input
                            autoFocus
                            size="small"
                            value="需要从API获取"
                            onBlur={() => {
                              this.setState({ runtime: { editing: false } });
                            }}
                          />
                      ) : (
                        '需要从API获取'
                      )
                    }
                    key="root"
                  >
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
      'appSettings',
      '$translate'
    ])
  );
}

init.init = true;

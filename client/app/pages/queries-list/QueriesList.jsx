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
  Table,
  Alert,
  Empty,
  BackTop,
  Tabs
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
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

import QueriesListEmptyState from './QueriesListEmptyState';

import './queries-list.css';

import template from './queries-list.html';
import { policy } from '@/services/policy';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;
class QueriesList extends React.Component {
  state = {
    isLoaded: false,
    queryResult: null,
    queryId: null
  };

  listColumns = [];

  sidebarMenu = [
    {
      key: 'all',
      href: 'queries',
      title: 'SIDEBAR.ALL_QUERIES'
    },
    {
      key: 'favorites',
      href: 'queries/favorites',
      title: 'SIDEBAR.FAVORITES',
      icon: () => <Sidebar.MenuIcon icon="fa fa-star" />
    },
    {
      key: 'archive',
      href: 'queries/archive',
      title: 'SIDEBAR.ARCHIVED',
      icon: () => <Sidebar.MenuIcon icon="fa fa-archive" />
    },
    {
      key: 'my',
      href: 'queries/my',
      title: 'SIDEBAR.MY_QUERIES',
      icon: () => <Sidebar.ProfileImage user={currentUser} />,
      isAvailable: () => currentUser.hasPermission('create_query')
    }
  ];

  static propTypes = {
    controller: ControllerType.isRequired,
    $translate: PropTypes.func
  };

  static defaultProps = {
    $translate: text => text
  };

  componentDidMount() {
    const { controller } = this.props;
    const translate = this.props.$translate ? this.props.$translate : null;
    this.listColumns = [
      Columns.favorites({ className: 'p-r-0' }),
      Columns.custom.sortable(
        (text, item) => (
          <React.Fragment>
            <a className="table-main-title" href={'queries/' + item.id}>
              {item.name}
            </a>
            <QueryTagsControl
              className="d-block"
              tags={item.tags}
              isDraft={item.is_draft}
              isArchived={item.is_archived}
            />
          </React.Fragment>
        ),
        {
          title: translate.instant('QUERIESLIST.QUERIES_TABLE.NAME'),
          field: 'name',
          width: null
        }
      ),
      Columns.avatar(
        { field: 'user', className: 'p-l-0 p-r-0' },
        name => `Created by ${name}`
      ),
      Columns.dateTime.sortable({
        title: translate.instant('QUERIESLIST.QUERIES_TABLE.CREATED_AT'),
        field: 'created_at'
      }),
      Columns.duration.sortable({
        title: translate.instant('QUERIESLIST.QUERIES_TABLE.RUNTIME'),
        field: 'runtime'
      }),
      Columns.dateTime.sortable({
        title: translate.instant('QUERIESLIST.QUERIES_TABLE.LAST_EXECUTED_AT'),
        field: 'retrieved_at',
        orderByField: 'executed_at'
      }),
      Columns.custom.sortable(
        (text, item) => (
          <SchedulePhrase schedule={item.schedule} isNew={item.isNew()} />
        ),
        {
          title: translate.instant('QUERIESLIST.QUERIES_TABLE.UPDATE_SCHEDULE'),
          field: 'schedule'
        }
      )
    ];

    this.setState({
      isLoaded: controller.isLoaded,
      queryResult: null
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.controller.isLoaded !== prevProps.controller.isLoaded) {
      // eslint-disable-next-line
      this.setState({
        isLoaded: this.props.controller.isLoaded
      });
    }
  }

  normalizedTableData(data) {
    this.setState({
      queryResult: {
        columns: _.map(data.data.columns, column => ({
          title: column.friendly_name,
          dataIndex: column.name,
          sorter: true
        })),
        rows: data.data.rows
      }
    });
  }

  render() {
    const { controller } = this.props;
    const { appSettings } = this.props;
    const { $translate } = this.props;

    const newDataSourceProps = {
      type: 'primary',
      ghost: true,
      size: 'small',
      onClick: policy.isCreateDataSourceEnabled()
        ? this.showCreateSourceDialog
        : null,
      disabled: !policy.isCreateDataSourceEnabled()
    };

    return (
      <>
        <BackTop visibilityHeight={10} />
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <Icon type="home" />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/queries">
            <Icon type="file-search" />
            <span>数据查询</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          title={<span style={{ fontSize: '18px' }}>数据查询</span>}
          subTitle={
            <>
              <span style={{ fontSize: '13px' }}>新建并管理数据查询</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Button {...newDataSourceProps}>
                <i className="fa fa-plus m-r-5" />
                新建数据查询
              </Button>
            </>
          }
          extra={[
            <Button type="primary" disabled={this.state.queryId==null} href={'/queries/'+this.state.queryId+'/source'} target="_blank">
              <i className="fa fa-edit m-r-5" />
              编辑数据集
            </Button>,
            <Button ghost type="primary" disabled={this.state.queryId==null}>
              <i className="fa fa-plus m-r-5" />
              新建可视化组件
            </Button>
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="备注">
              用户可在该页面新建和管理数据查询,数据查询稍后将被应用于图表组件的创建当中
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Divider className="header-divider" />
        <Row>
          <Col
            className="main-control-section"
            span={4}
            style={{ borderRight: '1px solid #e8e8e8' }}
          >
            <Row>
              <Col>
                <div style={{ fontWeight: 'bold', paddingBottom: '10px' }}>
                  数据列表:
                </div>
                <Row>
                  <Col span={18}>
                    <Sidebar.SearchInput
                      placeholder="搜索查询..."
                      value={controller.searchTerm}
                      onChange={controller.updateSearch}
                    />
                  </Col>
                  <Col span={5} offset={1}>
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item key="1">
                            <Icon type="sort-ascending" />
                            按名称排序
                          </Menu.Item>
                          <Menu.Item key="2">
                            <Icon type="clock-circle" />
                            按创建时间排序
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button icon="menu-fold" size="small" />
                    </Dropdown>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  defaultExpandAll
                  onSelect={(value, node, extra) => {
                    this.setState({
                      isLoaded: false
                    });
                    Query.resultById({ id: value })
                      .$promise.then(data => {
                        this.normalizedTableData(data.query_result);
                      })
                      .catch(err => {
                        this.setState({
                          isLoaded: true,
                          queryResult: null,
                          queryId: null
                        });
                      })
                      .finally(() =>
                        this.setState({
                          isLoaded: true,
                          queryId: value
                        })
                      );
                  }}
                >
                  <TreeNode title="数据查询(无分组)" key="ungrouped">
                    {_.map(controller.pageItems, item => (
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title={item.name}
                        key={item.id}
                        isLeaf
                      />
                    ))}
                  </TreeNode>
                </DirectoryTree>
              </Col>
            </Row>
          </Col>
          <Col span={20} className="main-control-section">
            {!this.state.isLoaded && <LoadingState />}
            {this.state.isLoaded && this.state.queryResult == null && (
              <Empty
                description="请从左侧点击选择数据集"
                style={{ paddingTop: '10%' }}
              />
            )}
            {this.state.isLoaded && this.state.queryResult != null && (
              <Tabs defaultActiveKey="1" type="card" className="queries-tab">
                <TabPane tab="数据预览" key="1">
                  <Alert
                    message="预览数据为该数据集的部分数据."
                    type="warning"
                    closable
                  />
                  <Table
                    columns={this.state.queryResult.columns}
                    dataSource={this.state.queryResult.rows}
                    scroll={{ y: 'max-content', x: '100%' }}
                  />
                </TabPane>
                <TabPane tab="数据集设置" key="2">
                  Content of Tab Pane 2
                </TabPane>
                <TabPane tab="关联图表" key="3">
                  Content of Tab Pane 3
                </TabPane>
              </Tabs>
            )}
          </Col>
        </Row>
      </>
    );
  }
}

export default function init(ngModule) {
  ngModule.component(
    'pageQueriesList',
    react2angular(
      itemsList(
        QueriesList,
        new ResourceItemsSource({
          getResource({ params: { currentPage } }) {
            return {
              all: Query.query.bind(Query),
              my: Query.myQueries.bind(Query),
              favorites: Query.favorites.bind(Query),
              archive: Query.archive.bind(Query)
            }[currentPage];
          },
          getItemProcessor() {
            return item => new Query(item);
          }
        }),
        new UrlStateStorage({
          orderByField: 'created_at',
          orderByReverse: true
        })
      ),
      [],
      ['$translate', 'appSettings']
    )
  );

  return routesToAngularRoutes(
    [
      {
        path: '/queries',
        title: 'DataVis - 数据准备',
        key: 'all'
      },
      {
        path: '/queries/favorites',
        title: 'QUERIESLIST.FAVORITE_QUERIES',
        key: 'favorites'
      },
      {
        path: '/queries/archive',
        title: 'QUERIESLIST.ARCHIVED_QUERIES',
        key: 'archive'
      },
      {
        path: '/queries/my',
        title: 'QUERIESLIST.MY_QUERIES',
        key: 'my'
      }
    ],
    {
      reloadOnSearch: false,
      template,
      controller($scope, $exceptionHandler) {
        'ngInject';

        $scope.handleError = $exceptionHandler;
      }
    }
  );
}

init.init = true;

import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Icon,
  Divider,
  Row,
  Col,
  Tree,
  Input,
  BackTop,
  Text
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';

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

class QueriesList extends React.Component {
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
  }

  render() {
    const { controller } = this.props;
    const { appSettings } = this.props;
    const { $translate } = this.props;
    const newDataSourceProps = {
      type: 'primary',
      ghost: true,
      onClick: policy.isCreateDataSourceEnabled()
        ? this.showCreateSourceDialog
        : null,
      disabled: !policy.isCreateDataSourceEnabled()
    };
    console.log(controller);
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
            <span style={{ fontSize: '13px' }}>新建并管理数据查询</span>
          }
          extra={[
            <Button {...newDataSourceProps}>
              <i className="fa fa-plus m-r-5" />
              新建数据查询
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
        <>
          <Row type="flex">
            <Col span={4} style={{ borderRight: '1px solid #e8e8e8' }}>
              <Row>
                <Col>
                  <div style={{fontWeight:'bold',paddingBottom:'10px'}}>列表搜索设置:</div>
                  <Layout.Sidebar
                    style={{ paddingRight: '10px', paddingLeft: '10px' }}
                  >
                    <Sidebar.SearchInput
                      placeholder="搜索查询..."
                      value={controller.searchTerm}
                      onChange={controller.updateSearch}
                    />
                    <Sidebar.Menu
                      items={this.sidebarMenu}
                      selected={controller.params.currentPage}
                      $translate={$translate}
                    />
                    <Sidebar.Tags
                      url={appSettings.server.backendUrl + '/api/queries/tags'}
                      onChange={controller.updateSelectedTags}
                    />
                    <Sidebar.PageSizeSelect
                      className="m-b-10"
                      options={controller.pageSizeOptions}
                      value={controller.itemsPerPage}
                      onChange={itemsPerPage =>
                        controller.updatePagination({ itemsPerPage })
                      }
                    />
                  </Layout.Sidebar>
                </Col>
              </Row>
              <Row>
                <Col style={{ paddingRight: '10px' }}>
                  <Divider className="header-divider" />
                  <div style={{fontWeight:'bold'}}>数据列表:</div>
                  <DirectoryTree defaultExpandAll>
                    <TreeNode title="分组1" key="0-0">
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title="新建查询"
                        key="0-1-01"
                        isLeaf
                      />
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title="新建查询"
                        key="0-1-02"
                        isLeaf
                      />
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title="新建查询"
                        key="0-1-03"
                        isLeaf
                      />
                    </TreeNode>
                    <TreeNode title="分组2" key="0-1">
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title="新建查询"
                        key="0-1-04"
                        isLeaf
                      />
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title="新建查询"
                        key="0-1-05"
                        isLeaf
                      />
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title="新建查询"
                        key="0-1-06"
                        isLeaf
                      />
                      <TreeNode
                        icon={
                          <Icon
                            type="file-search"
                            style={{ color: '#FAAA39' }}
                          />
                        }
                        title="新建查询"
                        key="0-1-07"
                        isLeaf
                      />
                    </TreeNode>
                  </DirectoryTree>
                </Col>
              </Row>
            </Col>
            <Col span={20}>
              {!controller.isLoaded && <LoadingState />}
              {controller.isLoaded && controller.isEmpty && (
                <QueriesListEmptyState
                  page={controller.params.currentPage}
                  searchTerm={controller.searchTerm}
                  selectedTags={controller.selectedTags}
                  $translate={$translate}
                />
              )}
              {controller.isLoaded && !controller.isEmpty && (
                <div>
                  <ItemsTable
                    items={controller.pageItems}
                    columns={this.listColumns}
                    orderByField={controller.orderByField}
                    orderByReverse={controller.orderByReverse}
                    toggleSorting={controller.toggleSorting}
                  />
                  <Paginator
                    totalCount={controller.totalItemsCount}
                    itemsPerPage={controller.itemsPerPage}
                    page={controller.page}
                    onChange={page => controller.updatePagination({ page })}
                  />
                </div>
              )}
            </Col>
          </Row>
        </>
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

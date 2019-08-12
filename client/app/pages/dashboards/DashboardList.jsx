import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';

import { PageHeader } from '@/components/PageHeader';
import { Paginator } from '@/components/Paginator';
import { DashboardTagsControl } from '@/components/tags-control/TagsControl';

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

import Layout from '@/components/layouts/ContentWithSidebar';

import { Dashboard } from '@/services/dashboard';
import { routesToAngularRoutes } from '@/lib/utils';

import { appSettingsConfig } from '@/config/app-settings';

import DashboardListEmptyState from './DashboardListEmptyState';

import './dashboard-list.css';

class DashboardList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
    $translate: PropTypes.func
  };

  static defaultProps = {
    $translate: text => text
  };

  sidebarMenu = [
    {
      key: 'all',
      href: 'dashboards',
      title: 'SIDEBAR.ALL_DASHBOARDS'
    },
    {
      key: 'favorites',
      href: 'dashboards/favorites',
      title: 'SIDEBAR.FAVORITES',
      icon: () => <Sidebar.MenuIcon icon="fa fa-star" />
    }
  ];

  listColumns = [];

  componentDidMount() {
    const translate = this.props.$translate ? this.props.$translate : null;
    this.listColumns = [
      Columns.favorites({ className: 'p-r-0' }),
      Columns.custom.sortable(
        (text, item) => (
          <React.Fragment>
            <a
              className="table-main-title"
              href={'dashboard/' + item.slug}
              data-test={item.slug}
            >
              {item.name}
            </a>
            <DashboardTagsControl
              className="d-block"
              tags={item.tags}
              isDraft={item.is_draft}
              isArchived={item.is_archived}
            />
          </React.Fragment>
          ),
          {
            title: translate.instant('DASHBOARDLIST.DASNBOARDS_TABLE.NAME'),
            field: 'name',
            width: null
          }
      ),
      Columns.avatar(
          { field: 'user', className: 'p-l-0 p-r-0' },
          name => `Created by ${name}`
      ),
      Columns.dateTime.sortable({
        title: translate.instant('DASHBOARDLIST.DASNBOARDS_TABLE.CREATED_AT'),
        field: 'created_at',
        className: 'text-nowrap',
        width: '1%'
      })
    ];
  }

  render() {
    const { controller } = this.props;
    const {$translate} = this.props;
    const translate = this.props.$translate ? this.props.$translate : null;
    return (
      <div className="container">
        <PageHeader title={translate.instant(controller.params.title)} />
        <Layout className="m-l-15 m-r-15">
          <Layout.Sidebar className="m-b-0">
            <Sidebar.SearchInput
              placeholder={$translate.instant("DASHBOARD.SAERCH_DASHBOARD")}
              value={controller.searchTerm}
              onChange={controller.updateSearch}
            />
            <Sidebar.Menu
              items={this.sidebarMenu}
              selected={controller.params.currentPage}
              $translate={translate}
            />
            <Sidebar.Tags
              url={appSettingsConfig.server.backendUrl + '/api/dashboards/tags'}
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
          <Layout.Content>
            {controller.isLoaded ? (
              <div data-test="DashboardLayoutContent">
                {controller.isEmpty ? (
                  <DashboardListEmptyState
                    page={controller.params.currentPage}
                    searchTerm={controller.searchTerm}
                    selectedTags={controller.selectedTags}
                    $translate={translate}
                  />
                ) : (
                  <div className="bg-white tiled table-responsive">
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
                      onChange={page =>
                        controller.updatePagination({
                          page
                        })
                      }
                    />
                  </div>
                )}
              </div>
            ) : (
              <LoadingState />
            )}
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default function init(ngModule) {
  ngModule.component(
    'pageDashboardList',
    react2angular(
      itemsList(
        DashboardList,
        new ResourceItemsSource({
          getResource({ params: { currentPage } }) {
            return {
              all: Dashboard.query.bind(Dashboard),
              favorites: Dashboard.favorites.bind(Dashboard)
            }[currentPage];
          },
          getItemProcessor() {
            return item => new Dashboard(item);
          }
        }),
        new UrlStateStorage({
          orderByField: 'created_at',
          orderByReverse: true
        })
      ),
      [],
      ['$translate']
    )
  );

  return routesToAngularRoutes(
    [
      {
        path: '/dashboards',
        title: 'DASHBOARDLIST.DASHBOARDS',
        key: 'all'
      },
      {
        path: '/dashboards/favorites',
        title: 'DASHBOARDLIST.FAVORITE',
        key: 'favorites'
      }
    ],
    {
      reloadOnSearch: false,
      template:
        '<page-dashboard-list on-error="handleError"></page-dashboard-list>',
      controller($scope, $exceptionHandler) {
        'ngInject';

        $scope.handleError = $exceptionHandler;
      }
    }
  );
}

init.init = true;

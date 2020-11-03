import React from 'react';
import { react2angular } from 'react2angular';
import { forEach } from 'lodash';
import Button from 'antd/lib/button';
import { message } from 'antd';
import { Paginator } from '@/components/Paginator';

import {
  wrap as liveItemsList,
  ControllerType
} from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { StateStorage } from '@/components/items-list/classes/StateStorage';

import LoadingState from '@/components/items-list/components/LoadingState';
import EmptyState from '@/components/items-list/components/EmptyState';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import CreateGroupDialog from '@/components/groups/CreateGroupDialog';
import DeleteGroupButton from '@/components/groups/DeleteGroupButton';

import { DataSource } from '@/services/data-source';
import { Group } from '@/services/group';
import settingsMenu from '@/services/settingsMenu';
import { currentUser } from '@/services/auth';
import { navigateTo } from '@/services/navigateTo';
import { routesToAngularRoutes } from '@/lib/utils';

class GroupsList extends React.Component {
  listColumns = [
    Columns.custom(
      (text, group) => (
        <div>
          <a href={'groups/' + group.id}>{group.name}</a>
          {group.permissions.includes('super_admin') && (
            <span className="label label-success m-l-10">超级管理员组</span>
          )}
          {!group.permissions.includes('super_admin') &&
            group.permissions.includes('admin') && (
              <span className="label label-warning m-l-10">管理员组</span>
            )}
        </div>
      ),
      {
        field: 'name',
        width: null
      }
    ),
    Columns.custom(
      (text, group) => (
        <Button.Group>
          <Button href={`groups/${group.id}`}>成员</Button>
          {(!group.permissions.includes('super_admin')) && (
            <Button href={`groups/${group.id}/data_sources`}>数据源</Button>
          )}
        </Button.Group>
      ),
      {
        width: '1%',
        className: 'text-nowrap'
      }
    ),
    Columns.custom(
      (text, group) => {
        const canRemove = group.type !== 'builtin';
        return canRemove ? (
          <DeleteGroupButton
            className="w-100"
            group={group}
            title={canRemove ? null : 'Cannot delete built-in group'}
            onClick={() => this.onGroupDeleted()}
          >
            删除
          </DeleteGroupButton>
        ) : null;
      },
      {
        width: '1%',
        className: 'text-nowrap p-l-0',
        isAvailable: () => currentUser.isAdmin
      }
    )
  ];

  static propTypes = {
    controller: ControllerType.isRequired
  };

  createGroup = () => {
    CreateGroupDialog.showModal().result.then(group => {
      console.log();
      group.$save().then(newGroup => {
        // console.log(newGroup.id);     // 新建分组的id
        const allDataSources = DataSource.query().$promise;
        // 获得所有的数据源id
        Promise.all([allDataSources])
          .then(result => {
            const allDatas = result[0];
            forEach(allDatas, datasource => {
              // console.log(datasource.id);             // 每一个数据源的id
              Group.addDataSource({ id: newGroup.id, data_source_id: datasource.id });
            });
          })
          .catch((error) => {
            message.error('无法添加用户分组权限');
          });

        navigateTo(`/groups/${newGroup.id}`)
      });

    });

  };

  onGroupDeleted = () => {
    this.props.controller.updatePagination({ page: 1 });
    this.props.controller.update();
  };

  render() {
    const { controller } = this.props;
    const { $translate } = this.props;
    return (
      <div data-test="GroupList">
        {currentUser.isAdmin && (
          <div className="m-b-15">
            <Button type="primary" onClick={this.createGroup}>
              <i className="fa fa-plus m-r-5" />
              {$translate.instant('GROUPLIST.NEW_GROUP')}
            </Button>
          </div>
        )}

        {!controller.isLoaded && <LoadingState className="" />}
        {controller.isLoaded && controller.isEmpty && (
          <EmptyState className="" />
        )}
        {controller.isLoaded && !controller.isEmpty && (
          <div className="table-responsive">
            <ItemsTable
              items={controller.pageItems}
              columns={this.listColumns}
              showHeader={false}
              context={this.actions}
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
      </div>
    );
  }
}

export default function init(ngModule) {
  settingsMenu.add({
    permission: 'list_users',
    title: 'GROUPLIST.GROUPS',
    path: 'groups',
    order: 3
  });

  ngModule.component(
    'pageGroupsList',
    react2angular(
      liveItemsList(
        GroupsList,
        new ResourceItemsSource({
          isPlainList: true,
          getRequest() {
            return {};
          },
          getResource() {
            return Group.query.bind(Group);
          },
          getItemProcessor() {
            return item => new Group(item);
          }
        }),
        new StateStorage({ orderByField: 'name', itemsPerPage: 10 })
      ),
      [],
      ['$translate']
    )
  );

  return routesToAngularRoutes(
    [
      {
        path: '/groups',
        title: '组管理',
        key: 'groups'
      }
    ],
    {
      reloadOnSearch: false,
      layout: 'settings',
      template:
        '<settings-screen><page-groups-list on-error="handleError"></page-groups-list></settings-screen>',
      controller($scope, $exceptionHandler) {
        'ngInject';

        $scope.handleError = $exceptionHandler;
      }
    }
  );
}

init.init = true;

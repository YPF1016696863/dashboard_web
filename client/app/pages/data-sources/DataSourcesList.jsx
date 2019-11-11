import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Icon,
  List,
  Avatar,
  Skeleton,
  Tag
} from 'antd';
import { react2angular } from 'react2angular';
import { isEmpty, get } from 'lodash';
import { DataSource, IMG_ROOT } from '@/services/data-source';
import { policy } from '@/services/policy';
import navigateTo from '@/services/navigateTo';
import { $route } from '@/services/ng';
import CardsList from '@/components/cards-list/CardsList';
import LoadingState from '@/components/items-list/components/LoadingState';
import CreateSourceDialog from '@/components/CreateSourceDialog';
import helper from '@/components/dynamic-form/dynamicFormHelper';

import template from './data-sources.html';

class DataSourcesList extends React.Component {
  state = {
    dataSourceTypes: [],
    dataSources: [],
    loading: true,
    routes: [
      {
        path: '/xxx',
        breadcrumbName: 'DataVis'
      },
      {
        path: 'data_sources',
        breadcrumbName: 'DataVis 数据源'
      }
    ]
  };

  componentDidMount() {
    Promise.all([
      DataSource.query().$promise,
      DataSource.types().$promise
    ]).then(values => {
      this.setState(
        {
          dataSources: values[0],
          dataSourceTypes: values[1],
          loading: false
        },
        () => {
          // all resources are loaded in state
          if ($route.current.locals.isNewDataSourcePage) {
            if (policy.canCreateDataSource()) {
              this.showCreateSourceDialog();
            } else {
              navigateTo('/data_sources');
            }
          }
        }
      );
    });
  }

  createDataSource = (selectedType, values) => {
    const target = { options: {}, type: selectedType.type };
    helper.updateTargetWithValues(target, values);

    return DataSource.save(target)
      .$promise.then(dataSource => {
        this.setState({ loading: true });
        DataSource.query(dataSources =>
          this.setState({ dataSources, loading: false })
        );
        return dataSource;
      })
      .catch(error => {
        if (!(error instanceof Error)) {
          error = new Error(get(error, 'data.message', 'Failed saving.'));
        }
        return Promise.reject(error);
      });
  };

  showCreateSourceDialog = () => {
    CreateSourceDialog.showModal({
      $translate: this.props.$translate.instant,
      types: this.state.dataSourceTypes,
      sourceType: 'Data Source',
      imageFolder: IMG_ROOT,
      helpTriggerPrefix: 'DS_',
      onCreate: this.createDataSource
    }).result.then((result = {}) => {
      if (result.success) {
        navigateTo(`data_sources/${result.data.id}`);
      }
    });
  };

  renderDataSources() {
    const { dataSources } = this.state;
    const items = dataSources.map(dataSource => ({
      name: dataSource.name,
      imgSrc: `${IMG_ROOT}/${dataSource.type}.png`,
      href: `data_sources/${dataSource.id}`,
      loading: false,
      desc: dataSource.type,
      viewOnly: dataSource.view_only
    }));

    return isEmpty(dataSources) ? (
      <div className="text-center">
        There are no data sources yet.
        {policy.isCreateDataSourceEnabled() && (
          <div className="m-t-5">
            <a className="clickable" onClick={this.showCreateSourceDialog}>
              Click here
            </a>{' '}
            to add one.
          </div>
        )}
      </div>
    ) : (
      <List
        className="demo-loadmore-list"
        itemLayout="horizontal"
        dataSource={items}
        renderItem={item => (
          <List.Item
            actions={[
              <a href={item.href}>
                <Icon type="edit" style={{ fontSize: '18px' }} />
                编辑
              </a>
            ]}
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                avatar={<Avatar size={52} src={item.imgSrc} />}
                title={item.name}
                description={
                  <>
                    {item.desc}
                  </>
                }
              />
              {item.viewOnly ? (
                <Tag color="#2db7f5">只读权限</Tag>
              ) : (
                <Tag color="#108ee9">读写权限</Tag>
              )}
            </Skeleton>
          </List.Item>
        )}
      />
    );
  }

  render() {
    const { $translate } = this.props;
    const { routes } = this.state;
    const newDataSourceProps = {
      type: 'primary',
      onClick: policy.isCreateDataSourceEnabled()
        ? this.showCreateSourceDialog
        : null,
      disabled: !policy.isCreateDataSourceEnabled()
    };

    return (
      <div>
        {this.state.loading ? (
          <LoadingState className="" />
        ) : (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href="/">
                <Icon type="home" />
              </Breadcrumb.Item>
              <Breadcrumb.Item href="/data_sources">
                <Icon type="database" />
                <span>数据源</span>
              </Breadcrumb.Item>
            </Breadcrumb>
            <PageHeader
              title="数据源"
              subTitle="添加并管理数据源"
              extra={[
                <Button {...newDataSourceProps}>
                  <i className="fa fa-plus m-r-5" />
                  {$translate.instant('DATASOURCELIST.NEW_DATA_SOURCE')}
                </Button>
              ]}
            >
              <Descriptions size="small" column={3}>
                <Descriptions.Item label="备注">
                  管理员可在该页面连接并管理数据源,数据源的使用权限将以组管理的方式授予用户
                </Descriptions.Item>
              </Descriptions>
            </PageHeader>
            {this.renderDataSources()}
          </>
        )}
      </div>
    );
  }
}

export default function init(ngModule) {
  ngModule.component(
    'pageDataSourcesList',
    react2angular(DataSourcesList, [], ['$translate'])
  );

  return {
    '/data_sources': {
      template,
      title: 'DataVis - 数据源'
    }
  };
}

init.init = true;

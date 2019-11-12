import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Icon,
  Avatar,
  Table,
  Divider,
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

const { Column, ColumnGroup } = Table;

class DataSourcesList extends React.Component {
  state = {
    dataSourceTypes: [],
    dataSources: [],
    loading: true
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
      desc: dataSource.type,
      viewOnly: dataSource.view_only
    }));

    const data = [
      {
        name: 'John',
        imgSrc: 'Brown',
        desc: 'desc',
        href: 'www.google.com',
        viewOnly: true
      }
    ];

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
      <Table dataSource={items} pagination={{ position: 'bottom' }}>
        <Column
          title=""
          dataIndex="imgSrc"
          key="imgSrc"
          render={(text, record, index) => (
            <Avatar size={68} src={record.imgSrc} />
          )}
        />
        <Column title="数据源名称" dataIndex="name" key="name" />
        <Column title="数据源类型" dataIndex="desc" key="desc" />
        <Column
          title="权限"
          dataIndex="viewOnly"
          key="viewOnly"
          render={(text, record, index) => <Tag color="#108ee9">读写权限</Tag>}
        />
        <Column
          title="操作"
          key="action"
          render={(text, record, index) => (
            <Button type="primary" href={record.href}>
              修改
            </Button>
          )}
        />
      </Table>
    );
  }

  render() {
    const { $translate } = this.props;
    const newDataSourceProps = {
      type: 'primary',
      ghost:true,
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
              title={<span style={{fontSize:'18px'}}>数据源</span>}
              subTitle={<span style={{fontSize:'13px'}}>添加并管理数据源</span>}
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

import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import {
  PageHeader,
  Button,
  Descriptions,
  Icon,
  Divider,
  Breadcrumb
} from 'antd';
import { get } from 'lodash';
import './DataSourcesPageHeader.less';
import { DataSource, IMG_ROOT } from '@/services/data-source';
import { $route } from '@/services/ng';
import { policy } from '@/services/policy';
import navigateTo from '@/services/navigateTo';
import helper from '@/components/dynamic-form/dynamicFormHelper';

import CreateSourceDialog from '@/components/CreateSourceDialog';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createDataSource","render"] }] */
class DataSourcePageHeader extends React.Component {
  /*
  constructor(props) {
    super(props);
  }
  */
  state = {
    dataSourceTypes: null
  };

  componentDidMount() {
    Promise.all([DataSource.types().$promise]).then(values => {
      this.setState({
        dataSourceTypes: values[0]
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
      if (result.success) {
        this.props.$window.location.reload();
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
          error = new Error(get(error, 'data.message', '保存失败.'));
        }
        return Promise.reject(error);
      });
  }

  render() {
    return (
      <>
        <Breadcrumb className="content-layout-Breadcrumb">
          <Breadcrumb.Item href="/">
            <Icon type="home" />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Icon type="file-search" />
            <span>数据源</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          className="content-layout-header"
          title={<span style={{ fontSize: '18px' }}>数据源</span>}
          subTitle={
            <>
              <span style={{ fontSize: '13px' }}>新建并管理数据源</span>
            </>
          }
          extra={[
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="备注">
              管理员可在该页面连接并管理数据源,数据源的使用权限将以组管理的方式授予用户
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Divider className="header-divider" />
      </>
    );
  }
}

DataSourcePageHeader.propTypes = {};
DataSourcePageHeader.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'sourceListHeaderPage',
    react2angular(
      DataSourcePageHeader,
      Object.keys(DataSourcePageHeader.propTypes),
      ['$rootScope', '$scope','$translate', '$window']
    )
  );
}

init.init = true;

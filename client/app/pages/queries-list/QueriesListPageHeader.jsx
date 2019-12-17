import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import {
  PageHeader,
  Button,
  Descriptions,
  Icon,
  Divider,
  Breadcrumb,
  Steps
} from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';

import './QueriesListPageHeader.less';

const { Step } = Steps;

class QueriesListPageHeader extends React.Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  componentDidMount() {}

  render() {
    const newDataSourceProps = {
      type: 'primary',
      ghost: true,
      size: 'small',
      onClick: policy.isCreateDataSourceEnabled()
        ? this.showCreateSourceDialog
        : null,
      disabled: !policy.isCreateDataSourceEnabled()
    };

    const switchToSimpleQueryProps = {
      type: 'danger',
      ghost: true,
      size: 'small',
      onClick: policy.isCreateDataSourceEnabled()
        ? this.showCreateSourceDialog
        : null,
      disabled: !policy.isCreateDataSourceEnabled()
    };

    return (
      <>
        <Breadcrumb className="content-layout-Breadcrumb">
          <Breadcrumb.Item href="/">
            <Icon type="home" />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Icon type="file-search" />
            <span>数据集</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          className="content-layout-header"
          title={<span style={{ fontSize: '18px' }}>数据集</span>}
          subTitle={
            <>
              <span style={{ fontSize: '13px' }}>新建并管理数据查询</span>
            </>
          }
          extra={[
            <Steps size="small" current={1}>
              <Step title="数据源" description="连接一个数据源" />
              <Step title="建立数据集" description="基于建立数据源建立数据集" />
              <Step
                title="创建可视化组件"
                description="使用数据集为可视化组件提供数据."
              />
              <Step
                title="创建可视化仪表板"
                description="建立和编辑可视化仪表板."
              />
            </Steps>
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="备注">
              用户可在该页面新建和管理数据集,数据集稍后将被应用于图表组件的创建当中
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Divider className="header-divider" />
      </>
    );
  }
}

QueriesListPageHeader.propTypes = {};
QueriesListPageHeader.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'queriesListPageHeader',
    react2angular(
      QueriesListPageHeader,
      Object.keys(QueriesListPageHeader.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

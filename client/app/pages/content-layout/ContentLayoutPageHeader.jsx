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
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';

import './ContentLayoutPageHeader.less';

class ContentLayoutPageHeader extends React.Component {
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

    return (
      <>
        <Breadcrumb className="content-layout-Breadcrumb">
          <Breadcrumb.Item href="/">
            <Icon type="home" />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/queries">
            <Icon type="file-search" />
            <span>数据查询</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          className="content-layout-header"
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
            <Button ghost type="primary" size='small'>
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
      </>
    );
  }
}

ContentLayoutPageHeader.propTypes = {};
ContentLayoutPageHeader.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'contentLayoutPageHeader',
    react2angular(
      ContentLayoutPageHeader,
      Object.keys(ContentLayoutPageHeader.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

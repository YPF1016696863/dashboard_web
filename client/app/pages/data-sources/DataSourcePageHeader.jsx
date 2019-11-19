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

import './DataSourcesPageHeader.less';

class DataSourcePageHeader extends React.Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  componentDidMount() {}

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
            <Button
              ghost
              type="primary"
              size="small"
              href="/queries/new"
              target="_blank"
            >
              <i className="fa fa-plus m-r-5" />
              新建数据源
            </Button>
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
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

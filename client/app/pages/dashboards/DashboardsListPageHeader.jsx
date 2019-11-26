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

import './DashboardsListPageHeader.less';

class DashboardsListPageHeader extends React.Component {
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
            <span>可视化仪表盘</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          className="content-layout-header"
          title={<span style={{ fontSize: '18px' }}>可视化仪表盘</span>}
          subTitle={
            <>
              <span style={{ fontSize: '13px' }}>新建并管理可视化仪表盘</span>
            </>
          }
          extra={[
            <Button
              ghost
              type="primary"
              size="small"
              disabled={this.props.slugId == null}
              target="_blank"
            >
              <i className="fa fa-edit m-r-5" />
              编辑可视化仪表盘
            </Button>
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="备注">
              用户可在该页面新建和管理可视化仪表盘
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Divider className="header-divider" />
      </>
    );
  }
}

DashboardsListPageHeader.propTypes = {
  slugId: PropTypes.string
};
DashboardsListPageHeader.defaultProps = {
  slugId: null
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsListPageHeader',
    react2angular(
      DashboardsListPageHeader,
      Object.keys(DashboardsListPageHeader.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

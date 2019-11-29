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

import './ChartsPageHeader.less';

class ChartsPageHeader extends React.Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  componentDidMount() {}

  render() {
    const { query } = this.props;
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
          <Breadcrumb.Item href="/charts">
            <Icon type="file-search" />
            <span>可视化组件</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Icon type="pie-chart" />
            <span>{"{图表名称}"}</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          className="content-layout-header"
          title={<span style={{ fontSize: '18px' }}>{"{图表名称}"}</span>}
          subTitle={
            <>
              <span style={{ fontSize: '13px' }}>编辑可视化组件列表</span>
            </>
          }
          extra={[
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="备注">
              用户可在该页面编辑可视化组件,可视化组件稍后将被应用于可视化面板的创建当中
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Divider className="header-divider" />
      </>
    );
  }
}

ChartsPageHeader.propTypes = {
};
ChartsPageHeader.defaultProps = {
};

export default function init(ngModule) {
  ngModule.component(
    'chartsPageHeader',
    react2angular(
        ChartsPageHeader,
      Object.keys(ChartsPageHeader.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

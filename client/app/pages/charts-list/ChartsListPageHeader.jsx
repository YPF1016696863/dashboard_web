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

import './ChartsListPageHeader.less';

class ChartsListPageHeader extends React.Component {
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
          <Breadcrumb.Item>
            <Icon type="file-search" />
            <span>可视化组件列表</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          className="content-layout-header"
          title={<span style={{ fontSize: '18px' }}>可视化组件列表</span>}
          subTitle={
            <>
              <span style={{ fontSize: '13px' }}>新建并管理可视化组件列表</span>
            </>
          }
          extra={[
            <Button
              ghost
              type="primary"
              size="small"
              disabled={this.props.queryId == null}
              href={'/queries/' + this.props.queryId + '/source'}
              target="_blank"
            >
              <i className="fa fa-edit m-r-5" />
              编辑可视化组件
            </Button>,
            <Button
              ghost
              type="primary"
              size="small"
              href="/queries/new"
              target="_blank"
            >
              <i className="fa fa-plus m-r-5" />
              新建可视化组件
            </Button>
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="备注">
              用户可在该页面新建和管理可视化组件,可视化组件稍后将被应用于可视化面板的创建当中
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Divider className="header-divider" />
      </>
    );
  }
}

ChartsListPageHeader.propTypes = {
  queryId: PropTypes.string
};
ChartsListPageHeader.defaultProps = {
  queryId: null
};

export default function init(ngModule) {
  ngModule.component(
    'chartsListPageHeader',
    react2angular(
        ChartsListPageHeader,
      Object.keys(ChartsListPageHeader.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

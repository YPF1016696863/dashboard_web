import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Menu, Button, Row, Icon, Divider, Col } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';

import './DashboardsPageHeader.less';

const { SubMenu } = Menu;

class DashboardsPageHeader extends React.Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  componentDidMount() {}
  // #20263B

  render() {
    return (
      <div>
        <Menu
          mode="horizontal"
          className="dashboard-header-menu"
          selectable={false}
        >
          <Menu.Item key="mail">
            <Icon type="save" />
            保存
          </Menu.Item>
          <Divider type="vertical" />

          <Menu.Item key="alipay2" style={{ float: 'right' }}>
            <Icon type="play-square" />
            预览模式
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

DashboardsPageHeader.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  slugId: PropTypes.string
};
DashboardsPageHeader.defaultProps = {
  slugId: null
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsPageHeader',
    react2angular(
      DashboardsPageHeader,
      Object.keys(DashboardsPageHeader.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

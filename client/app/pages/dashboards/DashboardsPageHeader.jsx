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
        <Menu mode="horizontal" className="dashboard-header-menu">
          <Menu.Item key="mail">
            <Icon type="mail" />
            Navigation One
          </Menu.Item>
          <Menu.Item key="app" disabled>
            <Icon type="appstore" />
            Navigation Two
          </Menu.Item>
          <Menu.Item key="alipay">
            <Icon type="appstore" />
            Navigation Two
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

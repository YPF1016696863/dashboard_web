import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Switch, Icon, Modal, Form,Row, Col } from 'antd';
import _ from 'lodash';

const darkThemeSwitchImg = '/static/images/darkThemeSwitch.png';

class DashboardThemeSwitch extends React.Component {

  constructor(props) {
    super(props);
    const {$rootScope} = props;
    // Get theme flag from rootScope first, if not exist, set to false, which means use light theme.
    this.state = { visible: false, isDarkTheme:_.get($rootScope,"theme.theme","light") === "dark" };// false: light theme, true: dark theme.
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  onSwitchTheme = () => {
    const {$rootScope,$scope} = this.props;
    const isDarkTheme = !this.state.isDarkTheme;
    this.setState({isDarkTheme});

    if($rootScope) {
      $rootScope.theme = {
        theme: isDarkTheme?'dark':'light',
        bodyBackgroundColor: isDarkTheme?"dashboard-dark-theme":"dashboard-light-theme",
        dashboardHeaderBackgroundColor: isDarkTheme?"widget-dark-theme":"widget-light-theme",
        dashboardHeaderTitleColor: isDarkTheme?"header-title-dark-theme":"header-title-light-theme",
        widgetBackgroundColor: isDarkTheme?"widget-dark-theme":"widget-light-theme",
        queryLinkTextColor: isDarkTheme?"query-link-dark-theme":"query-link-light-theme",
        widgetHeaderTextColor: isDarkTheme?"widget-header-text-dark-theme":"widget-header-text-light-theme",
        widgetFooterTextColor: isDarkTheme?"widget-footer-text-dark-theme":"widget-footer-text-light-theme",
        widgetActionPanelBackgroundColor:isDarkTheme?"widget-action-panel-dark-theme":"widget-action-panel-light-theme",
        dashboardFooterFontColor:isDarkTheme?"dashboard-footer-font-color-dark-theme":"dashboard-footer-font-color-light-theme",
        dashboardTableTextColor:isDarkTheme?"dashboard-widget-table-text-dark-theme":'dashboard-widget-table-text-light-theme',
        dashboardTableHeaderTextColor:isDarkTheme?'dashboard-widget-table-header-text-dark-theme':'dashboard-widget-table-header-text-light-theme',
        dashboardWidgetScrollBar: isDarkTheme?'dashboard-widget-scrollbox-dark':'dashboard-widget-scrollbox-light',
        dashboardHeaderButtonColor: isDarkTheme
      };
      $rootScope.$applyAsync();
    }
  };

  render() {
    const {$translate} = this.props;
    return (
      <>
        <button 
          type="button" 
          className={"btn btn-sm hidden-xs btn-default" + (this.state.isDarkTheme?" header-title-dark-theme":"")}
          tooltip={$translate.instant("DASHBOARD.SETTINGS.THEME.TIP")}
          onClick={this.showModal}
        >
          <span className="zmdi zmdi-invert-colors" />
        </button>
        <Modal
          title={
            <React.Fragment>
              {$translate.instant("DASHBOARD.SETTINGS.THEME.TIP")}
              <div className="modal-header-desc">
                {$translate.instant("DASHBOARD.SETTINGS.THEME.DESC")}
              </div>
            </React.Fragment>
          }
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
        >

          <Row type="flex" justify="center" align="middle">
            <Col span={8}>
              <Form layout="horizontal">
                <Form.Item label={$translate.instant("DASHBOARD.SETTINGS.THEME.TIP")} {...this.formItemProps}>
                  <Switch
                    checkedChildren={$translate.instant("DASHBOARD.SETTINGS.THEME.DARK")}
                    unCheckedChildren={$translate.instant("DASHBOARD.SETTINGS.THEME.BRIGHT")}
                    checked={this.state.isDarkTheme}
                    onClick={this.onSwitchTheme}
                  />
                </Form.Item>
              </Form>
            </Col>
            <Col span={16}>
              <img className="p-5" src={darkThemeSwitchImg} width="250" alt="darkThemeSwitch" />
            </Col>
          </Row>
        </Modal>
      </>
    );
  }
}

DashboardThemeSwitch.propTypes = {
};

DashboardThemeSwitch.defaultProps = {
};

export default function init(ngModule) {
  ngModule.component('dashboardThemeSwitch', react2angular(DashboardThemeSwitch,
    Object.keys(DashboardThemeSwitch.propTypes),
    ['$translate','$rootScope','$scope']));
}

init.init = true;

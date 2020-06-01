import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Modal, Button, Icon, message, Table, Checkbox, Switch, Divider } from 'antd';
import * as _ from 'lodash';
import { appSettingsConfig } from '@/config/app-settings';
import { Group } from '@/services/group';
import { currentUser } from '@/services/auth';


export default class UserGroupPermissionDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      runtime: {
        loading: false,
        allGroups: null
      }
    };
  }

  componentDidMount() {
  }

  showModal = () => {

    this.setState({
      visible: true,
      runtime: {
        loading: true,
        allGroups: null
      }
    });

    const componentType = this.props.componentType;

    let enabledGroupsP;

    switch (componentType) {
      case 'dashboard':
        enabledGroupsP = Group.groupsByDashboardId({ id: this.props.component.id }).$promise;
        break;
      case 'query':
        enabledGroupsP = Group.groupsByQueryId({ id: this.props.component.id }).$promise;
        break;
      default:
        enabledGroupsP = null;
        break;
    }

    if (!enabledGroupsP) {
      message.error('无法打开用户分组权限管理组件');
      this.setState({
        visible: false,
        runtime: {
          loading: false,
          allGroups: null
        }
      });
      return;
    }

    const allGroupsP = Group.query({ filter: true }).$promise;

    Promise.all([enabledGroupsP, allGroupsP])
      .then(result => {
        const enabledGroups = result[0];
        const allGroups = result[1];
        if (enabledGroups) {
          _.forEach(allGroups, group => {
            group.checked = false;
            _.forEach(enabledGroups, enabledGroup => {
              if (enabledGroup.id === group.id) {
                group.checked = true;
              }
            });
          });
        }

        this.setState({
          visible: true,
          runtime: {
            loading: false,
            allGroups
          }
        });
      })
      .catch((error) => {
        message.error('无法打开用户分组权限管理组件');
        this.setState({
          visible: false,
          runtime: {
            loading: false,
            allGroups: null
          }
        });
      });
  };

  handleOk = e => {
    if (this.props.callback) {
      this.props.callback();
    }
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  render() {
    return (
      <>
        <Button
          type="primary"
          onClick={e => {
            this.showModal();
          }}
        >
          <Icon type="plus" /> 添加
        </Button>
        <Modal
          title="用户分组权限设置"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleOk}
          footer={[
            <Button key="submit" type="primary" onClick={this.handleOk}>
              确认
            </Button>
          ]}
        >
          <p>
            <Table
              tableLayout="fixed"
              columns={[
                {
                  title: '用户分组',
                  dataIndex: 'name',
                  key: 'name',
                  render: text => text,
                },
                {
                  title: '授权访问',
                  key: 'action',
                  render: (text, record) => {
                    return (
                      <span>
                        <Checkbox
                          defaultChecked={record.checked}
                          onChange={
                            e => {
                              console.log("trggiert");
                              console.log(this.props);
                              if (this.props.component && this.props.component.id) {
                                let addFunc;
                                let removeFunc;
                                switch (this.props.componentType) {
                                  case 'dashboard':
                                    if (e.target.checked) {
                                      Group.addDashboard({ id: record.id, dashboard_id: this.props.component.id });
                                    } else {
                                      Group.removeDashboard({ id: record.id, dashboard_id: this.props.component.id });
                                    }
                                    break;
                                  case 'query':
                                    if (e.target.checked) {
                                      Group.addQuery({ id: record.id, query_id: this.props.component.id });
                                    } else {
                                      Group.removeQuery({ id: record.id, query_id: this.props.component.id });
                                    }
                                    break;
                                  default:
                                    message.error('出现错误,无法确认权限识别类型,请刷新页面重试.');
                                    break;
                                }
                              } else {
                                message.error('页面出现错误,无法设置用户权限,请刷新页面重试');
                              }
                            }
                          }
                        />
                      </span>
                    )
                  },
                }
              ]}
              dataSource={this.state.runtime.allGroups}
              loading={this.state.runtime.loading}
              pagination={{ position: 'none' }}
            />
          </p>
        </Modal>
      </>
    );
  }
}

UserGroupPermissionDialog.propTypes = {
};

UserGroupPermissionDialog.defaultProps = {
};


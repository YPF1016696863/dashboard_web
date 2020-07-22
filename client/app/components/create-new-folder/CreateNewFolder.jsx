import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Dropdown,
  Menu,
  Icon,
  Modal,
  Form,
  Col,
  Tree,
  Input,
  Alert,
  Empty,
  message,
  Tabs
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';

import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';
import {
  editableMappingsToParameterMappings,
  synchronizeWidgetTitles
} from '@/components/ParameterMappingInput';
import {
  wrap as itemsList,
  ControllerType
} from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { UrlStateStorage } from '@/components/items-list/classes/StateStorage';
import { navigateTo } from '@/services/navigateTo';
import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';
import { $http } from '@/services/ng';
import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';
import { Dashboard } from '@/services/dashboard';
import { Widget } from '@/services/widget';
import { policy } from '@/services/policy';
import {appSettingsConfig} from "@/config/app-settings";

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

export class CreateNewFolder extends React.Component {
  state = {
    visible: false,
    name: '新建文件夹'
  };

  componentDidMount() {}

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
    this.props.onSuccess(this.state.name);
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { appSettings } = this.props;
    const { defaultName } = this.state;
    // console.log(selectedName);
    return (
      <>
        <Button size="small" type="link" style={{ color: '#3d4d66' }} onClick={this.showModal}>
          <Icon type="folder-add" style={{ color: '#faaa39' }} />
          新建文件夹
        </Button>
        <Modal
          destroyOnClose
          title="新建文件夹"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="33vw"
          cancelText="取消"
          okText="确认"
          okButtonProps={{
            disabled: false // !this.state.name
          }}
        >
          <Form>
            <Form.Item label="文件夹名" hasFeedback>
              <Input allowClear placeholder="新建文件夹" value={this.state.name} onChange={e => this.setState({name: e.target.value})} />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

CreateNewFolder.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  onSuccess: PropTypes.func
};

CreateNewFolder.defaultProps = {
  onSuccess: (name)=>{}
};

export default function init(ngModule) {
  ngModule.component(
    'createNewFolder',
    react2angular(CreateNewFolder, Object.keys(CreateNewFolder.propTypes), [
      'appSettings',
      '$location'
    ])
  );
}

init.init = true;

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
  Row,
  Col,
  Tree,
  Input,
  Alert,
  Empty,
  message,
  Tabs, Avatar
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

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';
import { Dashboard } from '@/services/dashboard';
import { Widget } from '@/services/widget';
import { policy } from '@/services/policy';
import {IMG_ROOT} from "@/services/data-source";

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

export class MoveToFolder extends React.Component {
  state = {
    visible: false,
    targetfolder: null
    // current: null
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
    this.props.onSuccess(this.state.targetfolder);
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  renderTree = (treelist,idx) => {
    return treelist.map(item => {
      if (!item.children){
        return (
          <TreeNode title={item.title} key={item.key} />
        )}
      return(
        <TreeNode title={item.title} key={item.key}>
          {this.renderTree(item.children)}
        </TreeNode>
      )
    })
  };
  
  render() {
    const { appSettings } = this.props;
    const { defaultName } = this.state;
    const { structure } = this.props;
    return (
      <>
        <Button size="small" type="link" style={{ color: '#3d4d66' }} onClick={this.showModal}>
          <Icon type="folder-open" style={{ color: '#3685f2' }} />
          移动至
        </Button>
        <Modal
          destroyOnClose
          title="移动至文件夹"
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
          <Row>
            <Col style={{ paddingRight: '10px' }}>
              <DirectoryTree
                expandAction="doubleClick"
                onSelect={(value,node,extra)=>
                    this.setState({
                            targetfolder:node.node.props.eventKey
                        }
                    )
                }
              >
                {structure? this.renderTree(structure):null}
              </DirectoryTree>
            </Col>
          </Row>
        </Modal>
      </>
    );
  }
}

MoveToFolder.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  onSuccess: PropTypes.func
};

MoveToFolder.defaultProps = {
  onSuccess: (name)=>{}
};

export default function init(ngModule) {
  ngModule.component(
    'moveToFolder',
    react2angular(MoveToFolder, Object.keys(MoveToFolder.propTypes), [
      'appSettings',
      '$location'
    ])
  );
}

init.init = true;

import React from 'react';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';
import { wrap as wrapDialog, DialogPropType } from '@/components/DialogWrapper';
import { Group } from '@/services/group';

class CreateGroupDialog extends React.Component {
  static propTypes = {
    dialog: DialogPropType.isRequired
  };

  state = {
    name: '',
    isAdmin: false
  };

  save = () => {
    this.props.dialog.close(
      new Group({
        name: this.state.name,
        isAdmin: this.state.isAdmin
      })
    );
  };

  render() {
    const { dialog } = this.props;
    return (
      <Modal
        {...dialog.props}
        title="创建一个新的组"
        okText="Create"
        onOk={() => this.save()}
      >
        <Input
          className="form-control"
          defaultValue={this.state.name}
          onChange={event => this.setState({ name: event.target.value })}
          placeholder="组名"
          autoFocus
        />
        <br />
        <br />
        <Checkbox
          checked={this.state.isAdmin}
          onChange={event => this.setState({ isAdmin: event.target.checked })}
        >
          普通管理员权限
        </Checkbox>
      </Modal>
    );
  }
}

export default wrapDialog(CreateGroupDialog);

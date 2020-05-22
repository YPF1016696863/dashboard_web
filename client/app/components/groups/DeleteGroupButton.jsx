import { isString } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import notification from '@/services/notification';

function deleteGroup(event, group, onGroupDeleted) {
  Modal.confirm({
    title: '删除组',
    content: '您确定要删除该组吗？',
    okText: '是',
    okType: 'danger',
    cancelText: '否',
    onOk: () => {
      group.$delete(() => {
        notification.success('组已成功删除.');
        onGroupDeleted();
      });
    },
  });
}

export default function DeleteGroupButton({ group, title, onClick, children, ...props }) {
  if (!group) {
    return null;
  }
  const button = (
    <Button {...props} type="danger" onClick={event => deleteGroup(event, group, onClick)}>{children}</Button>
  );

  if (isString(title) && (title !== '')) {
    return <Tooltip placement="top" title={title} mouseLeaveDelay={0}>{button}</Tooltip>;
  }

  return button;
}

DeleteGroupButton.propTypes = {
  group: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

DeleteGroupButton.defaultProps = {
  group: null,
  title: null,
  onClick: () => {},
  children: null,
};

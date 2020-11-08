import { markdown } from 'markdown';
import { debounce } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Divider from 'antd/lib/divider';
import { wrap as wrapDialog, DialogPropType } from '@/components/DialogWrapper';
import notification from '@/services/notification';
import E from 'wangeditor';

import './TextboxDialog.less';

class TextboxDialog extends React.Component {

  updatePreview = debounce(() => {
    const text = this.state.text;
    this.setState({
      preview: markdown.toHTML(text),
    });
  }, 100);

  static propTypes = {
    dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    dialog: DialogPropType.isRequired,
    onConfirm: PropTypes.func.isRequired,
    text: PropTypes.string,
  };

  static defaultProps = {
    text: '',
  };

    constructor(props) {
    super(props);
    const { text } = props;
    this.state = {
      saveInProgress: false,
      text,
      preview: markdown.toHTML(text),
    };
  }


  onTextChanged = (event) => {
    this.setState({ text: event.target.value });
    this.updatePreview();
  };

  saveWidget() {
    this.setState({ saveInProgress: true });

    this.props.onConfirm(this.state.text)
      .then(() => {
        this.props.dialog.close();
      })
      .catch(() => {
        notification.error('Widget could not be added');
      })
      .finally(() => {
        this.setState({ saveInProgress: false });
      });
  }

  render() {
    const { dialog } = this.props;
    const isNew = !this.props.text;
    console.log("props",this.state.preview);
    console.log("editor",this.state.editorState);
    console.log("text.css",this.state.text);
    return (
      <Modal
        {...dialog.props}
        title={isNew ? '添加文本框' : '编辑文本框'}
        onOk={() => this.saveWidget()}
        okButtonProps={{
          loading: this.state.saveInProgress,
          disabled: !this.state.text,
        }}
        okText={isNew ? '添加到可视化面板' : '保存文本框'}
        width={500}
        wrapProps={{ 'data-test': 'TextboxDialog' }}
      >
        {/*
        <RichTextEditor />
        */}

        <div className="textbox-dialog">
          <Input.TextArea
            className="resize-vertical"
            rows="5"
            value={this.state.text}
            onChange={this.onTextChanged}
            autoFocus
            placeholder='请输入文本'
          />
          <small>
            Supports basic{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://daringfireball.net/projects/markdown/syntax"
            >
              <Tooltip title="Markdown guide opens in new window">Markdown</Tooltip>
            </a>.
          </small>
          {this.state.text && (
            <React.Fragment>
              <Divider dashed />
              <strong className="preview-title">预览文本框</strong>
              <p
                dangerouslySetInnerHTML={{ __html: this.state.preview }} // eslint-disable-line react/no-danger
                className="preview markdown"
              />
            </React.Fragment>
          )}
        </div>
      </Modal>
    );
  }
}


export default wrapDialog(TextboxDialog);

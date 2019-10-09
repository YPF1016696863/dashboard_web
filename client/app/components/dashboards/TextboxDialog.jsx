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
    const translate = this.props.$translate ? this.props.$translate : null;
    return (
      <Modal
        {...dialog.props}
        title={isNew ? translate.instant("TEXTBOXDIALOG.ADD") : translate.instant("TEXTBOXDIALOG.EDIT")}
        onOk={() => this.saveWidget()}
        okButtonProps={{
          loading: this.state.saveInProgress,
          disabled: !this.state.text,
        }}
        okText={isNew ? translate.instant("TEXTBOXDIALOG.ADD_TO_DASHBOARD") : translate.instant("TEXTBOXDIALOG.SAVE")}
        width={500}
        wrapProps={{ 'data-test': 'TextboxDialog' }}
      >
        <div className="textbox-dialog">
          <Input.TextArea
            className="resize-vertical"
            rows="5"
            value={this.state.text}
            onChange={this.onTextChanged}
            autoFocus
            placeholder={translate.instant("TEXTBOXDIALOG.PLACEHOLDER")}
          />
          <small>
            Supports basic{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.markdownguide.org/cheat-sheet/#basic-syntax"
            >
              <Tooltip title="Markdown guide opens in new window">Markdown</Tooltip>
            </a>.
          </small>
          {this.state.text && (
            <React.Fragment>
              <Divider dashed />
              <strong className="preview-title">{translate.instant("TEXTBOXDIALOG.PREVIEW")}</strong>
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

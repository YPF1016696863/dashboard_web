import React from 'react';
import { markdown } from 'markdown';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { angular2react } from 'angular2react';
import { Modal, Button ,Input,Tooltip,Divider } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';
import { Widget } from '@/services/widget';

import './DashboardAddTextbox.less';



class DashboardAddTextbox extends React.Component {
  /*
    constructor(props) {
      super(props);
    }
    */
   updatePreview = debounce(() => {
    const text = this.state.text;
    this.setState({
      preview: markdown.toHTML(text),
    });
  }, 100);

  // static propTypes = {
  //   // dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  //   // dialog: DialogPropType.isRequired,
  //   // onConfirm: PropTypes.func.isRequired,
  //   text: PropTypes.string,
  // };

  // static defaultProps = {
  //   text: '',
  // };

  constructor(props) {
    super(props);
    const { text } = props;
    this.state = {
      // saveInProgress: false,
      text,
      preview: markdown.toHTML(text),
    };
  }

  state = { 
    visible: false 
  };


  // #20263B
  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
    const widget = new Widget({
      id:999,
      dashboard_id: null,
      options: {
        isHidden: false,
        position: {},
      },
      text:this.state.text,
      visualization: null,
      visualization_id: null,
    });
    this.props.addWidgetCb({widget});
    this.setState({ text: '' });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
    this.setState({ text: '' });
  };
 
  onTextChanged = (event) => {
    this.setState({ text: event.target.value });
    this.updatePreview();
  };

  render() {
    const isNew = !this.props.text;
    return (
      <div>
        <span onClick={this.showModal}>添加文本框</span>
        <Modal
          destroyOnClose
          title="添加文本框"
          visible={this.state.visible}
          onOk={this.handleOk}
          okButtonProps={{
            disabled: !this.state.text,
          }}
          onCancel={this.handleCancel}
          width="60vw"
          cancelText="取消"
          okText="添加"
        >
          <div className="textbox-dialog">
            <Input.TextArea
              className="resize-vertical"
              rows="5"
              value={this.state.text}
              onChange={this.onTextChanged}
              autoFocus
              placeholder="在此输入你想输入的文本"
            />
            {/* <small>
              Supports basic{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.markdownguide.org/cheat-sheet/#basic-syntax"
              >
                <Tooltip title="Markdown guide opens in new window">Markdown</Tooltip>
              </a>.
            </small> */}
            {this.state.text && (
              <React.Fragment>
                <Divider dashed />
                <strong className="preview-title">文本框预览</strong>
                <p
                  dangerouslySetInnerHTML={{ __html: this.state.preview }} // eslint-disable-line react/no-danger
                  className="preview markdown"
                />
              </React.Fragment>
            )}
          </div>
        
        </Modal>
      </div>
    );
  }
}

DashboardAddTextbox.propTypes = {
  text: PropTypes.string,
  addWidgetCb: PropTypes.func
};
DashboardAddTextbox.defaultProps = {
  text: '',
  addWidgetCb: data => {}
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardAddTextbox',
    react2angular(
      DashboardAddTextbox,
      Object.keys(DashboardAddTextbox.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

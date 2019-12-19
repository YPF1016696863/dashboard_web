import React from 'react';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import { Button } from 'antd';

export default class InputWithCopy extends React.Component {
  constructor(props) {
    super(props);
    this.state = { copied: null };
    this.ref = React.createRef();
    this.copyFeatureSupported = document.queryCommandSupported('copy');
    this.resetCopyState = null;
  }

  componentWillUnmount() {
    if (this.resetCopyState) {
      clearTimeout(this.resetCopyState);
    }
  }

  copy = () => {
    // select text
    this.ref.current.select();

    // copy
    try {
      const success = document.execCommand('copy');
      if (!success) {
        throw new Error();
      }
      this.setState({ copied: '已复制!' });
    } catch (err) {
      this.setState({
        copied: '复制失败'
      });
    }

    // reset tooltip
    this.resetCopyState = setTimeout(
      () => this.setState({ copied: null }),
      2000
    );
  };

  render() {
    const copyButton = (
      <Tooltip title={this.state.copied || '复制'}>
        <Button type="link" onClick={this.copy}>
          <Icon type="copy" /> 拷贝链接
        </Button>
      </Tooltip>
    );

    return (
      <Input
        readOnly
        {...this.props}
        ref={this.ref}
        addonAfter={this.copyFeatureSupported && copyButton}
      />
    );
  }
}

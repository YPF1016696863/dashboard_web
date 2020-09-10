/* eslint-disable func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Form,
  Upload,
  message
} from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import { appSettingsConfig } from '@/config/app-settings';
import './index.less';

const UPLOAD_URL = appSettingsConfig.server.backendUrl + "/api/image_upload";
class ImageUpload extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {

  }


  handleChange = info => {

    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          loading: false,
        }),
      );
      if (info.file.response.status === 'OK') {
        // console.log(UPLOAD_URL + info.file.response.url);
        this.props.getImageUrlCb(appSettingsConfig.server.backendUrl+"/static/" + info.file.response.url);
      }
    }
  };

  beforeUpload = (file) => {
    // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    // if (!isJpgOrPng) {
    //   message.error('You can only upload JPG/PNG file!');
    // }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isLt2M;
  }


  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  // onRateChange(e) {
  //   // console.log(e);
  //   this.props.getRateCb(e);

  // }




  render() {
    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;

    return (

      <Upload
        name="file"
        listType="picture-card"
        accept=".jpg,.jpeg,.png,.tif,.gif,.svg"
        className="avatar-uploader"
        showUploadList={false}
        action={UPLOAD_URL}
        beforeUpload={this.beforeUpload}
        onChange={this.handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      </Upload>

    );
  }
}

ImageUpload.propTypes = {
  getImageUrlCb: PropTypes.func,
};
ImageUpload.defaultProps = {
  getImageUrlCb: a => { },
};

export default function init(ngModule) {
  ngModule.component(
    'imageUpload',
    react2angular(
      Form.create()(ImageUpload),
      Object.keys(ImageUpload.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

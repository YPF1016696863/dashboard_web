/* eslint-disable func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Form,
  Upload,
  message,
  Button
} from 'antd';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

import { appSettingsConfig } from '@/config/app-settings';
import './index.less';

const UPLOAD_URL = appSettingsConfig.server.backendUrl + "/api/video_upload";


const props = {
  
  
};

class VideoUpload extends React.Component {

  constructor() {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {

  }


  beforeUpload=(file)=> {
    const isLt2M = file.size / 1024 / 1024 < 200;
    if (!isLt2M) {
      message.error('Image must smaller than 200MB!');
    }
    return isLt2M;
  }
  
  onChange=(info)=> {
    if (info.file.status !== 'uploading') {
      console.log(info.file.response.url);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      this.props.getVideoUrlCb(appSettingsConfig.server.backendUrl+"/static/" + info.file.response.url);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}  上传失败.`);
    }
  }



  render() {
    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;

    return (

      // <Upload
      //   name="file"
      //   listType="picture-card"
      //   accept=".mp4,.avi"
      //   className="avatar-uploader"
      //   showUploadList={false}
      //   action={UPLOAD_URL}
      //   beforeUpload={this.beforeUpload}
      //   onChange={this.handleChange}
      // >
      //   {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      // </Upload>

      <Upload
        name='file'
        action={UPLOAD_URL}
        accept=".mp4,.avi"
        beforeUpload={this.beforeUpload}
        onChange={this.onChange}
      >
        <Button icon={<UploadOutlined />}>点击上传</Button>
      </Upload>
    );
  }
}

VideoUpload.propTypes = {
  getVideoUrlCb: PropTypes.func,
};
VideoUpload.defaultProps = {
  getVideoUrlCb: a => { },
};

export default function init(ngModule) {
  ngModule.component(
    'videoUpload',
    react2angular(
      Form.create()(VideoUpload),
      Object.keys(VideoUpload.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;

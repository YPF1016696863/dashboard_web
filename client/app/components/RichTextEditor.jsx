import React from 'react'
import PropTypes from 'prop-types';
// 引入编辑器组件
import BraftEditor from 'braft-editor'
import { react2angular } from 'react2angular';
// 引入编辑器样式
import 'braft-editor/dist/index.css'

export  class RichTextEditor extends React.Component {
    state = {
        // 创建一个空的editorState作为初始值
        editorState: BraftEditor.createEditorState(null)
    }

    async componentDidMount () {
        // 假设此处从服务端获取html格式的编辑器内容
        const htmlContent = await this.props.fetchEditorContent()
        // 使用BraftEditor.createEditorState将html字符串转换为编辑器需要的editorStat
        this.setState({
            editorState: BraftEditor.createEditorState(htmlContent)
        })
    }

    submitContent = async () => {
        // 在编辑器获得焦点时按下ctrl+s会执行此方法
        // 编辑器内容提交到服务端之前，可直接调用editorState.toHTML()来获取HTML格式的内容
        const htmlContent = this.state.editorState.toHTML()
        const result = await this.props.saveEditorContent(htmlContent)
    }

    handleEditorChange = (editorState) => {
        this.setState({ editorState })
    }

    render () {
        const { editorState } = this.state
        return (
          <div className="my-component">
            <BraftEditor
              value={editorState}
              onChange={this.handleEditorChange}
              onSave={this.submitContent}
            />
            <p
              dangerouslySetInnerHTML={{ __html: this.state.editorState.toHTML() }}
            />
          </div>
            
        )
    }

}

RichTextEditor.propTypes = {
    fetchEditorContent: PropTypes.func.isRequired,
    saveEditorContent: PropTypes.func.isRequired
}

RichTextEditor.defaultProps = {

}

export default function init(ngModule){
    ngModule.component('richtexteditor', react2angular(RichTextEditor));
}

init.init=true;

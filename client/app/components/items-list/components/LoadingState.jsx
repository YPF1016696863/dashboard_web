import React from 'react';
import { Spin } from 'antd';
import { BigMessage } from '@/components/BigMessage';

// Default "loading" message for list pages
export default function LoadingState(props) {
  return (
    <div className="loading-center">
      <img className="loading-img" src="/static/images/loading.gif" alt="Loading..." />
    </div>
  );
}

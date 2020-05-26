import notification from '@/services/notification';

function addOnlineListener(notificationKey) {
  function onlineStateHandler() {
    notification.close(notificationKey);
    window.removeEventListener('online', onlineStateHandler);
  }
  window.addEventListener('online', onlineStateHandler);
}

export default function init(ngModule) {
  ngModule.run(() => {
    window.addEventListener('系统已离线', () => {
      notification.warning('请检查网络连接状况.', null, {
        key: 'connectionNotification',
        duration: null,
      });
      addOnlineListener('connectionNotification');
    });
  });
}

init.init = true;

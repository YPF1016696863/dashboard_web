export default class PromiseRejectionError extends Error {
  constructor(rejection) {
    let message;
    if (rejection.status !== undefined) {
      if (rejection.status === 404) {
        message = "你要访问的页面不存在";
      } else if (rejection.status === 403 || rejection.status === 401) {
        message = '你要访问的页面不存在';
      }
    }

    if (message === undefined) {
      message = '我们好像遇到了一个错误。尝试刷新此页面或与管理员联系。';
    }

    super(message);
    this.rejection = rejection;
  }
}

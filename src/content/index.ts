// 内容脚本
console.log('ChromeToDo 内容脚本已加载');

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageInfo') {
    // 获取页面信息
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      selectedText: window.getSelection()?.toString() || ''
    };
    
    sendResponse(pageInfo);
  }
}); 
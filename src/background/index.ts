// 后台服务脚本
let optionsTabId: number | null = null;

// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener(() => {
  console.log('ChromeToDo 扩展已安装或更新');
  
  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'addToTodo',
    title: '添加到 ChromeToDo',
    contexts: ['selection']
  });

  // 初始化存储
  initStorage();
});

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理打开选项页面的消息
  if (message.action === 'openOptionsPage') {
    // 检查选项页面是否已经打开
    if (optionsTabId !== null) {
      // 如果已经打开，则切换到该标签页并激活它
      chrome.tabs.get(optionsTabId, (tab) => {
        if (chrome.runtime.lastError) {
          // 如果获取标签页失败（可能已关闭），则创建新的标签页
          createOptionsTab();
        } else if (tab) {
          // 如果标签页存在，则激活它
          chrome.tabs.update(optionsTabId as number, { active: true });
          if (tab.windowId) {
            chrome.windows.update(tab.windowId, { focused: true });
          }
        }
      });
    } else {
      // 如果没有打开，则创建新的标签页
      createOptionsTab();
    }
    
    sendResponse({ success: true });
    return true;
  }
});

// 监听标签页关闭事件
chrome.tabs.onRemoved.addListener((tabId) => {
  // 如果关闭的是选项页面，则重置选项页面ID
  if (tabId === optionsTabId) {
    optionsTabId = null;
  }
});

// 创建选项页面标签页
function createOptionsTab() {
  chrome.tabs.create({ url: 'options.html' }, (tab) => {
    // 存储新创建的标签页ID
    if (tab && tab.id) {
      optionsTabId = tab.id;
    }
  });
}

// 初始化本地存储
function initStorage() {
  chrome.storage.local.get(['todos', 'lists'], (result) => {
    // 如果没有存储的数据，则初始化默认数据
    if (!result.todos || !result.lists) {
      chrome.storage.local.set({
        todos: [],
        lists: [],
        initialized: true
      });
    }
  });
}

// 初始化存储
initStorage();

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToTodo') {
    // 将选中文本添加为待办事项
    const selectedText = info.selectionText || '';
    
    if (selectedText) {
      // 保存到本地存储
      chrome.storage.local.get(['todos'], (result) => {
        const todos = result.todos || [];
        const newTodo = {
          id: Date.now().toString(),
          title: selectedText,
          completed: false,
          createdAt: new Date().toISOString(),
          listId: 'default'
        };
        
        chrome.storage.local.set({
          todos: [...todos, newTodo]
        });
      });
    }
  }
}); 
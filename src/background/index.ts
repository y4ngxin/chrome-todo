// 后台服务脚本
let todoTabId: number | null = null;
const TODO_PAGE_URL = 'popup.html';

// 设置扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  openTodoPage();
});

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
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }
  
  // 处理打开待办事项页面的消息
  if (message.action === 'openTodoPage') {
    openTodoPage();
    sendResponse({ success: true });
    return true;
  }
});

// 监听标签页关闭事件
chrome.tabs.onRemoved.addListener((tabId) => {
  // 如果关闭的是待办事项页面，则重置页面ID
  if (tabId === todoTabId) {
    todoTabId = null;
  }
});

// 打开待办事项页面
function openTodoPage() {
  // 检查待办事项页面是否已经打开
  if (todoTabId !== null) {
    // 如果已经打开，则切换到该标签页并激活它
    chrome.tabs.get(todoTabId, (tab) => {
      if (chrome.runtime.lastError) {
        // 如果获取标签页失败（可能已关闭），则创建新的标签页
        createTodoTab();
      } else if (tab) {
        // 如果标签页存在，则激活它
        chrome.tabs.update(todoTabId as number, { active: true });
        if (tab.windowId) {
          chrome.windows.update(tab.windowId, { focused: true });
        }
      }
    });
  } else {
    // 如果没有打开，则创建新的标签页
    createTodoTab();
  }
}

// 创建待办事项标签页
function createTodoTab() {
  // 创建一个新窗口，大小为372x653
  chrome.windows.create({
    url: TODO_PAGE_URL,
    type: 'popup',
    width: 372,
    height: 653,
    focused: true
  }, (window) => {
    if (window && window.tabs && window.tabs.length > 0) {
      todoTabId = window.tabs[0].id || null;
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
          listId: 'default',
          isImportant: false,
          isMyDay: true
        };
        
        chrome.storage.local.set({
          todos: [...todos, newTodo]
        });
        
        // 如果待办事项页面已经打开，则通知它刷新数据
        if (todoTabId !== null) {
          chrome.tabs.sendMessage(todoTabId, { action: 'refreshTodos' });
        } else {
          // 打开待办事项页面
          openTodoPage();
        }
      });
    }
  }
}); 
// 选项页面脚本
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const startupCheckbox = document.getElementById('startup');
  const newTabCheckbox = document.getElementById('new-tab');
  const exportButton = document.getElementById('export-data');
  const importButton = document.getElementById('import-data');
  const clearButton = document.getElementById('clear-data');
  
  // 从存储中加载设置
  chrome.storage.sync.get(['startup', 'newTab'], (result) => {
    startupCheckbox.checked = result.startup !== false; // 默认为true
    newTabCheckbox.checked = result.newTab !== false; // 默认为true
  });
  
  // 保存设置
  startupCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ startup: startupCheckbox.checked });
  });
  
  newTabCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ newTab: newTabCheckbox.checked });
  });
  
  // 导出数据
  exportButton.addEventListener('click', () => {
    chrome.storage.local.get(['todos', 'lists'], (result) => {
      const data = JSON.stringify(result, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `chrometodo_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    });
  });
  
  // 导入数据
  importButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      
      if (file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            // 使用JavaScript方式获取结果
            const result = event.target.result;
            const data = JSON.parse(result);
            
            // 验证数据格式
            if (data.todos && data.lists) {
              chrome.storage.local.set(data, () => {
                alert('数据导入成功');
              });
            } else {
              alert('无效的数据格式');
            }
          } catch (error) {
            alert('导入失败: ' + error.message);
          }
        };
        
        reader.readAsText(file);
      }
    });
    
    input.click();
  });
  
  // 清除数据
  clearButton.addEventListener('click', () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      chrome.storage.local.clear(() => {
        alert('所有数据已清除');
      });
    }
  });
}); 
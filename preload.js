const { contextBridge } = require('electron');

// در این فایل می‌توان API های امنی برای ارتباط renderer و main تعریف کرد
contextBridge.exposeInMainWorld('electron', {
  // API های مورد نیاز اینجا تعریف می‌شود
});

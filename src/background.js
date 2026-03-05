chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['smartIDSettings'], (result) => {
    if (!result.smartIDSettings) {
      chrome.storage.sync.set({
        smartIDSettings: {
          enabled: true,
          pattern: '2-4-5-rest',
          whitelist: [],
          useWhitelist: false,
          smartDetect: true,
          customPatterns: [
            { name: 'CPR / FBR Reference', value: '2-4-5-rest' },
            { name: 'Phone Number (3-3-4)', value: '3-3-4' },
            { name: 'Credit Card (4-4-4-4)', value: '4-4-4-4' },
            { name: 'CNIC Pakistan (5-7-1)', value: '5-7-1' }
          ]
        }
      });
    }
  });
});

export type Locale = 'en' | 'zh';

export const translations = {
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.phone': 'Phone Number',
    'auth.pin': 'PIN',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginForeman': 'Foreman Login',
    'auth.loginManager': 'Manager Login',
    'auth.changePin': 'Change PIN',
    
    // Common
    'common.save': 'Save',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Report Form
    'report.site': 'Project Site',
    'report.trade': 'Trade',
    'report.workFront': 'Work Front',
    'report.workSource': 'Work Source',
    'report.directLabour': 'Direct Labour',
    'report.subcontractor': 'Subcontractor',
    'report.resources': 'Resources',
    'report.labor': 'Labor',
    'report.plant': 'Plant',
    'report.progress': 'Progress',
    'report.photos': 'Photos',
    'report.weather': 'Weather',
    'report.constraints': 'Constraints',
    'report.safety': 'Safety Incident',
    'report.remarks': 'Remarks',
    'report.noWork': 'No Work Today',
    'report.noWorkReason': 'Reason',
    
    // Shifts
    'shift.standard': 'Standard',
    'shift.overtime': 'Overtime',
    'shift.overnight': 'Overnight',
    
    // Dashboard
    'dashboard.title': 'Productivity Dashboard',
    'dashboard.table': 'Table View',
    'dashboard.chart': 'Chart View',
    'dashboard.targets': 'Targets',
    'dashboard.duplicates': 'Duplicates',
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.users': 'User Management',
    'admin.reference': 'Reference Data',
    'admin.projects': 'Projects & Sites',
    'admin.audit': 'Audit Log',
    
    // Export
    'export.title': 'Export Data',
    'export.detail': 'Detail',
    'export.summary': 'Summary',
    'export.download': 'Download CSV',
  },
  zh: {
    // Auth
    'auth.login': '登入',
    'auth.phone': '電話號碼',
    'auth.pin': '密碼',
    'auth.email': '電郵',
    'auth.password': '密碼',
    'auth.loginForeman': '管工登入',
    'auth.loginManager': '經理登入',
    'auth.changePin': '更改密碼',
    
    // Common
    'common.save': '儲存',
    'common.submit': '提交',
    'common.cancel': '取消',
    'common.confirm': '確認',
    'common.delete': '刪除',
    'common.edit': '編輯',
    'common.back': '返回',
    'common.next': '下一步',
    'common.loading': '載入中...',
    'common.error': '錯誤',
    'common.success': '成功',
    
    // Report Form
    'report.site': '地盤',
    'report.trade': '工種',
    'report.workFront': '工作front',
    'report.workSource': '工作來源',
    'report.directLabour': '直接勞工',
    'report.subcontractor': '外判商',
    'report.resources': '資源',
    'report.labor': '人力',
    'report.plant': '機械',
    'report.progress': '進度',
    'report.photos': '相片',
    'report.weather': '天氣',
    'report.constraints': '限制',
    'report.safety': '安全意外',
    'report.remarks': '備註',
    'report.noWork': '今日無工作',
    'report.noWorkReason': '原因',
    
    // Shifts
    'shift.standard': '標準班',
    'shift.overtime': '加班',
    'shift.overnight': '通宵班',
    
    // Dashboard
    'dashboard.title': '生產力儀表板',
    'dashboard.table': '表格檢視',
    'dashboard.chart': '圖表檢視',
    'dashboard.targets': '目標',
    'dashboard.duplicates': '重複報告',
    
    // Admin
    'admin.title': '管理面板',
    'admin.users': '用戶管理',
    'admin.reference': '參考資料',
    'admin.projects': '項目與地盤',
    'admin.audit': '審核日誌',
    
    // Export
    'export.title': '匯出資料',
    'export.detail': '詳細',
    'export.summary': '摘要',
    'export.download': '下載 CSV',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem('siteflow-locale', locale);
}

export function getLocale(): Locale {
  const stored = localStorage.getItem('siteflow-locale') as Locale;
  return stored || 'en';
}

export function t(key: TranslationKey): string {
  return translations[currentLocale][key] || translations.en[key] || key;
}
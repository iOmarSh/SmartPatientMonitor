"use client";

export type Language = "en" | "ar";

export const translations = {
  en: {
    // App
    appName: "Safe House",
    appSubtitle: "Monitoring System",
    dashboardTitle: "Safe House Monitoring Dashboard",
    
    // Navigation
    overview: "Overview",
    history: "History",
    settings: "Settings",
    diagnostics: "Diagnostics",
    commandCenter: "Command Center",
    
    // Connection Status
    online: "Online",
    offline: "Offline",
    updated: "Updated",
    never: "Never",
    justNow: "Just now",
    secondsAgo: "s ago",
    minutesAgo: "m ago",
    systemHealth: "System Health",
    
    // System State
    systemState: "System State",
    stateNormal: "NORMAL",
    stateWarning: "WARNING",
    stateDanger: "DANGER",
    stateEmergency: "EMERGENCY",
    
    // Stat Cards
    bodyTemperature: "Body Temperature",
    lightLevel: "Light Level",
    distance: "Distance",
    alert: "Alert",
    min: "Min",
    max: "Max",
    
    // Temperature Chart
    temperatureTrend: "Temperature Trend",
    last30Seconds: "Last 30 seconds of readings",
    alertThreshold: "Alert",
    
    // Emergency Alert
    emergencyActivated: "EMERGENCY BUTTON ACTIVATED",
    highTempAlert: "HIGH TEMPERATURE ALERT",
    dangerState: "DANGER STATE DETECTED",
    warningState: "WARNING STATE",
    
    // History Panel
    averageTemperature: "Average Temperature",
    minimum: "Minimum",
    maximum: "Maximum",
    readingHistory: "Reading History",
    recentReadings: "Recent temperature readings from the current session",
    time: "Time",
    temperature: "Temperature",
    status: "Status",
    high: "High",
    elevated: "Elevated",
    low: "Low",
    normal: "Normal",
    noData: "No data recorded yet. Waiting for readings...",
    
    // Event Log
    eventLog: "Event Log",
    eventLogDescription: "System events and state changes",
    downloadCsv: "Download CSV",
    event: "Event",
    timestamp: "Timestamp",
    details: "Details",
    noEvents: "No events recorded yet",
    
    // Command Center
    commandCenterTitle: "Command Center",
    commandCenterDescription: "Remote control panel for device management",
    clearAlarms: "Clear Alarms",
    toggleBuzzer: "Toggle Buzzer",
    pingDevice: "Ping Device",
    buzzerOn: "Buzzer ON",
    buzzerOff: "Buzzer OFF",
    alarmCleared: "Alarms Cleared",
    devicePinged: "Device Pinged",
    muteAlerts: "Mute Alerts",
    unmuteAlerts: "Unmute Alerts",
    
    // RTOS Diagnostics
    rtosDiagnostics: "RTOS Diagnostics",
    rtosDescription: "Real-time operating system health metrics",
    stackHighWaterMark: "Stack High Water Mark",
    taskJitter: "Task Jitter",
    cpuUsage: "CPU Usage",
    freeHeap: "Free Heap",
    uptime: "Uptime",
    wifiRssi: "WiFi Signal (RSSI)",
    systemStable: "System Stable",
    memoryWarning: "Memory Warning",
    
    // Connection Health
    connectionHealth: "Connection Health",
    signalStrength: "Signal Strength",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    weak: "Weak",
    
    // Settings Panel
    connectionSettings: "Connection Settings",
    connectionDescription: "Configure the ESP32 device connection. Leave empty for demo mode.",
    esp32Endpoint: "ESP32 Data Endpoint URL",
    esp32Placeholder: "http://192.168.1.100/data",
    esp32Helper: "Enter the IP address and endpoint of your ESP32 device",
    saveConnection: "Save Connection",
    alertThresholds: "Alert Thresholds",
    thresholdDescription: "Set the temperature thresholds for triggering alerts.",
    tempAlertThreshold: "Temperature Alert Threshold",
    warningThreshold: "Warning Threshold",
    dangerThreshold: "Danger Threshold",
    distanceWarning: "Distance Warning Threshold",
    notificationSettings: "Notification Settings",
    enableAudioAlerts: "Enable Audio Alerts",
    audioDescription: "Play sound when emergency conditions are detected",
    autoRefresh: "Auto-refresh Data",
    autoRefreshDescription: "Automatically poll for new data every second",
    about: "About",
    aboutDescription: "A real-time IoT monitoring system designed for healthcare and safety environments. Connects to ESP32-based sensors to track vital signs and environmental conditions.",
    
    // Footer
    footerText: "Safe House Monitoring System",
    version: "v2.0.0",
    
    // Theme & Language
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    english: "English",
    arabic: "Arabic",
  },
  ar: {
    // App
    appName: "البيت الآمن",
    appSubtitle: "نظام المراقبة",
    dashboardTitle: "لوحة مراقبة البيت الآمن",
    
    // Navigation
    overview: "نظرة عامة",
    history: "السجل",
    settings: "الإعدادات",
    diagnostics: "التشخيصات",
    commandCenter: "مركز التحكم",
    
    // Connection Status
    online: "متصل",
    offline: "غير متصل",
    updated: "آخر تحديث",
    never: "أبداً",
    justNow: "الآن",
    secondsAgo: " ثانية",
    minutesAgo: " دقيقة",
    systemHealth: "حالة النظام",
    
    // System State
    systemState: "حالة النظام",
    stateNormal: "طبيعي",
    stateWarning: "تحذير",
    stateDanger: "خطر",
    stateEmergency: "طوارئ",
    
    // Stat Cards
    bodyTemperature: "درجة حرارة الجسم",
    lightLevel: "مستوى الإضاءة",
    distance: "المسافة",
    alert: "تنبيه",
    min: "أدنى",
    max: "أعلى",
    
    // Temperature Chart
    temperatureTrend: "اتجاه درجة الحرارة",
    last30Seconds: "آخر 30 ثانية من القراءات",
    alertThreshold: "حد التنبيه",
    
    // Emergency Alert
    emergencyActivated: "تم تفعيل زر الطوارئ",
    highTempAlert: "تنبيه ارتفاع درجة الحرارة",
    dangerState: "تم اكتشاف حالة خطر",
    warningState: "حالة تحذير",
    
    // History Panel
    averageTemperature: "متوسط درجة الحرارة",
    minimum: "الحد الأدنى",
    maximum: "الحد الأقصى",
    readingHistory: "سجل القراءات",
    recentReadings: "قراءات درجة الحرارة الأخيرة من الجلسة الحالية",
    time: "الوقت",
    temperature: "درجة الحرارة",
    status: "الحالة",
    high: "مرتفع",
    elevated: "مرتفع قليلاً",
    low: "منخفض",
    normal: "طبيعي",
    noData: "لا توجد بيانات مسجلة بعد. في انتظار القراءات...",
    
    // Event Log
    eventLog: "سجل الأحداث",
    eventLogDescription: "أحداث النظام وتغييرات الحالة",
    downloadCsv: "تحميل CSV",
    event: "الحدث",
    timestamp: "الوقت",
    details: "التفاصيل",
    noEvents: "لا توجد أحداث مسجلة بعد",
    
    // Command Center
    commandCenterTitle: "مركز التحكم",
    commandCenterDescription: "لوحة التحكم عن بعد لإدارة الجهاز",
    clearAlarms: "مسح الإنذارات",
    toggleBuzzer: "تبديل الجرس",
    pingDevice: "اختبار الجهاز",
    buzzerOn: "الجرس مفعل",
    buzzerOff: "الجرس متوقف",
    alarmCleared: "تم مسح الإنذارات",
    devicePinged: "تم اختبار الجهاز",
    muteAlerts: "كتم التنبيهات",
    unmuteAlerts: "إلغاء كتم التنبيهات",
    
    // RTOS Diagnostics
    rtosDiagnostics: "تشخيصات RTOS",
    rtosDescription: "مقاييس صحة نظام التشغيل في الوقت الحقيقي",
    stackHighWaterMark: "علامة المكدس العالية",
    taskJitter: "اهتزاز المهمة",
    cpuUsage: "استخدام المعالج",
    freeHeap: "الذاكرة المتاحة",
    uptime: "وقت التشغيل",
    wifiRssi: "إشارة WiFi",
    systemStable: "النظام مستقر",
    memoryWarning: "تحذير الذاكرة",
    
    // Connection Health
    connectionHealth: "صحة الاتصال",
    signalStrength: "قوة الإشارة",
    excellent: "ممتاز",
    good: "جيد",
    fair: "مقبول",
    weak: "ضعيف",
    
    // Settings Panel
    connectionSettings: "إعدادات الاتصال",
    connectionDescription: "قم بتكوين اتصال جهاز ESP32. اتركه فارغاً للوضع التجريبي.",
    esp32Endpoint: "عنوان نقطة نهاية ESP32",
    esp32Placeholder: "http://192.168.1.100/data",
    esp32Helper: "أدخل عنوان IP ونقطة نهاية جهاز ESP32 الخاص بك",
    saveConnection: "حفظ الاتصال",
    alertThresholds: "حدود التنبيه",
    thresholdDescription: "حدد عتبات درجة الحرارة لتفعيل التنبيهات.",
    tempAlertThreshold: "حد تنبيه درجة الحرارة",
    warningThreshold: "حد التحذير",
    dangerThreshold: "حد الخطر",
    distanceWarning: "حد تحذير المسافة",
    notificationSettings: "إعدادات الإشعارات",
    enableAudioAlerts: "تفعيل التنبيهات الصوتية",
    audioDescription: "تشغيل صوت عند اكتشاف حالات الطوارئ",
    autoRefresh: "تحديث تلقائي للبيانات",
    autoRefreshDescription: "استطلاع تلقائي للبيانات الجديدة كل ثانية",
    about: "حول",
    aboutDescription: "نظام مراقبة عبر إنترنت الأشياء في الوقت الفعلي مصمم لبيئات الرعاية الصحية والسلامة. يتصل بأجهزة استشعار ESP32 لتتبع العلامات الحيوية والظروف البيئية.",
    
    // Footer
    footerText: "نظام مراقبة البيت الآمن",
    version: "الإصدار 2.0.0",
    
    // Theme & Language
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key];
}

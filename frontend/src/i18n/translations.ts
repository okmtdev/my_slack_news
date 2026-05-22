export const translations = {
  ja: {
    // nav
    navLogs: "ログ",

    // bot list
    newBot: "+ 新規作成",
    botsCount: (n: number) => `${n} bot${n !== 1 ? "s" : ""}`,
    emptyTitle: "Bot がまだありません",
    emptyAction: "最初の Bot を作成する",

    // bot card
    labelKeywords: "キーワード",
    labelSchedule: "スケジュール",
    labelFeeds: "フィード",
    labelLookback: "取得期間",
    btnTestRun: "テスト実行",
    btnRunning: "実行中...",
    btnEdit: "編集",
    confirmDelete: (name: string) => `「${name}」を削除しますか？`,
    toastDeleted: "Bot を削除しました",
    toastRunSuccess: (msg: string) => msg,

    // form — page
    pageTitleCreate: "新規 Bot 作成",
    pageTitleEdit: "Bot を編集",
    sectionBasic: "基本情報",
    sectionGemini: "Gemini API",
    sectionSlack: "Slack",
    sectionSchedule: "スケジュール",

    // form — labels
    labelBotName: "Bot 名",
    labelKeywordsField: "キーワード",
    labelRssFeeds: "RSSフィード",
    labelLookbackDays: "過去何日分を取得",
    lookbackHint: "週次実行なら 7 を推奨",
    labelGeminiKey: "API キー",
    labelGeminiModel: "モデル",
    labelSlackWebhook: "Incoming Webhook URL",
    labelTimezone: "タイムゾーン",
    labelScheduleEntries: "投稿スケジュール",
    labelTime: "時刻",

    // form — placeholders
    phBotName: "例: AI ニュース Bot",
    phKeyword: "例: AI, LLM, 機械学習",
    phRssUrl: "https://example.com/feed.rss",
    phFeedName: "フィード名",
    phGeminiKey: "AIzaSy...",
    phWebhook: "https://hooks.slack.com/services/...",

    // form — actions
    addKeyword: "+ キーワードを追加",
    addFeed: "+ フィードを追加",
    addSchedule: "+ スケジュールを追加",
    removeSchedule: "削除",
    btnSave: "作成する",
    btnUpdate: "更新する",
    btnSaving: "保存中...",
    btnCancel: "キャンセル",

    // form — validation
    errBotName: "Bot名は必須です",
    errGeminiKey: "Gemini API キーは必須です",
    errWebhook: "Webhook URL は必須です",

    // form — toast
    toastCreated: "Bot を作成しました",
    toastUpdated: "Bot を更新しました",

    // logs
    pageLogsTitle: "実行ログ",
    allBots: "全ての Bot",
    colBot: "Bot",
    colStatus: "ステータス",
    colArticles: "記事数",
    colMessage: "メッセージ",
    colTime: "実行時刻",
    emptyLogs: "実行ログがありません",
  },

  en: {
    // nav
    navLogs: "Logs",

    // bot list
    newBot: "+ New Bot",
    botsCount: (n: number) => `${n} bot${n !== 1 ? "s" : ""}`,
    emptyTitle: "No bots yet",
    emptyAction: "Create your first bot",

    // bot card
    labelKeywords: "Keywords",
    labelSchedule: "Schedule",
    labelFeeds: "Feeds",
    labelLookback: "Lookback",
    btnTestRun: "Test Run",
    btnRunning: "Running...",
    btnEdit: "Edit",
    confirmDelete: (name: string) => `Delete "${name}"?`,
    toastDeleted: "Bot deleted",
    toastRunSuccess: (msg: string) => msg,

    // form — page
    pageTitleCreate: "New Bot",
    pageTitleEdit: "Edit Bot",
    sectionBasic: "Basic",
    sectionGemini: "Gemini API",
    sectionSlack: "Slack",
    sectionSchedule: "Schedule",

    // form — labels
    labelBotName: "Bot Name",
    labelKeywordsField: "Keywords",
    labelRssFeeds: "RSS Feeds",
    labelLookbackDays: "Lookback Days",
    lookbackHint: "Use 7 for weekly runs",
    labelGeminiKey: "API Key",
    labelGeminiModel: "Model",
    labelSlackWebhook: "Incoming Webhook URL",
    labelTimezone: "Timezone",
    labelScheduleEntries: "Post Schedule",
    labelTime: "Time",

    // form — placeholders
    phBotName: "e.g. AI News Bot",
    phKeyword: "e.g. AI, LLM, machine learning",
    phRssUrl: "https://example.com/feed.rss",
    phFeedName: "Feed name",
    phGeminiKey: "AIzaSy...",
    phWebhook: "https://hooks.slack.com/services/...",

    // form — actions
    addKeyword: "+ Add keyword",
    addFeed: "+ Add feed",
    addSchedule: "+ Add schedule",
    removeSchedule: "Remove",
    btnSave: "Create",
    btnUpdate: "Update",
    btnSaving: "Saving...",
    btnCancel: "Cancel",

    // form — validation
    errBotName: "Bot name is required",
    errGeminiKey: "Gemini API key is required",
    errWebhook: "Webhook URL is required",

    // form — toast
    toastCreated: "Bot created",
    toastUpdated: "Bot updated",

    // logs
    pageLogsTitle: "Execution Logs",
    allBots: "All Bots",
    colBot: "Bot",
    colStatus: "Status",
    colArticles: "Articles",
    colMessage: "Message",
    colTime: "Executed At",
    emptyLogs: "No execution logs",
  },
} as const;

export type Lang = keyof typeof translations;
export type Translations = typeof translations.ja;

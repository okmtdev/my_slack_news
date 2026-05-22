export type Lang = "ja" | "en";

export interface Translations {
  // nav
  navLogs: string;
  // bot list
  pageBotsTitle: string;
  pageBotsSubtitle: string;
  newBot: string;
  botsCount: (n: number) => string;
  emptyTitle: string;
  emptyAction: string;
  // bot card
  labelKeywords: string;
  labelSchedule: string;
  labelFeeds: string;
  labelLookback: string;
  btnTestRun: string;
  btnRunning: string;
  btnEdit: string;
  confirmDelete: (name: string) => string;
  toastDeleted: string;
  toastRunSuccess: (msg: string) => string;
  // form — page
  pageTitleCreate: string;
  pageTitleEdit: string;
  sectionBasic: string;
  sectionGemini: string;
  sectionSlack: string;
  sectionSchedule: string;
  // form — labels
  labelBotName: string;
  labelKeywordsField: string;
  labelRssFeeds: string;
  labelLookbackDays: string;
  lookbackHint: string;
  labelGeminiKey: string;
  labelGeminiModel: string;
  labelSlackWebhook: string;
  labelTimezone: string;
  labelScheduleEntries: string;
  labelTime: string;
  // form — placeholders
  phBotName: string;
  phKeyword: string;
  phRssUrl: string;
  phFeedName: string;
  phGeminiKey: string;
  phWebhook: string;
  // form — actions
  addKeyword: string;
  addFeed: string;
  addSchedule: string;
  removeSchedule: string;
  btnSave: string;
  btnUpdate: string;
  btnSaving: string;
  btnCancel: string;
  // form — validation
  errBotName: string;
  errGeminiKey: string;
  errWebhook: string;
  // form — toast
  toastCreated: string;
  toastUpdated: string;
  // logs
  pageLogsTitle: string;
  allBots: string;
  colBot: string;
  colStatus: string;
  colArticles: string;
  colMessage: string;
  colTime: string;
  emptyLogs: string;
}

export const translations: Record<Lang, Translations> = {
  ja: {
    navLogs: "ログ",
    pageBotsTitle: "ニュースBot",
    pageBotsSubtitle: "RSSとAIで、ニュースを自動でSlackへ届けます",
    newBot: "+ 新規作成",
    botsCount: (n) => `${n}`,
    emptyTitle: "Bot がまだありません",
    emptyAction: "最初の Bot を作成する",
    labelKeywords: "キーワード",
    labelSchedule: "スケジュール",
    labelFeeds: "フィード",
    labelLookback: "取得期間",
    btnTestRun: "テスト実行",
    btnRunning: "実行中...",
    btnEdit: "編集",
    confirmDelete: (name) => `「${name}」を削除しますか？`,
    toastDeleted: "Bot を削除しました",
    toastRunSuccess: (msg) => msg,
    pageTitleCreate: "新規 Bot 作成",
    pageTitleEdit: "Bot を編集",
    sectionBasic: "基本情報",
    sectionGemini: "Gemini API",
    sectionSlack: "Slack",
    sectionSchedule: "スケジュール",
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
    phBotName: "例: AI ニュース Bot",
    phKeyword: "例: AI, LLM, 機械学習",
    phRssUrl: "https://example.com/feed.rss",
    phFeedName: "フィード名",
    phGeminiKey: "AIzaSy...",
    phWebhook: "https://hooks.slack.com/services/...",
    addKeyword: "+ キーワードを追加",
    addFeed: "+ フィードを追加",
    addSchedule: "+ スケジュールを追加",
    removeSchedule: "削除",
    btnSave: "作成する",
    btnUpdate: "更新する",
    btnSaving: "保存中...",
    btnCancel: "キャンセル",
    errBotName: "Bot名は必須です",
    errGeminiKey: "Gemini API キーは必須です",
    errWebhook: "Webhook URL は必須です",
    toastCreated: "Bot を作成しました",
    toastUpdated: "Bot を更新しました",
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
    navLogs: "Logs",
    pageBotsTitle: "News Bots",
    pageBotsSubtitle: "Fetch, summarize, and deliver news to Slack automatically",
    newBot: "+ New Bot",
    botsCount: (n) => `${n}`,
    emptyTitle: "No bots yet",
    emptyAction: "Create your first bot",
    labelKeywords: "Keywords",
    labelSchedule: "Schedule",
    labelFeeds: "Feeds",
    labelLookback: "Lookback",
    btnTestRun: "Test Run",
    btnRunning: "Running...",
    btnEdit: "Edit",
    confirmDelete: (name) => `Delete "${name}"?`,
    toastDeleted: "Bot deleted",
    toastRunSuccess: (msg) => msg,
    pageTitleCreate: "New Bot",
    pageTitleEdit: "Edit Bot",
    sectionBasic: "Basic",
    sectionGemini: "Gemini API",
    sectionSlack: "Slack",
    sectionSchedule: "Schedule",
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
    phBotName: "e.g. AI News Bot",
    phKeyword: "e.g. AI, LLM, machine learning",
    phRssUrl: "https://example.com/feed.rss",
    phFeedName: "Feed name",
    phGeminiKey: "AIzaSy...",
    phWebhook: "https://hooks.slack.com/services/...",
    addKeyword: "+ Add keyword",
    addFeed: "+ Add feed",
    addSchedule: "+ Add schedule",
    removeSchedule: "Remove",
    btnSave: "Create",
    btnUpdate: "Update",
    btnSaving: "Saving...",
    btnCancel: "Cancel",
    errBotName: "Bot name is required",
    errGeminiKey: "Gemini API key is required",
    errWebhook: "Webhook URL is required",
    toastCreated: "Bot created",
    toastUpdated: "Bot updated",
    pageLogsTitle: "Execution Logs",
    allBots: "All Bots",
    colBot: "Bot",
    colStatus: "Status",
    colArticles: "Articles",
    colMessage: "Message",
    colTime: "Executed At",
    emptyLogs: "No execution logs",
  },
};

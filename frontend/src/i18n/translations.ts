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
  statusActive: string;
  statusInactive: string;
  labelKeywords: string;
  labelSchedule: string;
  labelFeeds: string;
  labelLookback: string;
  btnTestRun: string;
  btnSendTest: string;
  btnRunning: string;
  btnSending: string;
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
  keywordsHint: string;
  labelRssFeeds: string;
  labelLookbackDays: string;
  lookbackHint: string;
  labelGeminiKey: string;
  labelGeminiModel: string;
  labelEnableImage: string;
  labelImageModel: string;
  imageHint: string;
  btnShowGeminiModels: string;
  modelsModalTitle: string;
  modelsModalEnterKey: string;
  modelsModalFetching: string;
  modelsModalEmpty: string;
  modelsModalSupports: string;
  modelsModalFilterText: string;
  modelsModalFilterImage: string;
  modelsModalFilterAll: string;
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
  colType: string;
  colStatus: string;
  colArticles: string;
  colSteps: string;
  colMessage: string;
  colTime: string;
  emptyLogs: string;
  runTypeFullRun: string;
  runTypeTestMessage: string;
  modalTestRunTitle: string;
  modalTestRunSubtitle: string;
  optionSendTestTitle: string;
  optionSendTestDesc: string;
  optionFullRunTitle: string;
  optionFullRunDesc: string;
  stepStatusSuccess: string;
  stepStatusError: string;
  stepStatusSkipped: string;
  durationMs: (ms: number) => string;
}

export const translations: Record<Lang, Translations> = {
  ja: {
    navLogs: "ログ",
    pageBotsTitle: "ニュース",
    pageBotsSubtitle: "RSSとAIで、ニュースを自動でSlackへ届けます",
    newBot: "+ 新規作成",
    botsCount: (n) => `${n}`,
    emptyTitle: "Bot がまだありません",
    emptyAction: "最初の Bot を作成する",
    statusActive: "有効",
    statusInactive: "無効",
    labelKeywords: "キーワード",
    labelSchedule: "スケジュール",
    labelFeeds: "フィード",
    labelLookback: "取得期間",
    btnTestRun: "テスト実行",
    btnSendTest: "送信テスト",
    btnRunning: "実行中...",
    btnSending: "送信中...",
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
    keywordsHint: "未設定の場合は、フィードの最新記事をすべて取得します",
    labelRssFeeds: "RSSフィード",
    labelLookbackDays: "過去何日分を取得",
    lookbackHint: "週次実行なら 7 を推奨",
    labelGeminiKey: "API キー",
    labelGeminiModel: "テキスト要約モデル",
    labelEnableImage: "画像も投稿する",
    labelImageModel: "画像生成モデル",
    imageHint: "Geminiで生成した画像をサマリーと一緒にSlackへ投稿します。サーバーの PUBLIC_BASE_URL（HTTPS の公開URL）が設定されている必要があります。",
    btnShowGeminiModels: "利用可能なモデルを確認",
    modelsModalTitle: "利用可能な Gemini モデル",
    modelsModalEnterKey: "API キーを入力してから開いてください",
    modelsModalFetching: "取得中...",
    modelsModalEmpty: "モデルが見つかりませんでした",
    modelsModalSupports: "対応操作",
    modelsModalFilterText: "テキスト",
    modelsModalFilterImage: "画像",
    modelsModalFilterAll: "すべて",
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
    colType: "種類",
    colStatus: "ステータス",
    colArticles: "記事数",
    colSteps: "工程",
    colMessage: "メッセージ",
    colTime: "実行時刻",
    emptyLogs: "実行ログがありません",
    runTypeFullRun: "本実行",
    runTypeTestMessage: "送信テスト",
    modalTestRunTitle: "テスト実行",
    modalTestRunSubtitle: "実行する内容を選んでください",
    optionSendTestTitle: "送信テスト",
    optionSendTestDesc: "固定のテストメッセージをSlackに送信して、Webhookが正しく動作するか確認します。記事の取得や要約は行いません。",
    optionFullRunTitle: "本実行",
    optionFullRunDesc: "RSSから記事を取得 → Geminiで要約 → Slackへ投稿します。スケジュール実行と同じ動作です。",
    stepStatusSuccess: "成功",
    stepStatusError: "失敗",
    stepStatusSkipped: "スキップ",
    durationMs: (ms) => `${ms}ms`,
  },

  en: {
    navLogs: "Logs",
    pageBotsTitle: "News Bots",
    pageBotsSubtitle: "Fetch, summarize, and deliver news to Slack automatically",
    newBot: "+ New Bot",
    botsCount: (n) => `${n}`,
    emptyTitle: "No bots yet",
    emptyAction: "Create your first bot",
    statusActive: "active",
    statusInactive: "inactive",
    labelKeywords: "Keywords",
    labelSchedule: "Schedule",
    labelFeeds: "Feeds",
    labelLookback: "Lookback",
    btnTestRun: "Test Run",
    btnSendTest: "Send Test",
    btnRunning: "Running...",
    btnSending: "Sending...",
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
    keywordsHint: "If empty, all latest articles from the feeds will be fetched",
    labelRssFeeds: "RSS Feeds",
    labelLookbackDays: "Lookback Days",
    lookbackHint: "Use 7 for weekly runs",
    labelGeminiKey: "API Key",
    labelGeminiModel: "Text Summarization Model",
    labelEnableImage: "Also post an image",
    labelImageModel: "Image Generation Model",
    imageHint: "Generates an image with Gemini and posts it alongside the summary. PUBLIC_BASE_URL (a public HTTPS URL of this server) must be configured.",
    btnShowGeminiModels: "Show available models",
    modelsModalTitle: "Available Gemini Models",
    modelsModalEnterKey: "Enter your API key first",
    modelsModalFetching: "Fetching...",
    modelsModalEmpty: "No models found",
    modelsModalSupports: "Supports",
    modelsModalFilterText: "Text",
    modelsModalFilterImage: "Image",
    modelsModalFilterAll: "All",
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
    colType: "Type",
    colStatus: "Status",
    colArticles: "Articles",
    colSteps: "Steps",
    colMessage: "Message",
    colTime: "Executed At",
    emptyLogs: "No execution logs",
    runTypeFullRun: "Full Run",
    runTypeTestMessage: "Send Test",
    modalTestRunTitle: "Test Run",
    modalTestRunSubtitle: "Choose what to run",
    optionSendTestTitle: "Send Test",
    optionSendTestDesc: "Sends a fixed test message to Slack to verify the webhook is working. No fetching or summarizing.",
    optionFullRunTitle: "Full Run",
    optionFullRunDesc: "Fetches articles from RSS → summarizes with Gemini → posts to Slack. Same as the scheduled run.",
    stepStatusSuccess: "Success",
    stepStatusError: "Failed",
    stepStatusSkipped: "Skipped",
    durationMs: (ms) => `${ms}ms`,
  },
};

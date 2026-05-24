export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface RSSFeed {
  url: string;
  name: string;
}

export interface ScheduleEntry {
  days: Day[];
  time: string;
}

export interface BotSchedule {
  timezone: string;
  entries: ScheduleEntry[];
}

export interface Bot {
  id: string;
  name: string;
  enabled: boolean;
  keywords: string[];
  rss_feeds: RSSFeed[];
  gemini_api_key: string;
  gemini_model: string;
  enable_image: boolean;
  gemini_image_model: string;
  slack_webhook_url: string;
  schedule: BotSchedule;
  lookback_days: number;
  created_at: string;
  updated_at: string;
}

export type RunType = "full_run" | "test_message";
export type StepStatus = "success" | "error" | "skipped";

export interface LogStep {
  name: string;
  label: string;
  status: StepStatus;
  message: string;
  duration_ms: number;
}

export interface ExecutionLog {
  id: string;
  bot_id: string;
  bot_name: string;
  run_type: RunType;
  status: "success" | "error";
  message: string;
  articles_count: number;
  steps: LogStep[];
  executed_at: string;
}

export interface RunResult {
  success: boolean;
  message: string;
  articles_count: number;
  steps: LogStep[];
}

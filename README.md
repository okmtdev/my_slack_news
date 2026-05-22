# Slack News Bot

特定のキーワードに関する最新ニュースをRSSフィードから取得し、Gemini APIで要約してSlackに投稿するWebサービスです。

## 機能

- 複数のニュースBotを管理（CRUD）
- RSSフィード（複数）からキーワードに一致する記事を自動収集
- Gemini API（`gemini-1.5-flash` 等）を使って日本語要約を生成
- Slack Incoming Webhookで指定チャンネルに自動投稿
- 曜日 × 時刻で柔軟なスケジュール設定（複数パターン可）
- 手動実行ボタン
- 実行ログの閲覧

## アーキテクチャ

```
お名前.com ドメイン
    │
    ▼ (A レコード)
Compute Engine (e2-micro)
    ├── Nginx (リバースプロキシ)
    ├── Backend (FastAPI + APScheduler) :8000
    │       └── /app/data/*.yaml  (YAML ファイルDB)
    └── Frontend (React + Vite → Nginx) :3000
```

## ローカル開発

### 前提

- Docker / Docker Compose
- Node.js 20+（フロントエンド開発時）
- Python 3.12+（バックエンド開発時）

### セットアップ

```bash
git clone https://github.com/your-org/my_slack_news.git
cd my_slack_news

cp .env.example .env
# .env を編集（任意）

mkdir -p data

# Docker Compose でローカル起動（ビルドから）
docker compose up --build
```

ブラウザで http://localhost:3000 を開いてください。

### バックエンドのみ（Python）

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

DATA_DIR=./data uvicorn app.main:app --reload
```

API ドキュメント: http://localhost:8000/docs

### フロントエンドのみ（Node.js）

```bash
cd frontend
npm install
npm run dev
```

---

## Slack Bot のセットアップ

1. [Slack API](https://api.slack.com/apps) にアクセスし、新しいアプリを作成
2. **Incoming Webhooks** を有効化
3. 投稿先のチャンネルに Webhook URL を追加
4. 生成された `https://hooks.slack.com/services/...` をコピー
5. Bot 作成画面の「Slack Incoming Webhook URL」欄に貼り付け

> 複数チャンネルに投稿する場合は、チャンネルごとに Webhook URL を作成し、それぞれ別の Bot として登録してください。

## Gemini API キーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) で API キーを発行
2. Bot 作成画面の「Gemini API キー」欄に入力

---

## インフラ構築手順（Terraform + GCP）

### 前提

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) がインストール済み
- GCP プロジェクトが作成済み

### 1. GCP 認証

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### 2. 必要な API を有効化

```bash
gcloud services enable compute.googleapis.com
```

### 3. SSH キーペアを生成

```bash
ssh-keygen -t ed25519 -C "deploy" -f ~/.ssh/slack_news_deploy
```

### 4. Terraform 変数ファイルを作成

```bash
cd terraform
```

`terraform.tfvars` を作成:

```hcl
project_id     = "your-gcp-project-id"
region         = "asia-northeast1"
zone           = "asia-northeast1-a"
ssh_public_key = "ssh-ed25519 AAAA..."  # ~/.ssh/slack_news_deploy.pub の内容
deploy_user    = "deploy"
```

### 5. Terraform を実行

```bash
terraform init
terraform plan
terraform apply
```

出力から **External IP** をメモします:

```
Outputs:
external_ip = "34.x.x.x"
```

### 6. ドメインの設定（お名前.com）

1. お名前.com の DNS 設定画面を開く
2. Aレコードを追加: `@` または `www` → `34.x.x.x`（Terraform の出力値）
3. DNS の伝播を待つ（数分〜数時間）

### 7. Nginx の設定をサーバーに反映

```bash
# サーバーに SSH でログイン
ssh deploy@34.x.x.x

# リポジトリをクローン
git clone https://github.com/your-org/my_slack_news.git /tmp/repo

# Nginx 設定をコピー
sudo cp /tmp/repo/nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### 8. アプリ用ディレクトリを準備

```bash
sudo mkdir -p /app/data
sudo chown deploy:deploy /app
mkdir -p /app/data
cp /tmp/repo/.env.example /app/.env
# /app/.env を編集して ADMIN_USERNAME / ADMIN_PASSWORD などを設定
```

### 9. SSL 証明書の取得（Let's Encrypt）

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

取得後、`/etc/nginx/nginx.conf` の HTTPS サーバーブロックのコメントを外し、
`your-domain.com` を自分のドメインに書き換えて再起動:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## GitHub Actions による CD 設定

### 1. GitHub Secrets の設定

リポジトリの **Settings → Secrets and variables → Actions** に以下を追加:

| Secret 名         | 内容                                        |
|------------------|---------------------------------------------|
| `DEPLOY_HOST`    | Compute Engine の外部 IP またはドメイン      |
| `DEPLOY_USER`    | SSH ユーザー名（例: `deploy`）              |
| `DEPLOY_SSH_KEY` | 秘密鍵の内容（`~/.ssh/slack_news_deploy`）  |

> `GITHUB_TOKEN` は GitHub が自動で提供するため設定不要です。

### 2. GitHub Container Registry の書き込み権限を確認

リポジトリの **Settings → Actions → General → Workflow permissions** で
「Read and write permissions」を選択してください。

### 3. デプロイの実行

`main` ブランチにプッシュすると自動デプロイが開始します。

```bash
git push origin main
```

GitHub の **Actions** タブから手動実行（`workflow_dispatch`）も可能です。

---

## リリース手順

```bash
# 1. 機能ブランチで開発・テスト
git checkout -b feature/your-feature

# 2. ローカルで動作確認
docker compose up --build

# 3. コミット & プッシュ
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

# 4. Pull Request を作成して main にマージ
#    → GitHub Actions が自動的にビルド & デプロイを実行

# 5. デプロイ確認
curl https://your-domain.com/health
```

---

## 設定項目（Bot）

| 項目                 | 説明                                              |
|---------------------|--------------------------------------------------|
| Bot 名               | 任意の名前                                        |
| キーワード            | 記事のタイトル・本文でフィルタリングする単語（複数可）|
| RSSフィード           | ニュースソースの RSS URL（複数可）                 |
| Gemini API キー      | Google AI Studio で発行した API キー              |
| Gemini モデル        | 使用するモデル（デフォルト: `gemini-1.5-flash`）   |
| 過去何日分を取得      | 実行時に遡る日数（デフォルト: 1日）               |
| Slack Webhook URL   | Slack の Incoming Webhook URL                    |
| タイムゾーン          | スケジュールのタイムゾーン（デフォルト: `Asia/Tokyo`）|
| スケジュール          | 曜日（複数可）× 時刻のセット（複数パターン可）     |
| 有効/無効            | Bot を一時停止できます                            |

---

## 環境変数（サーバー）

`.env.example` を参考に `/app/.env` を作成してください:

| 変数名              | デフォルト | 説明                                       |
|--------------------|-----------|-------------------------------------------|
| `ADMIN_USERNAME`   | （空）    | 管理画面の HTTP Basic Auth ユーザー名        |
| `ADMIN_PASSWORD`   | （空）    | 管理画面の HTTP Basic Auth パスワード        |
| `CORS_ORIGINS`     | `*`       | 許可する CORS オリジン（本番はドメイン指定推奨）|
| `GITHUB_REPOSITORY`| （空）    | `owner/repo` 形式（docker-compose で使用）  |
| `IMAGE_TAG`        | `latest`  | デプロイする Docker イメージタグ             |

---

## ディレクトリ構成

```
my_slack_news/
├── backend/               # Python FastAPI バックエンド
│   ├── app/
│   │   ├── main.py        # アプリエントリポイント + APScheduler
│   │   ├── models.py      # Pydantic モデル
│   │   ├── config.py      # 設定
│   │   ├── dependencies.py   # 認証
│   │   ├── routers/       # API ルーター（bots / logs）
│   │   ├── services/      # ビジネスロジック
│   │   │   ├── news_fetcher.py      # RSS 取得 + キーワードフィルタ
│   │   │   ├── gemini_summarizer.py # Gemini API 要約
│   │   │   ├── slack_poster.py      # Slack 投稿
│   │   │   ├── bot_runner.py        # Bot 実行オーケストレーション
│   │   │   └── scheduler.py         # APScheduler 管理
│   │   └── storage/       # YAML ストレージ
│   ├── data/              # YAML データファイル（Docker ボリュームでマウント）
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # React + TypeScript + Vite フロントエンド
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api/           # API クライアント
│   │   ├── components/    # ページ・UI コンポーネント
│   │   └── types/         # TypeScript 型定義
│   ├── package.json
│   └── Dockerfile
├── nginx/                 # Nginx 設定（Compute Engine 用）
├── terraform/             # GCP インフラ定義
├── .github/workflows/     # GitHub Actions CI/CD
├── docker-compose.yml     # コンテナ定義
└── .env.example           # 環境変数テンプレート
```

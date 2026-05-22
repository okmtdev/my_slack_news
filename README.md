# Slack News Bot

特定のキーワードに関する最新ニュースをRSSフィードから取得し、Gemini APIで要約してSlackに自動投稿するWebサービスです。

## 機能

- 複数のニュースBotを管理（作成・編集・削除）
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
    ├── Nginx（リバースプロキシ + SSL）
    ├── Backend (FastAPI + APScheduler) :8000
    │       └── /app/data/*.yaml  (YAML ファイルDB)
    └── Frontend (React + Vite → Nginx) :3000
```

---

## ローカル開発

### 方法 A: Docker Compose（推奨・最も手軽）

**前提:** Docker / Docker Compose がインストール済みであること

```bash
git clone https://github.com/your-org/my_slack_news.git
cd my_slack_news

# 環境変数ファイルを作成（任意。認証不要ならそのままでOK）
cp .env.example .env

# データ保存先ディレクトリを作成
mkdir -p data

# ビルド & 起動
docker compose up --build
```

ブラウザで **http://localhost:3000** を開くとUIが表示されます。

> API ドキュメント: http://localhost:8000/docs

停止するには `Ctrl+C` → `docker compose down`

---

### 方法 B: ネイティブ実行（ホットリロードあり・UI開発向け）

**前提:** Python 3.12+ / Node.js 20+ がインストール済みであること

#### ① バックエンドを起動

```bash
cd backend

# 仮想環境を作成して依存関係をインストール
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# データ保存先ディレクトリを作成
mkdir -p data

# 起動（:8000 でリッスン）
DATA_DIR=./data uvicorn app.main:app --reload
```

#### ② フロントエンドを起動（別ターミナル）

```bash
cd frontend

npm install
npm run dev
```

ブラウザで **http://localhost:5173** を開くとUIが表示されます（Viteが `/api` リクエストをバックエンドにプロキシします）。

> バックエンドのみ確認: http://localhost:8000/docs（Swagger UI）

---

### ローカル確認のポイント

| 操作 | 確認内容 |
|------|---------|
| `+新規作成` ボタン | Bot 作成フォームが開く |
| Bot を保存 | 一覧に表示され、スケジューラーに登録される |
| `今すぐ実行` | RSSを取得 → Gemini 要約 → Slack 投稿（API キーと Webhook URL が必要）|
| `実行ログ` タブ | 実行履歴が表示される |
| `/health` エンドポイント | `{"status":"ok","scheduler_running":true,...}` が返る |

---

## Slack Bot のセットアップ

1. [Slack API](https://api.slack.com/apps) で新しいアプリを作成
2. **Incoming Webhooks** を有効化
3. 投稿先チャンネルに Webhook URL を追加
4. 生成された `https://hooks.slack.com/services/...` をコピー
5. Bot 作成画面の「Slack Incoming Webhook URL」に貼り付け

> 複数チャンネルに投稿したい場合は、チャンネルごとに Webhook URL を作成し、それぞれ別の Bot として登録してください。

## Gemini API キーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) で API キーを発行
2. Bot 作成画面の「Gemini API キー」欄に入力

---

## インフラ構築手順（Terraform + GCP）

### 前提

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) インストール済み
- GCP プロジェクト作成済み

### 1. GCP 認証

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Compute Engine API を有効化

```bash
gcloud services enable compute.googleapis.com
```

### 3. SSH キーペアを生成

```bash
ssh-keygen -t ed25519 -C "deploy" -f ~/.ssh/slack_news_deploy
# 公開鍵を確認
cat ~/.ssh/slack_news_deploy.pub
```

### 4. Terraform 変数ファイルを作成

```bash
cd terraform
```

`terraform.tfvars` を新規作成:

```hcl
project_id     = "your-gcp-project-id"
region         = "asia-northeast1"
zone           = "asia-northeast1-a"
ssh_public_key = "ssh-ed25519 AAAA..."  # ↑ cat で確認した公開鍵の全内容
deploy_user    = "deploy"
```

### 5. インフラを構築

```bash
terraform init
terraform plan    # 差分確認
terraform apply   # 実行（yes で確定）
```

出力から **External IP** をメモします:

```
Outputs:
external_ip = "34.x.x.x"
ssh_command  = "ssh deploy@34.x.x.x"
```

> e2-micro は GCP 無料枠（1インスタンス/リージョン）に含まれます。

### 6. ドメイン設定（お名前.com）

1. お名前.com DNS 設定 → Aレコード追加
   - ホスト名: `@`（または `www`）
   - VALUE: `34.x.x.x`（Terraform の出力値）
2. DNS 伝播を待つ（最大数時間）

### 7. サーバー初期設定

インスタンスが起動するまで数分待ってから SSH でログイン:

```bash
ssh deploy@34.x.x.x
```

Nginx 設定を配置:

```bash
# リポジトリをサーバーにクローン
git clone https://github.com/your-org/my_slack_news.git /tmp/repo

# Nginx 設定をコピー
sudo cp /tmp/repo/nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl enable nginx && sudo systemctl restart nginx

# アプリ用ディレクトリ準備
sudo mkdir -p /app/data
sudo chown deploy:deploy /app
mkdir -p /app/data

# 環境変数ファイルを作成
cp /tmp/repo/.env.example /app/.env
nano /app/.env   # ADMIN_USERNAME / ADMIN_PASSWORD を設定（任意）

# リポジトリのクリーンアップ
rm -rf /tmp/repo
```

### 8. SSL 証明書の取得（Let's Encrypt）

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

取得後、`/etc/nginx/nginx.conf` の HTTPS ブロックのコメントを外して `your-domain.com` を書き換え:

```bash
sudo nano /etc/nginx/nginx.conf   # HTTPS ブロックのコメントを外してドメインを設定
sudo nginx -t && sudo systemctl reload nginx
```

---

## GitHub Actions CD 設定

### 1. GHCR への書き込み権限を有効化

リポジトリ **Settings → Actions → General → Workflow permissions**
→ **Read and write permissions** を選択して保存

### 2. Secrets を登録

リポジトリ **Settings → Secrets and variables → Actions → New repository secret**:

| Secret 名         | 値                                         |
|------------------|---------------------------------------------|
| `DEPLOY_HOST`    | Compute Engine の外部 IP またはドメイン名   |
| `DEPLOY_USER`    | SSH ユーザー名（例: `deploy`）              |
| `DEPLOY_SSH_KEY` | 秘密鍵の全内容（`~/.ssh/slack_news_deploy`）|

> `GITHUB_TOKEN` は GitHub が自動で提供するため設定不要です。

### 3. デプロイフロー確認

```
git push origin main
    │
    ▼ GitHub Actions (.github/workflows/deploy.yml)
    ├── Docker イメージ (backend / frontend) をビルド
    ├── ghcr.io に Push（タグ: git SHA + latest）
    └── SSH でサーバーに接続
            ├── docker compose pull（最新イメージを取得）
            ├── docker compose up -d（再起動）
            └── /health でヘルスチェック
```

---

## リリース手順

```bash
# 1. 機能ブランチを作成
git checkout -b feature/your-feature

# 2. 実装・修正

# 3. ローカルで動作確認
docker compose up --build
# または
cd backend && uvicorn app.main:app --reload &
cd frontend && npm run dev

# 4. コミット & プッシュ
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

# 5. GitHub で Pull Request を作成 → main にマージ
#    → GitHub Actions が自動でビルド & デプロイ

# 6. 本番確認
curl https://your-domain.com/health
# → {"status":"ok","scheduler_running":true,...}
```

### ロールバック手順

デプロイ後に問題が発生した場合:

```bash
# サーバーにSSHでログイン
ssh deploy@your-domain.com

cd /app

# 一つ前のイメージタグを指定して起動
IMAGE_TAG=<前のgit-SHA> docker compose up -d
```

---

## 設定項目（Bot）

| 項目                 | 説明                                               |
|---------------------|---------------------------------------------------|
| Bot 名               | 任意の名前                                         |
| キーワード            | 記事のタイトル・本文でフィルタリングする単語（複数可）|
| RSSフィード           | ニュースソースの RSS URL（複数可）                  |
| Gemini API キー      | Google AI Studio で発行した API キー               |
| Gemini モデル        | 使用するモデル（デフォルト: `gemini-1.5-flash`）    |
| 過去何日分を取得      | 実行時に遡る日数（デフォルト: 1日、週次なら 7 推奨）|
| Slack Webhook URL   | Slack の Incoming Webhook URL                     |
| タイムゾーン          | スケジュールのタイムゾーン（デフォルト: `Asia/Tokyo`）|
| スケジュール          | 曜日（複数可）× 時刻のセット（複数パターン可）      |
| 有効/無効            | チェックを外すと一時停止                            |

---

## 環境変数

`.env.example` を参考に `.env`（ローカル）または `/app/.env`（本番）を作成:

| 変数名               | デフォルト | 説明                                        |
|--------------------|-----------|---------------------------------------------|
| `ADMIN_USERNAME`   | （空）    | HTTP Basic Auth ユーザー名（空なら認証なし） |
| `ADMIN_PASSWORD`   | （空）    | HTTP Basic Auth パスワード                  |
| `CORS_ORIGINS`     | `*`       | 許可する CORS オリジン（本番はドメインを指定）|
| `GITHUB_REPOSITORY`| （空）    | `owner/repo` 形式（docker-compose で使用）  |
| `IMAGE_TAG`        | `latest`  | デプロイする Docker イメージタグ             |

---

## ディレクトリ構成

```
my_slack_news/
├── backend/               # Python FastAPI バックエンド
│   ├── app/
│   │   ├── main.py        # エントリポイント + APScheduler 起動
│   │   ├── models.py      # Pydantic モデル
│   │   ├── config.py      # 設定（環境変数）
│   │   ├── dependencies.py   # HTTP Basic Auth
│   │   ├── routers/       # API ルーター
│   │   │   ├── bots.py    # Bot CRUD + 実行
│   │   │   └── logs.py    # 実行ログ取得
│   │   ├── services/      # ビジネスロジック
│   │   │   ├── news_fetcher.py      # RSS 取得 + キーワードフィルタ
│   │   │   ├── gemini_summarizer.py # Gemini API 要約
│   │   │   ├── slack_poster.py      # Slack Webhook 投稿
│   │   │   ├── bot_runner.py        # Bot 実行オーケストレーター
│   │   │   └── scheduler.py         # APScheduler 管理
│   │   └── storage/
│   │       └── yaml_store.py        # YAML ファイル CRUD（filelock）
│   ├── data/              # YAML データ（Docker ボリュームでマウント）
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx            # ルーティング
│   │   ├── api/client.ts      # fetch ラッパー
│   │   ├── types/bot.ts       # 型定義
│   │   └── components/
│   │       ├── BotListPage.tsx   # Bot 一覧
│   │       ├── BotFormPage.tsx   # Bot 作成・編集
│   │       └── LogsPage.tsx      # 実行ログ一覧
│   ├── package.json
│   ├── vite.config.ts     # /api プロキシ設定（開発時）
│   └── Dockerfile
├── nginx/
│   └── nginx.conf         # Compute Engine 用リバースプロキシ設定
├── terraform/             # GCP インフラ定義
│   ├── main.tf            # Compute Engine + 静的 IP + ファイアウォール
│   ├── variables.tf
│   └── outputs.tf
├── .github/workflows/
│   └── deploy.yml         # Build → Push (GHCR) → SSH デプロイ
├── docker-compose.yml     # ローカル / 本番コンテナ定義
└── .env.example           # 環境変数テンプレート
```

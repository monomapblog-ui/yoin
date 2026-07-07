# yoin プロジェクト状況メモ

作業ブランチ: `claude/yoin-project-handover-pqpzo0`

## 現在進行中のタスク（次にやること）

**Stripe決済統合のE2E検証待ち。**

このセッションで、ポイント購入が「決済確認なしで無料付与されてしまう」致命的な穴（`POST /api/points` が誰でも叩けばポイントが増える仕様だった）を見つけ、Stripe Checkout + Webhookベースの実装に置き換えた（コミット `e9b8bae`）。

- `src/lib/stripe.ts` / `src/lib/points.ts` … Stripeクライアントとポイントパック定義
- `src/app/api/points/checkout/route.ts` … Checkout Session作成
- `src/app/api/webhooks/stripe/route.ts` … 決済完了webhookを検証し、ここで初めてポイント付与
- `src/app/points/PointsClient.tsx` … Stripeへリダイレクトするよう変更

**このサンドボックス環境は `api.stripe.com` への外部通信がブロックされているため、Checkout Session作成（Stripe実APIへのリクエスト）は未検証。** Webhook側のロジック（署名検証・ポイント付与・冪等性・未決済拒否）は自己署名した偽イベントで動作確認済み。

### 進捗（このセッションで判明したこと）
- Stripeテストキー（`sk_test_...`）はユーザーから共有済み（既存の別サービス「ラクハイ」のアカウントを流用、テストモードなので問題なし）
- Vercelプレビューデプロイ済み: `https://yoin-5qjb3hj3o-monomapblog-uis-projects.vercel.app`（ブランチ `claude/yoin-project-handover-pqpzo0`）に `STRIPE_SECRET_KEY` 設定済み
- Vercel Deployment Protection（Vercel Authentication）は一時的に無効化済み（確認が終わったら再度ONにすることを推奨）
- **このサンドボックス環境は curl / WebFetch / Playwrightブラウザいずれの経路でも外部ドメイン（Vercel・Stripeとも）に一切到達できないことを確認済み。** 環境のネットワーク許可リストの制約で私側からは変更不可。そのため「Checkout Session作成→実際に決済ページが開く」という最後の目視確認は、ユーザー自身のブラウザで行ってもらう必要がある

### 残っている作業
- **Webhook設定が途中**: Stripeダッシュボードでエンドポイント（`https://yoin-5qjb3hj3o-monomapblog-uis-projects.vercel.app/api/webhooks/stripe`、イベント`checkout.session.completed`）を登録 → 発行される`whsec_...`をVercelの環境変数`STRIPE_WEBHOOK_SECRET`に追加 → Redeploy、という手順を伝えたところで、ユーザーが「なぜかStripeダッシュボードが開けない」と報告（原因未調査、ユーザー側の環境の問題の可能性）
- Webhook設定が完了したら、ユーザーに実際に `/points` でパック購入→テストカード(4242 4242 4242 4242)で決済→ポイントが反映されるかを確認してもらう
- 確認が終わったらVercelのDeployment Protectionを再度ONに戻すよう伝える

## このセッションで修正した主なバグ（コミット済み・プッシュ済み）

1. `<a>`タグ→`next/link`（全ページリロード回避）
2. Resendクライアントの遅延初期化（`RESEND_API_KEY`未設定でも本番ビルドが落ちないように）
3. **有料記事の閲覧制限バイパス**（`articles/[id]/page.tsx`）— `previewPosition`が常にnullなため、有料記事の本文が購入前でも全文HTMLに出力されていた。デフォルトのプレビュー文字数にフォールバックするよう修正
4. **メール送信失敗の隠蔽** — Resend SDKは`send()`失敗時に例外を投げず`{error}`を返す仕様なのに、コード側が`error`を一切見ていなかった。確認メール・パスワードリセット・お問い合わせが「成功」と表示されつつ実際は未送信になっていた
5. 上記4の修正に伴う回帰（`forgot-password`/`resend-verification`にtry/catchがなく500になる）を修正
6. **ポイント購入の無料付与バグ→Stripe実装**（上記）

## その他の残タスク（本人対応が必要）

- Resend本登録（現状ダミーキーのため、確認メール等は「エラーとして正しく」失敗するが実際には届かない）
- Google OAuth: 本番URLをGoogle ConsoleのリダイレクトURIに追加
- 管理者アカウント: Vercelに `ADMIN_EMAIL` / `ADMIN_PASSWORD` を設定してRedeploy
- 特商法ページ: 「合同会社グラステ」は**未登記**（登記完了まで本番デプロイ非推奨）。運営責任者名も「準備中」のまま
- 画像アップロード（`/api/upload`）: Cloudinary未設定時はローカルファイルシステムに書き込むフォールバックだが、Vercel Serverless Functionsは読み取り専用のため本番で失敗する可能性が高い。Cloudinary環境変数の設定状況を要確認
- レート制限なし（登録・ログイン・コメント投稿等）
- 本格的なセキュリティ診断は未実施（今回は機能テストが目的）

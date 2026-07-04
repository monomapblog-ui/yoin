import Link from "next/link";

export const metadata = { title: "プライバシーポリシー | yoin" };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">1. 収集する情報</h2>
          <p>当サービスは以下の情報を収集します：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>メールアドレス・表示名などの登録情報</li>
            <li>投稿したコンテンツ</li>
            <li>サービス利用履歴（購入・閲覧・いいね等）</li>
            <li>アクセスログ（IPアドレス・ブラウザ情報等）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">2. 情報の利用目的</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>サービスの提供・改善</li>
            <li>ユーザーサポート</li>
            <li>不正利用の防止</li>
            <li>サービスに関する通知・連絡</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">3. 情報の第三者提供</h2>
          <p>
            当サービスは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。
            ただし、サービス運営に必要な業務委託先（決済処理、メール送信等）には必要な範囲で提供する場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Cookieの使用</h2>
          <p>
            当サービスはログイン状態の維持等のためCookieを使用します。
            ブラウザの設定でCookieを無効にするとサービスの一部機能が利用できなくなります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">5. 外部サービス連携</h2>
          <p>
            GoogleやX（Twitter）でのログインを利用した場合、それぞれのサービスのプライバシーポリシーも適用されます。
            画像はCloudinaryに保存される場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">6. 情報の管理・セキュリティ</h2>
          <p>
            当サービスは個人情報の漏洩・滅失・毀損を防止するため適切な安全管理措置を講じます。
            パスワードはハッシュ化して保存します。通信はSSL/TLSで暗号化されます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">7. 開示・訂正・削除</h2>
          <p>
            ご自身の個人情報の開示・訂正・削除を希望される場合は、設定画面またはお問い合わせよりご連絡ください。
            アカウント削除を行うことで登録情報を削除できます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">8. ポリシーの変更</h2>
          <p>
            本ポリシーは予告なく変更される場合があります。
            重要な変更の場合はサービス上でお知らせします。
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4">制定日：2025年1月1日</p>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-teal-600 hover:underline text-sm">← トップへ戻る</Link>
      </div>
    </div>
  );
}

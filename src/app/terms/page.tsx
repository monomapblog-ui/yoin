import Link from "next/link";

export const metadata = { title: "利用規約 | yoin" };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">利用規約</h1>

      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第1条（適用）</h2>
          <p>
            本規約は、yoin（以下「当サービス」）が提供するすべてのサービスの利用に適用されます。
            ユーザーは本規約に同意した上でサービスをご利用ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第2条（利用登録）</h2>
          <p>
            登録希望者は本規約に同意の上、所定の方法により利用登録を申請します。
            当サービスが登録を承認した時点で利用登録が完了します。
            未成年者は保護者の同意を得た上でご利用ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第3条（コンテンツ）</h2>
          <p>
            本サービスには成人向けコンテンツが含まれます。18歳未満の方のご利用はお断りします。
            投稿されたコンテンツの著作権はユーザーに帰属しますが、当サービスはサービス改善目的での利用権を有します。
            違法・有害なコンテンツの投稿は禁止します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第4条（ポイント・収益）</h2>
          <p>
            購入したポイントは現金に換金できません。
            コンテンツ販売による収益のうち、プラットフォーム手数料15%を差し引いた85%がライターに支払われます。
            出金申請後、処理まで最大30営業日かかる場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第5条（禁止事項）</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>他のユーザーまたは第三者への誹謗中傷</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>他者のアカウントを不正利用する行為</li>
            <li>未成年者に関する性的コンテンツの投稿</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第6条（免責事項）</h2>
          <p>
            当サービスは、ユーザー間のトラブルについて一切の責任を負いません。
            サービスの一時停止・変更・終了について、ユーザーへの損害に関し責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第7条（規約の変更）</h2>
          <p>
            当サービスは必要に応じて本規約を変更できるものとします。
            変更後もサービスを利用し続けた場合、新しい規約に同意したものとみなします。
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

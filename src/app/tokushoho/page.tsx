import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "特定商取引法に基づく表記" };

export default function TokushohoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            <Row label="販売業者" value="合同会社グラステ" />
            <Row label="運営責任者" value="（準備中）" />
            <Row label="所在地" value="お問い合わせいただいた場合、遅滞なく開示いたします" />
            <Row label="電話番号" value="お問い合わせいただいた場合、遅滞なく開示いたします" />
            <Row label="メールアドレス" value="support@yoin.jp" />
            <Row label="販売URL" value="https://yoin-kappa.vercel.app" />
            <Row
              label="販売価格"
              value="各記事・ポイントパックのページに表示される価格（税込）"
            />
            <Row
              label="販売価格以外の費用"
              value="インターネット接続に関する通信費はお客様のご負担となります"
            />
            <Row
              label="お支払い方法"
              value="クレジットカード（Visa・Mastercard・JCB・American Express）"
            />
            <Row
              label="お支払い時期"
              value="ポイント購入時に即時決済"
            />
            <Row
              label="サービスの提供時期"
              value="ポイント購入完了後、即時利用可能。有料記事はポイント消費後即時閲覧可能"
            />
            <Row
              label="返品・キャンセルについて"
              value="デジタルコンテンツの性質上、購入完了後の返金・キャンセルはお受けできません。ただし、システム障害などにより正常にご利用いただけない場合はご対応いたします"
            />
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-center">
        <Link href="/" className="text-teal-600 hover:underline text-sm">← トップへ戻る</Link>
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="flex flex-col sm:flex-row">
      <th className="sm:w-44 flex-shrink-0 px-5 py-4 text-left text-gray-500 font-medium bg-gray-50 sm:bg-transparent">
        {label}
      </th>
      <td className="px-5 py-4 text-gray-800 leading-relaxed">{value}</td>
    </tr>
  );
}

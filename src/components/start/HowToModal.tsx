import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './HowToModal.css';

interface HowToModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HowToModal: React.FC<HowToModalProps> = ({ isOpen, onClose }) => {
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="how-to-modal-overlay">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="how-to-modal"
                    >
                        <button className="how-to-modal-close" onClick={onClose}>
                            <X size={24} />
                        </button>
                        <h2>GeoSeekerの使い方</h2>
                        <div className="how-to-content">
                            <h3>はじめに</h3>
                            <ol>
                                <li>ようこそGeoSeekerへ！</li>
                                <li>これは永久無料のGeo⚫️uessr風のゲームとなっています</li>
                                <li>ぜひログインしてランキング上位を目指してください！</li>
                                <li>スマホの方はホーム画面に追加していただけると全画面でプレイできます</li>
                            </ol>
                            <h3>基本ルール</h3>
                            <ol>
                                <li>ランダムな場所のストリートビューが表示されます</li>
                                <li>地図上で、その場所だと思う位置をクリックして選択してください</li>
                                <li>実際の場所との距離に応じてスコアが加算されます</li>
                                <li>より近い位置を当てるほど、より高いポイントを獲得できます</li>
                            </ol>
                            <h3>ゲーム設定</h3>
                            <ol>
                                <li>デフォルトのルールを2種類用意しています</li>
                                <li><strong>Official Rules</strong>: ラウンド制限時間2分、その他制限なしの統一ルールです</li>
                                <li><strong>NMPZ</strong>: No Move Pan Zoomの略で、マップの移動・パン・ズームしたりすることができない鬼畜ルールです。制限時間の指定はありません</li>
                            </ol>
                            <h3>ランキング</h3>
                            <ol>
                                <li>マップごとにランキングが表示されます</li>
                                <li>Official Rules、NMPZ、ルールの指定なしの3種類のランキングを設けています</li>
                                <li>ログインユーザーのみ掲載されます</li>
                            </ol>
                            <h3>Daily</h3>
                            <ol>
                                <li>右上メニューからデイリーマップに挑戦しましょう</li>
                                <li>1日に一度だけ、全プレイヤー共通の場所をプレイできます</li>
                            </ol>
                            <h3>Tips</h3>
                            <ol>
                                <li>マップの大きさによってスコアの出やすさは変動します。なお、誤差20m以内であれば必ず5000点が出る仕様になっています</li>
                                <li>デイリーマップでは移動した回数もカウントされます。リロードするとスタート地点に戻りますが、カウントはリセットされませんのでご注意ください</li>
                            </ol>
                            <div className="terms-section">
                                <button 
                                    className="terms-toggle" 
                                    onClick={() => setIsTermsOpen(!isTermsOpen)}
                                >
                                    <h3>利用規約</h3>
                                    {isTermsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {isTermsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="terms-content"
                                    >
                                        <p className="terms-intro">
                                            本サービス「GeoSeeker」（以下「本サービス」といいます）は、個人による非商用の娯楽目的で提供されるものです。以下の利用規約（以下「本規約」といいます）は、本サービスの利用に関する条件を定めるものです。本サービスを利用された場合、本規約に同意されたものとみなします。
                                        </p>
                                        <div className="terms-section">
                                            <h4>第1条（免責事項）</h4>
                                            <ul>
                                                <li>本サービスの利用または利用不能に起因して発生したいかなる損害（直接的・間接的を問わず）についても、運営者は一切の責任を負いません。</li>
                                                <li>通信回線やシステム障害、第三者の不正アクセス等により発生した損害についても、同様とします。</li>
                                            </ul>
                                        </div>
                                        <div className="terms-section">
                                            <h4>第2条（知的財産権）</h4>
                                            <ul>
                                                <li>GoogleおよびGoogleマップは、Google LLCの商標または登録商標です。</li>
                                                <li>本サービスで使用されるその他の画像・音声・テキスト・プログラム等は、運営者が作成したもの、または適切なライセンスに基づき使用されているものです。</li>
                                                <li>本サービスに含まれる一切のコンテンツの著作権その他の権利は、運営者または正当な権利を有する第三者に帰属します。無断転載・再配布を禁止します。</li>
                                            </ul>
                                        </div>
                                        <div className="terms-section">
                                            <h4>第3条（禁止事項）</h4>
                                            <p>ユーザーは、以下の行為をしてはなりません。</p>
                                            <ul>
                                                <li>本サービスまたはその一部を改変、複製、再配布する行為</li>
                                                <li>UIとして提供される以外の方法で、本サービスに関連するデータにアクセスする行為</li>
                                                <li>他ユーザーまたは第三者の権利を侵害する行為</li>
                                                <li>公序良俗に反するまたは運営者が不適切と判断する表現・行為</li>
                                            </ul>
                                        </div>
                                        <div className="terms-section">
                                            <h4>第4条（サービスの提供・中断・終了）</h4>
                                            <ul>
                                                <li>運営者は、事前の予告なく、本サービスの全部または一部を変更・中断・終了することがあります。</li>
                                                <li>運営者はこれによりユーザーに生じた損害について、一切の責任を負いません。</li>
                                            </ul>
                                        </div>
                                        <div className="terms-section">
                                            <h4>第5条（個人情報の取扱い）</h4>
                                            <ul>
                                                <li>ユーザーから取得した個人情報は、適切に管理し、本サービスの運営目的に限定して利用します。</li>
                                                <li>ユーザーネームは、許可なくランキング等に掲載されることがあります。</li>
                                                <li>公序良俗に反する、または不適切と判断されるユーザーネーム・アカウントについては、通知なしに削除・制限されることがあります。</li>
                                                <li>個人情報の取り扱いについては、別途プライバシーポリシーを設ける場合があります。</li>
                                            </ul>
                                        </div>
                                        <div className="terms-section">
                                            <h4>第6条（アクセス解析について）</h4>
                                            <p>本サービスでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。取得されるデータは匿名のトラフィックデータであり、個人を特定する情報は含まれません。</p>
                                        </div>
                                        <div className="terms-section">
                                            <h4>第7条（規約の変更）</h4>
                                            <p>運営者は、必要に応じて本規約を変更することがあります。変更後の規約は、本サービス上に掲示した時点で効力を生じます。ユーザーが規約変更後に本サービスを利用した場合、変更内容に同意したものとみなします。</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            <div className="terms-footer">
                                <div className="terms-contact">
                                    <p>Created by <a href="https://x.com/abshrimp3" target="_blank" rel="noopener noreferrer">@ABshrimp3</a></p>
                                </div>
                                <div className="terms-version">
                                    <p>Version: 2.0.0</p>
                                </div>
                                <div className="terms-copyright">
                                    <p>© 2024-2025 GeoSeeker All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HowToModal; 
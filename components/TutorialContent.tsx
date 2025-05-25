
import React from 'react';
import { Card } from './common/Card';

const TutorialSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow">
    <h3 className="text-xl font-semibold text-sky-400 mb-3">{title}</h3>
    <div className="space-y-2 text-slate-300 leading-relaxed">{children}</div>
  </div>
);

export const TutorialContent: React.FC = () => {
  return (
    <Card title="理解傅立葉轉換">
      <TutorialSection title="什麼是傅立葉轉換？">
        <p>
          想像一下您聽到一段複雜的聲音，比如一段音樂。這段聲音是由許多不同的簡單聲音（純音或音符）混合而成的。傅立葉轉換就是一種數學工具，幫助我們將複雜的聲音分解成其獨立的簡單聲音成分。
        </p>
        <p>
          簡單來說，它將信號從<strong>時域</strong>（其振幅如何隨時間變化）轉換到<strong>頻域</strong>（信號中存在哪些頻率以及它們的強度）。
        </p>
        <img src="https://picsum.photos/seed/fouriertimecn/600/200" alt="時域與頻域概念圖" className="my-4 rounded-lg shadow-md mx-auto" />
      </TutorialSection>

      <TutorialSection title="核心概念">
        <ul className="list-disc list-inside space-y-3">
          <li>
            <strong>時域 (Time Domain):</strong> 這是我們通常感知信號的方式，例如觀察聲波的形狀隨時間變化。X 軸是時間，Y 軸是振幅。
          </li>
          <li>
            <strong>頻域 (Frequency Domain):</strong> 這個視角向我們展示了構成信號的頻率。X 軸是頻率，Y 軸通常是每個頻率的振幅（或功率）。頻域圖中的峰值表示該特定頻率在原始信號中佔有重要地位。
          </li>
          <li>
            <strong>正弦波 (Sine Waves):</strong> 這些是基本的組成部分。傅立葉轉換假設任何複雜信號都可以表示為許多正弦（和餘弦）波的總和，每個波都有其自身的頻率、振幅和相位。
          </li>
          <li>
            <strong>頻率 (Frequency):</strong> 波形每單位時間重複的次數（例如，赫茲 - 每秒週期數）。頻率越高，聲音的音調越高。
          </li>
          <li>
            <strong>振幅 (Amplitude):</strong> 波的「強度」或「大小」。振幅越高，聲音越大或光線越亮。
          </li>
          <li>
            <strong>相位 (Phase):</strong> 波在其週期中的起始位置。它影響波如何組合。
          </li>
          <li>
            <strong>取樣率 (Sampling Rate, Fs):</strong> 
            想像您在為一段快速變化的事件拍照。取樣率就像是您每秒鐘按快門的次數。在數位信號處理中，它指的是每秒從連續信號（如聲音或感測器讀數）中擷取多少個數據點（樣本）。單位通常是赫茲 (Hz)。
            <ul className="list-circle list-inside pl-4 mt-2 space-y-1">
                <li><strong>重要性：</strong>取樣率必須至少是被分析信號最高頻率的兩倍（這就是著名的「奈奎斯特-香農取樣定理」），才能避免資訊失真（稱為「混疊」或「Alias」）。如果取樣率不夠高，高頻信號可能會被錯誤地解讀為較低的頻率。</li>
                <li><strong>影響：</strong>它直接決定了您能分析到的最高頻率（即奈奎斯特頻率 = Fs / 2）。越高的取樣率能捕捉到越高頻的細節，但同時也會產生更多的數據需要處理。</li>
            </ul>
          </li>
          <li>
            <strong>取樣點數 (Number of Samples, N):</strong> 
            這是您用於<strong className="text-amber-300">一次傅立葉轉換分析</strong>的總數據點數量。
            <ul className="list-circle list-inside pl-4 mt-2 space-y-1">
                <li><strong>總分析時長：</strong>取樣點數 (N) 和取樣率 (Fs) 共同決定了您分析的信號片段的總時長（時長 = N / Fs 秒）。例如，如果 N = 512 點，Fs = 1000 Hz，那麼分析的總時長就是 512 / 1000 = 0.512 秒。</li>
                <li><strong>頻率解析度：</strong>N 越大，頻譜圖中各個頻率點之間的「間隔」就越小，意味著您可以更精細地區分兩個相近的頻率。這個頻率間隔（或稱頻率解析度）約為 Fs / N。例如，Fs = 1000 Hz, N = 512，則頻率解析度約為 1000/512 ≈ 1.95 Hz。</li>
                <li><strong>計算效率：</strong>許多 FFT 演算法（包括本工具使用的基本版本）在 N 是 2 的次方時（例如 64, 128, 256, 512, 1024）計算效率最高。這就是為什麼您在「互動介面」中會看到這些建議值，以及在「CSV分析器」中數據會被自動填充（補零）到最接近的2的次方長度。</li>
            </ul>
          </li>
        </ul>
         <img src="https://picsum.photos/seed/frequencyspectrumcn/600/250" alt="頻譜範例圖" className="my-4 rounded-lg shadow-md mx-auto" />
      </TutorialSection>

      <TutorialSection title="為何有用？(應用場景與生活實例)">
        <p>傅立葉轉換功能強大，應用於許多領域：</p>
        <ul className="list-disc list-inside space-y-3">
          <li><strong>音訊處理:</strong>
            音樂播放器中的等化器（EQ，調整低音/高音就是增強或削減特定頻率範圍）、噪音消除技術（如降噪耳機分析環境噪音頻率並產生「反噪音」來抵消）、語音辨識、音樂合成器。音樂應用程式 (如 Spotify) 也透過分析歌曲的頻率內容來「感知」其節奏和能量。
          </li>
          <li><strong>影像處理:</strong>
            影像壓縮（如 JPEG，它會巧妙地捨棄我們眼睛不太敏感的不重要高頻資訊，從而縮小檔案大小）、邊緣偵測、影像濾波。當您銳化影像時（增強邊緣等高頻細節）或模糊影像時（平滑高頻成分），都與頻率操作有關。
          </li>
          <li><strong>通訊:</strong>
            調變和解調用於廣播、電視、Wi-Fi 和行動電話的信號。每次您使用 Wi-Fi 或手機時，數據都被編碼到特定頻率的載波上。廣播電台在指定的頻率上播放。傅立葉轉換有助於分離這些信號。
          </li>
          <li><strong>工程:</strong> 分析結構中的振動、控制系統中的信號濾波。</li>
          <li><strong>醫學:</strong> MRI（核磁共振成像）和 CT 掃描。MRI 機器使用強力磁鐵和無線電波，傅立葉轉換對於將從身體接收到的原始數據轉換為器官和組織的詳細影像至關重要，它通過分析氫原子發出的信號頻率來實現。</li>
          <li><strong>數據分析:</strong> 識別股票市場數據、氣候數據等中的週期性模式。</li>
          <li><strong>日常生活中的「傅立葉元素」:</strong>
            <ul className="list-circle list-inside mt-2 space-y-1 pl-4">
              <li><strong>彩虹:</strong> 稜鏡就像一個光學傅立葉轉換器，將白光（所有可見頻率的混合）分解成其組成的顏色（不同的光頻率）。</li>
              <li><strong>樂器聲音:</strong> 當您彈撥吉他弦或敲擊鋼琴鍵時，它不僅產生一個純頻率。它會產生一個基頻（您聽到的音符）以及一系列更高頻率的泛音（諧波）。這些的組合賦予了樂器獨特的音色。傅立葉轉換可以向您展示這種頻率的「配方」。</li>
              <li><strong>水中的漣漪:</strong> 如果您在池塘中丟下多個小石子，複雜的漣漪圖案是更簡單圓形波的疊加。原則上，分析這種模式可以使用類似傅立葉的方法來確定石子是在何時何地被丟下的。</li>
            </ul>
          </li>
        </ul>
        <p className="mt-2">基本上，任何時候您需要了解信號或數據的頻率成分時，傅立葉轉換都是首選工具。</p>
      </TutorialSection>
      
      <TutorialSection title="解讀輸出 (頻譜)">
        <p>
          傅立葉轉換的輸出通常會顯示為一張「頻譜圖」。這張圖的 X 軸代表<strong>頻率</strong>，Y 軸代表該頻率分量的<strong>幅值</strong>（或強度）。
        </p>
        <p>
          在輸入信號中佔主導地位的頻率處，頻譜圖上會出現峰值。每個峰值的高度對應於該頻率分量的相對強度。
        </p>
        <p>
          例如，如果您分析一個由 5 Hz 正弦波和 12 Hz 正弦波組成的信號（如我們的「互動介面」中所示），您會在頻譜中看到兩個主要峰值：一個在 5 Hz 處，另一個在 12 Hz 處。這些峰值的高度將與原始正弦波的振幅相關。
        </p>
        <p>
          頻譜圖的 X 軸（頻率軸）的範圍通常會從 0 Hz（直流分量）延伸到<strong>取樣率 (Fs) 的一半</strong>（這就是奈奎斯特頻率）。頻率軸上各個點的「密集程度」（即頻率解析度）則與您分析時使用的<strong>取樣點數 (N)</strong> 以及取樣率 (Fs) 有關（解析度約為 Fs/N）。
        </p>
        <p>
          <strong>「互動介面」</strong> 標籤頁是體驗這一點的好地方。嘗試添加不同的正弦波，調整取樣率和取樣點數，看看時域和頻域圖如何變化！
        </p>
      </TutorialSection>
    </Card>
  );
};

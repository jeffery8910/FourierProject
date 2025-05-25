
import React, { useState, useCallback, useMemo } from 'react';
import { parseCSV, CSVParseResult } from '../services/csvParser'; // Keep for file upload
import { fft, getMagnitudes, padSignalToPowerOfTwo } from '../services/fft';
import { DataPoint, ComplexNumber } from '../types';
import { PlotDisplay } from './PlotDisplay';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import { LoadingSpinner } from './common/LoadingSpinner';
import { TooltipIcon } from './common/TooltipIcon';


const DEFAULT_CSV_SAMPLING_RATE = 100; 
const INITIAL_GRID_ROWS = 3;
const INITIAL_GRID_COLS = 3;
const HEADER_EXAMPLES = ['時間 (秒)', '訊號值', '溫度 (°C)', '樣本ID'];
const DATA_ROW_EXAMPLE_FACTOR = 0.1;


export const CSVProcessor: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVParseResult | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [csvSamplingRate, setCsvSamplingRate] = useState<number>(DEFAULT_CSV_SAMPLING_RATE);

  // State for grid input
  const initialGrid = Array(INITIAL_GRID_ROWS).fill(null).map(() => Array(INITIAL_GRID_COLS).fill(''));
  const [gridData, setGridData] = useState<string[][]>(initialGrid);
  const [firstLineIsHeader, setFirstLineIsHeader] = useState<boolean>(true);


  const processAndSetCsvData = (parsedResult: CSVParseResult | null, source: 'file' | 'manual') => {
    setIsLoading(true);
    setError(null);

    if (source === 'file') {
        // Clear grid if file is processed? Or keep it? For now, let's keep it simple and not clear.
        // User can manually clear or it gets overwritten if they process grid.
    } else {
        setFileName(''); // Clear file name if grid input is processed
    }

    if (!parsedResult) {
        setCsvData(null);
        setSelectedColumn('');
        setIsLoading(false);
        return;
    }

    if (parsedResult.error) {
      setError(`CSV 解析錯誤: ${parsedResult.error}`);
      setCsvData(null);
      setSelectedColumn('');
    } else if (parsedResult.headers.length === 0 && parsedResult.data.length > 0) {
      setError("CSV 數據已解析但沒有標頭。");
      setCsvData(null);
      setSelectedColumn('');
    } else if (parsedResult.headers.length === 0 && parsedResult.data.length === 0 && (source === 'file' || (source === 'manual' && gridData.flat().join('').trim() !== ''))) {
       // Condition for manual might need refinement if we allow empty grid processing
      setError("CSV 來源沒有標頭或格式不正確，且沒有數據。");
      setCsvData(null);
      setSelectedColumn('');
    }
     else {
      setCsvData(parsedResult);
      if (parsedResult.headers.length > 0) {
          const firstNumericColumn = parsedResult.headers.find(header => 
              parsedResult.data.length > 0 && !isNaN(parseFloat(parsedResult.data[0][header]))
          );
          setSelectedColumn(firstNumericColumn || parsedResult.headers[0] || '');
      } else {
          setSelectedColumn('');
      }
    }
    setIsLoading(false);
  };


  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setCsvData(null);
      setSelectedColumn('');
      setFileName(file.name);
      // setGridData(initialGrid); // Optionally reset grid on file upload

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = parseCSV(content); // Using existing parseCSV for files
          processAndSetCsvData(parsed, 'file');
        } catch (err) {
          setError("處理 CSV 檔案失敗。請確保它是有效的 CSV。");
          console.error(err);
          processAndSetCsvData(null, 'file');
        }
      };
      reader.onerror = () => {
        setError("讀取檔案失敗。");
        processAndSetCsvData(null, 'file');
      };
      reader.readAsText(file);
    }
    event.target.value = ''; // Reset file input
  }, []);

  const handleGridCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGridData = gridData.map((row, rIdx) => 
      rIdx === rowIndex 
        ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
        : row
    );
    setGridData(newGridData);
  };

  const handleAddRow = () => {
    const numCols = gridData[0]?.length || 1; // Use current number of columns, or 1 if grid is empty
    setGridData([...gridData, Array(numCols).fill('')]);
  };

  const handleRemoveRow = () => {
    if (gridData.length > 1) {
      setGridData(gridData.slice(0, -1));
    } else {
      setError("網格至少需要保留一行。");
    }
  };

  const handleAddColumn = () => {
    if (gridData.length === 0) { // If grid is completely empty (e.g. after multiple removes)
        setGridData([['']]); // Start with a 1x1 grid
        return;
    }
    setGridData(gridData.map(row => [...row, '']));
  };

  const handleRemoveColumn = () => {
    if (gridData[0]?.length > 1) {
      setGridData(gridData.map(row => row.slice(0, -1)));
    } else {
      setError("網格至少需要保留一欄。");
    }
  };

  const handleProcessGridData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setCsvData(null);
    setSelectedColumn('');
    setFileName(''); 

    if (gridData.length === 0 || gridData[0].length === 0) {
        setError("網格數據不能為空。請新增一些行和欄並輸入數據。");
        processAndSetCsvData(null, 'manual');
        return;
    }

    let actualHeaders: string[];
    let dataRowsAsArrays: string[][];

    if (firstLineIsHeader) {
        if (gridData.length === 0) {
            setError("已勾選「第一行包含標頭」，但網格為空。");
            processAndSetCsvData(null, 'manual');
            return;
        }
        actualHeaders = gridData[0].map(h => h.trim());
        dataRowsAsArrays = gridData.slice(1);
    } else {
        const numCols = gridData[0]?.length || 0;
        actualHeaders = Array.from({ length: numCols }, (_, i) => `欄位 ${i + 1}`);
        dataRowsAsArrays = gridData;
    }
    
    if (actualHeaders.some(h => h === "" )) {
        setError("標頭中不能包含空字串。請檢查網格的第一行（如果設定為標頭）或確保所有欄都有內容（如果自動產生標頭時網格為空）。");
        processAndSetCsvData(null, 'manual');
        return;
    }
    if (new Set(actualHeaders).size !== actualHeaders.length) {
        setError("標頭中包含重複的欄位名稱，請確保所有標頭唯一（檢查網格第一行）。");
        processAndSetCsvData(null, 'manual');
        return;
    }

    const data: Array<Record<string, string>> = [];
    let columnMismatchError = false;
    for (const rowArray of dataRowsAsArrays) {
      // Filter out rows that are entirely empty strings
      if (rowArray.every(cell => cell.trim() === '')) {
        continue;
      }
      if (rowArray.length !== actualHeaders.length) {
        console.warn(`Grid input: Row has ${rowArray.length} values, expected ${actualHeaders.length}. Skipping row: "${rowArray.join(',')}"`);
        columnMismatchError = true;
        continue; 
      }
      const row: Record<string, string> = {};
      actualHeaders.forEach((header, index) => {
        row[header] = rowArray[index]?.trim() || ""; 
      });
      data.push(row);
    }
    
    if (data.length === 0 && dataRowsAsArrays.some(r => r.some(cell => cell.trim() !== ''))) {
        setError("所有從網格輸入的數據行均因欄位數與標頭不符或格式問題而被跳過。");
        processAndSetCsvData({ headers: actualHeaders, data: [] }, 'manual');
        return;
    }
    if(columnMismatchError && data.length > 0){
        setError("部分網格數據行的欄位數量與標頭不符，已被跳過。已處理其餘數據。");
    }
    
    const newCsvDataResult: CSVParseResult = { headers: actualHeaders, data };
    processAndSetCsvData(newCsvDataResult, 'manual');

  }, [gridData, firstLineIsHeader]);


  const numericColumnData = useMemo(() => {
    if (!csvData || !selectedColumn || csvData.data.length === 0) return [];
    return csvData.data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
  }, [csvData, selectedColumn]);

  const timeDomainPlotData = useMemo(() => {
    return numericColumnData.map((val, index) => ({ x: index, y: val }));
  }, [numericColumnData]);
  
  const frequencyDomainPlotData = useMemo(() => {
    if (numericColumnData.length === 0) return { magnitudes: [], maxFrequency: 0 };
    
    const paddedSignal = padSignalToPowerOfTwo(numericColumnData);
    if(paddedSignal.length === 0) return { magnitudes: [], maxFrequency: 0 };

    const complexSpectrum: ComplexNumber[] = fft(paddedSignal);
    return getMagnitudes(complexSpectrum, csvSamplingRate);
  }, [numericColumnData, csvSamplingRate]);

  const isGridEmpty = gridData.length === 0 || gridData[0].length === 0 || gridData.flat().every(cell => cell.trim() === '');

  const getPlaceholder = (rowIndex: number, colIndex: number): string => {
    if (firstLineIsHeader && rowIndex === 0) {
      return `標頭 ${colIndex + 1} (例如: ${HEADER_EXAMPLES[colIndex % HEADER_EXAMPLES.length]})`;
    }
    // For data rows, generate slightly more varied examples
    const baseValue = (rowIndex * DATA_ROW_EXAMPLE_FACTOR * (colIndex + 1) * 10);
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    let exampleValue: string;
    if (colIndex === 0 && (!firstLineIsHeader || rowIndex >0)) { // Time-like column
        exampleValue = ( (firstLineIsHeader ? rowIndex -1 : rowIndex) * DATA_ROW_EXAMPLE_FACTOR).toFixed(2);
    } else {
        exampleValue = (baseValue + randomFactor * 5).toFixed(2);
        // Ensure some variation
        if (colIndex % 2 === 0) exampleValue = Math.abs(parseFloat(exampleValue)).toFixed(2);
        else exampleValue = (parseFloat(exampleValue) * 1.5 + Math.random()*10).toFixed(2);
    }
    return `數據 (例如: ${exampleValue})`;
  };


  return (
    <div className="space-y-8">
      <Card title="CSV 資料來源與設定">
        {/* File Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-sky-400 mb-2">
            1. 上傳 CSV 檔案
          </h3>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Icon type="upload" className="mx-auto h-12 w-12 text-slate-500" />
              <div className="flex text-sm text-slate-400">
                <label
                  htmlFor="csv-upload-input"
                  className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-sky-400 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-sky-500 px-2 py-1"
                >
                  <span>上傳檔案</span>
                  <input id="csv-upload-input" name="csv-upload-input" type="file" className="sr-only" accept=".csv" onChange={handleFileUpload} aria-label="上傳CSV檔案" />
                </label>
                <p className="pl-1">或拖曳至此</p>
              </div>
              <p className="text-xs text-slate-500">CSV 檔案 (最大 5MB)</p>
            </div>
          </div>
          {fileName && <p className="mt-2 text-sm text-slate-300">已選擇檔案: {fileName}</p>}
        </div>

        <hr className="border-slate-700 my-8" />

        {/* Grid Input Section */}
        <div className="mb-6">
            <h3 className="text-lg font-medium text-sky-400 mb-2 flex items-center">
                2. 或使用網格手動輸入數據
                <TooltipIcon 
                    text="使用下方的網格直接輸入您的數據。您可以新增/移除欄和列。勾選「第一行包含標頭」以將網格的第一行用作欄位名稱。" 
                    className="ml-2" 
                    position="top"
                    align="start"
                />
            </h3>
            <div className="space-x-2 mb-3">
                <Button onClick={handleAddRow} size="sm" variant="secondary">增加行</Button>
                <Button onClick={handleRemoveRow} size="sm" variant="secondary" disabled={gridData.length <= 1}>移除最後一行</Button>
                <Button onClick={handleAddColumn} size="sm" variant="secondary">增加欄</Button>
                <Button onClick={handleRemoveColumn} size="sm" variant="secondary" disabled={gridData[0]?.length <= 1}>移除最後一欄</Button>
            </div>
            <p className="text-sm text-slate-400 mb-2">
              請在下方網格中輸入您的數據。若欄位將用於FFT分析，請確保其包含數值。非數值內容在FFT計算時將被忽略。
            </p>
            <div className="overflow-x-auto max-w-full">
                <table className="min-w-full divide-y divide-slate-700 border border-slate-700">
                    <tbody className="divide-y divide-slate-700 bg-slate-800">
                        {gridData.map((row, rowIndex) => (
                            <tr key={`row-${rowIndex}`} className={firstLineIsHeader && rowIndex === 0 ? "bg-slate-750" : ""}>
                                {row.map((cell, colIndex) => (
                                    <td key={`cell-${rowIndex}-${colIndex}`} className="p-0">
                                        <input 
                                            type="text"
                                            value={cell}
                                            onChange={(e) => handleGridCellChange(rowIndex, colIndex, e.target.value)}
                                            placeholder={getPlaceholder(rowIndex, colIndex)}
                                            aria-label={`網格儲存格 R${rowIndex+1}C${colIndex+1}`}
                                            className={`w-full h-full p-2 bg-transparent text-slate-100 focus:ring-1 focus:ring-sky-500 focus:bg-slate-700 outline-none ${firstLineIsHeader && rowIndex === 0 ? 'font-semibold text-sky-300' : ''}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {(gridData.length === 0 || gridData[0]?.length === 0) && (
                <p className="text-sm text-slate-400 mt-2">網格目前為空。請使用按鈕添加行/列。</p>
            )}


            <div className="mt-3 flex items-center">
                <input
                    type="checkbox"
                    id="firstLineIsHeaderGrid" 
                    checked={firstLineIsHeader}
                    onChange={e => setFirstLineIsHeader(e.target.checked)}
                    className="h-4 w-4 text-sky-600 border-slate-500 rounded focus:ring-sky-500 accent-sky-500"
                />
                <label htmlFor="firstLineIsHeaderGrid" className="ml-2 text-sm text-slate-300">
                    第一行包含標頭
                </label>
                <TooltipIcon 
                    text="若勾選，網格的第一行將被視為欄位名稱。若未勾選，將自動生成標頭 (例如「欄位 1」)。" 
                    className="ml-2" 
                    position="top"
                    align="start"
                />
            </div>
            <Button onClick={handleProcessGridData} className="mt-4" variant="secondary" disabled={isLoading || isGridEmpty}>
                處理網格數據
            </Button>
        </div>
        
        <hr className="border-slate-700 my-8" />

        {/* Common Settings and Status */}
        <h3 className="text-lg font-medium text-sky-400 mb-3">
            3. 設定與狀態
        </h3>
        {isLoading && <div className="my-4"><LoadingSpinner /></div>}
        {error && (
          <div className="my-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-md flex items-center">
            <Icon type="x-circle" className="w-5 h-5 mr-2 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {csvData && csvData.headers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="columnSelect" className="block text-sm font-medium text-slate-300 mb-1">
                選取用於 FFT 的數據欄位:
              </label>
              <select
                id="columnSelect"
                value={selectedColumn}
                onChange={e => setSelectedColumn(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2"
                aria-label="選取FFT數據欄位"
              >
                <option value="" disabled>-- 請選取一個欄位 --</option>
                {csvData.headers.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
               {csvData && numericColumnData.length === 0 && selectedColumn && <p className="text-xs text-orange-400 mt-1">注意：選定欄位「{selectedColumn}」似乎不包含有效的數值數據。</p>}
            </div>
            <div>
                <div className="flex items-center mb-1">
                  <label htmlFor="csvSamplingRate" className="block text-sm font-medium text-slate-300">假設取樣率 (Fs): <span className="font-bold text-sky-400">{csvSamplingRate} Hz</span></label>
                  <TooltipIcon text="指明數據點之間的時間間隔的倒數。例如，如果數據每 0.01 秒記錄一次，則取樣率為 100 Hz。正確的取樣率對於獲得有意義的頻率軸至關重要。" className="ml-1" align="end" />
                </div>
                <input type="number" id="csvSamplingRate" min="1" step="1" value={csvSamplingRate} onChange={e => setCsvSamplingRate(Math.max(1,Number(e.target.value)))} className="w-full bg-slate-700 border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2" aria-label="假設取樣率"/>
                <p className="text-xs text-slate-400 mt-1">若您的數據有已知取樣率，請調整此處以獲得準確的頻率分析。</p>
            </div>
          </div>
        )}
        {csvData && numericColumnData.length > 0 && <p className="text-sm text-slate-400 mt-2">在選定欄位「{selectedColumn}」中找到 {numericColumnData.length} 個數值數據點。已填充至 {padSignalToPowerOfTwo(numericColumnData).length} 個點以進行 FFT。</p>}
        {csvData && csvData.data.length === 0 && csvData.headers.length > 0 && !isLoading && <p className="text-sm text-orange-400 mt-2">數據已載入標頭但沒有有效的數據行，或者所有數據行解析失敗。</p>}


      </Card>
      
      {numericColumnData.length > 0 && (
        <>
          <PlotDisplay
            title={`時域數據 (${selectedColumn || '選定欄位'})`}
            data={timeDomainPlotData}
            xAxisLabel="取樣點索引"
            yAxisLabel={selectedColumn || "值"}
            lineColor="#34d399"
          />
          <PlotDisplay
            title={`頻域 (對 ${selectedColumn || '選定欄位'} 進行 FFT)`}
            data={frequencyDomainPlotData.magnitudes}
            xAxisLabel={`頻率 (Hz) - 最大: ${frequencyDomainPlotData.maxFrequency.toFixed(1)} Hz`}
            yAxisLabel="幅值"
            lineColor="#fb923c"
            yDomain={[0, 'auto']}
          />
        </>
      )}
      {csvData && numericColumnData.length === 0 && selectedColumn && !isLoading && (
         <Card title="無數據可繪製">
            <p className="text-slate-400">請選取包含數值數據的欄位以執行 FFT 並生成圖表，或檢查數據源是否包含有效數值。</p>
         </Card>
      )}

      <Card title="如何使用網格輸入數據 (逐步指南)">
        <div className="text-slate-300 space-y-4 leading-relaxed">
            <p>您可以像使用試算表（例如 Excel 或 Google Sheets）一樣，直接在網站上輸入數據並進行傅立葉轉換分析。以下是如何操作：</p>
            
            <div>
                <h4 className="font-semibold text-xl text-sky-400 mb-2">第 1 步：準備您的數據網格</h4>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>調整網格大小：</strong>
                        <ul className="list-circle list-inside pl-4 mt-1 space-y-1">
                            <li>使用「增加行」/「移除最後一行」按鈕來調整數據的行數。</li>
                            <li>使用「增加欄」/「移除最後一欄」按鈕來調整數據的欄數（即特徵數量）。</li>
                        </ul>
                    </li>
                    <li><strong>輸入欄位名稱 (標頭)：</strong>
                        <ul className="list-circle list-inside pl-4 mt-1 space-y-1">
                            <li>確保「第一行包含標頭」核取方塊已勾選（這是預設狀態）。</li>
                            <li>在網格的第一行中，為您的每一欄數據輸入一個描述性的名稱。例如：「時間」、「溫度」、「電壓」等。</li>
                            <li><strong className="text-amber-400">重要：</strong>標頭名稱必須是唯一的，且不能為空。</li>
                            <li>儲存格中會有提示，例如「標頭 1 (例如: 時間 (秒))」，引導您輸入。</li>
                        </ul>
                    </li>
                    <li><strong>輸入您的數據點：</strong>
                        <ul className="list-circle list-inside pl-4 mt-1 space-y-1">
                            <li>從網格的第二行開始，輸入您的實際數據。每一行代表一個時間點或一個樣本，每一欄對應您設定的標頭。</li>
                            <li><strong className="text-amber-400">重要：</strong>您打算進行傅立葉轉換分析的欄位（例如「訊號值」）<strong className="text-red-400">必須包含數值數據</strong> (例如 1.23, -5, 100)。非數值內容（如文字）在該欄的 FFT 計算中會被忽略。</li>
                            <li>儲存格中會有提示，例如「數據 (例如: 0.10)」，引導您輸入。</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div>
                <h4 className="font-semibold text-xl text-sky-400 mb-2">第 2 步：處理網格數據</h4>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>完成數據輸入後，點擊「處理網格數據」按鈕。</li>
                    <li>系統會讀取您在網格中輸入的標頭和數據。</li>
                </ul>
            </div>

            <div>
                <h4 className="font-semibold text-xl text-sky-400 mb-2">第 3 步：設定分析參數並查看結果</h4>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>選取分析欄位：</strong>
                        <ul className="list-circle list-inside pl-4 mt-1 space-y-1">
                           <li>在「設定與狀態」區塊中，從「選取用於 FFT 的數據欄位」下拉選單中，選擇您想要進行傅立葉轉換分析的欄位（它應該是包含數值的欄位）。</li>
                        </ul>
                    </li>
                    <li><strong>設定取樣率 (Fs)：</strong>
                        <ul className="list-circle list-inside pl-4 mt-1 space-y-1">
                            <li>輸入您數據的「假設取樣率 (Fs)」。這是非常重要的一步，因為它決定了頻譜圖中頻率軸的正確性。</li>
                            <li>取樣率是指每單位時間（通常是秒）收集多少個數據點。例如，如果您的數據是每 0.01 秒記錄一次，那麼取樣率就是 1 / 0.01 = 100 Hz。</li>
                        </ul>
                    </li>
                    <li><strong>查看圖表：</strong>
                        <ul className="list-circle list-inside pl-4 mt-1 space-y-1">
                            <li>一旦設定完成且選定欄位包含有效數值，下方將顯示兩個圖表：</li>
                            <li><strong>時域數據圖：</strong>顯示您原始數據隨時間（或樣本索引）的變化。</li>
                            <li><strong>頻域圖 (頻譜)：</strong>顯示經過傅立葉轉換後，數據中包含的各種頻率成分及其強度。</li>
                        </ul>
                    </li>
                </ul>
            </div>
            
            <div>
                <h4 className="font-semibold text-xl text-sky-400 mb-2">範例網格 (已勾選「第一行包含標頭」)</h4>
                 <p className="mb-2">假設我們要分析一個隨時間變化的訊號：</p>
                <div className="overflow-x-auto p-1 bg-slate-700 rounded max-w-md">
                    <table className="text-sm border-collapse border border-slate-600">
                        <thead>
                            <tr className="bg-slate-750">
                                <th className="border border-slate-600 px-2 py-1 font-semibold text-sky-300">時間 (秒)</th>
                                <th className="border border-slate-600 px-2 py-1 font-semibold text-sky-300">訊號強度</th>
                                <th className="border border-slate-600 px-2 py-1 font-semibold text-sky-300">註解</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-600 px-2 py-1">0.0</td>
                                <td className="border border-slate-600 px-2 py-1">1.5</td>
                                <td className="border border-slate-600 px-2 py-1">開始</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-600 px-2 py-1">0.1</td>
                                <td className="border border-slate-600 px-2 py-1">1.7</td>
                                <td className="border border-slate-600 px-2 py-1">正常</td>
                            </tr>
                             <tr>
                                <td className="border border-slate-600 px-2 py-1">0.2</td>
                                <td className="border border-slate-600 px-2 py-1">1.2</td>
                                <td className="border border-slate-600 px-2 py-1">波動</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-2">在這個範例中：</p>
                <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                    <li>「時間 (秒)」，「訊號強度」，「註解」是標頭。</li>
                    <li>如果我們想分析訊號強度隨頻率的變化，我們會在下拉選單中選擇「訊號強度」進行 FFT。</li>
                    <li>「註解」欄位因為是文字，所以不適合進行 FFT。</li>
                </ul>
            </div>
            <p className="mt-4">如果您遇到問題，請檢查錯誤訊息，並確保您的數據格式和設定正確無誤。</p>
        </div>
      </Card>

      <Card title="關於 Excel 檔案的說明">
        <p className="text-slate-400">
          目前本工具直接支援 CSV 檔案上傳或透過網格手動輸入數據。對於 Excel 檔案（.xls, .xlsx），請先使用試算表軟體（如 Microsoft Excel, Google Sheets 或 LibreOffice Calc）將其轉換為 CSV 格式。
        </p>
        <p className="text-slate-400 mt-2">
          轉換方法：打開您的 Excel 檔案，然後選擇「另存新檔」或「匯出」，並選擇「逗號分隔值 (.csv)」作為檔案類型。
        </p>
      </Card>
    </div>
  );
};

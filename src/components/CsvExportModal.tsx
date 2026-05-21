import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface Props {
  data: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CsvExportModal: React.FC<Props> = ({ data, open, onOpenChange }) => {
  const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set());
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [fileSize, setFileSize] = useState('0 KB');

  useEffect(() => {
    if (data.length > 0) {
      const cols = Object.keys(data[0]);
      setSelectedCols(new Set(cols));
    }
  }, [data]);

  const updatePreview = (newCols?: Set<string>) => {
    const cols = Array.from(newCols ?? selectedCols);
    const rows = data.slice(0, 5).map(row =>
      cols.reduce((acc, c) => ({ ...acc, [c]: row[c] }), {} as any)
    );
    setPreviewRows(rows);
    const csv = convertToCsv(rows, cols);
    setFileSize(`${(new Blob([csv]).size / 1024).toFixed(1)} KB`);
  };

  const toggleColumn = (col: string) => {
    setSelectedCols(prev => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      updatePreview(next);
      return next;
    });
  };

  const exportCsv = () => {
    const cols = Array.from(selectedCols);
    const csv = convertToCsv(data, cols);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    onOpenChange(false);
  };

  const convertToCsv = (rows: any[], columns: string[]) => {
    const header = columns.join(',');
    const body = rows.map(row => columns.map(c => row[c] ?? '').join(',')).join('\n');
    return header + '\n' + body;
  };

  if (!data.length) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Exportar CSV – Pré-visualização</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <div className="flex gap-6">
            <div className="w-1/3">
              <h4 className="font-medium mb-2">Colunas</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {Object.keys(data[0]).map(col => (
                  <label key={col} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCols.has(col)}
                      onChange={() => toggleColumn(col)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-2">Pré-visualização (5 linhas)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      {Array.from(selectedCols).map(c => <th key={c} className="p-1 border dark:border-gray-600">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-t dark:border-gray-700">
                        {Array.from(selectedCols).map(c => <td key={c} className="p-1 border dark:border-gray-600">{row[c]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-1">Tamanho estimado: {fileSize}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={exportCsv}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Baixar CSV
            </button>
            <Dialog.Close asChild>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancelar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

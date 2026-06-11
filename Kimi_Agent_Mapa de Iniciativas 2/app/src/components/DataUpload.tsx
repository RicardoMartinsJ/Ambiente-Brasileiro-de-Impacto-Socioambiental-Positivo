import { useData } from '@/hooks/useData';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, FileSpreadsheet, Check, AlertTriangle } from 'lucide-react';

export function DataUpload() {
  const { isUploadOpen, setIsUploadOpen, uploadData } = useData();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setMessage('Processando arquivo...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false });

        if (jsonData.length === 0) {
          setStatus('error');
          setMessage('O arquivo está vazio ou não contém dados na primeira aba.');
          return;
        }

        const required = ['id', 'iniciativa', 'organizacão', 'ano_de_início', 'setor', 'natureza_juíridica_IBGE'];
        const cols = Object.keys(jsonData[0] as Record<string, unknown>).map(c =>
          c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_')
        );

        const missing = required.filter(r =>
          !cols.some(c => c.includes(r.replace(/[^a-z0-9_]/g, '_').replace(/__/g, '_').replace(/^_|_$/g, '')))
        );

        if (missing.length > 0) {
          setStatus('error');
          setMessage(`Colunas não encontradas: ${missing.join(', ')}`);
          return;
        }

        const cleanData = jsonData.map((row: unknown, idx: number) => {
          const r = row as Record<string, unknown>;
          const get = (keys: string[]) => {
            for (const k of keys) {
              const v = r[k];
              if (v !== undefined && v !== null && String(v) !== '') return String(v).trim();
            }
            return '';
          };
          return {
            id: Number(r['id'] || r['ID'] || idx + 1),
            iniciativa: get(['iniciativa', 'Iniciativa', 'INICIATIVA']),
            organizacão: get(['organização', 'organizacão', 'Organização', 'ORGANIZACAO']),
            parcerias: get(['parcerias', 'Parcerias', 'PARCERIAS']),
            ano_inicio: Number(get(['ano_de_início', 'ano_inicio', 'ano de início', 'Ano de início', 'Ano_de_início'])) || 0,
            resumo: get(['resumo', 'Resumo', 'RESUMO']),
            setor: get(['setor', 'Setor', 'SETOR']),
            natureza_juridica: get(['natureza_juíridica_IBGE', 'natureza_juridica', 'Natureza jurídica (IBGE)', 'Natureza_Jurídica_IBGE']),
            link_principal: get(['link_principal', 'link de acesso', 'Link principal', 'Link de acesso']),
            link_de_apoio: get(['link_de_apoio', 'link de apoio', 'Link de apoio']),
            tipo_de_impacto: get(['tipo_de_impacto', 'tipo de impacto', 'Tipo de impacto', 'Tipo_de_impacto']),
            descricao_impacto: get(['descrições_do_tipo_de_impacto_e_obs.', 'descricao_impacto', 'descricoes', 'Descrição do tipo de impacto e obs.']),
            abrangência_da_atuacão: get(['abrangência_da_atuação', 'abrangencia', 'abrangência da atuação', 'Abrangência da atuação']),
            impacto_positivo: get(['impacto_positivo', 'impacto positivo', 'Impacto positivo', 'Impacto_Positivo']),
            orcamento: get(['orçamento_r$', 'orcamento', 'orçamento (R$)', 'Orçamento (R$)']),
            certificacoes: get(['certificações', 'certificacoes', 'Certificações']),
          };
        });

        uploadData(cleanData);
        setStatus('success');
        setMessage(`${cleanData.length} registros carregados com sucesso!`);
        setTimeout(() => {
          setIsUploadOpen(false);
          setStatus('idle');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(`Erro ao processar: ${err instanceof Error ? err.message : 'Desconhecido'}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  if (!isUploadOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsUploadOpen(false)}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Atualizar Dados</h3>
          <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {status === 'idle' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet size={28} className="text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">
                Selecione um arquivo Excel (.xlsx) com os dados atualizados.
              </p>
              <p className="text-xs text-slate-400 mb-4">
                A planilha deve conter as colunas: id, iniciativa, organização, ano de início, setor, natureza jurídica.
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Upload size={16} />
                Selecionar Arquivo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-700">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <p className="text-sm text-red-600 mb-3">{message}</p>
              <button
                onClick={() => { setStatus('idle'); setMessage(''); }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { DateRangePicker } from '@/presentation/components/ui/DateRangePicker';
import { Pagination } from '@/presentation/components/ui/Pagination';

// Types
type TransactionType = 'encaissement' | 'decaissement';
type TransactionStatus = 'validated' | 'pending' | 'rejected' | 'cancelled';
type PaymentMethod = 'virement' | 'cheque' | 'especes' | 'prelevement' | 'carte';

interface Transaction {
  id: string;
  reference: string;
  date: Date;
  type: TransactionType;
  category: string;
  subCategory: string;
  description: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  bankAccount: string;
  counterparty: string;
  createdBy: string;
  createdAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  tags?: string[];
}

// Mock data generator
const generateMockTransactions = (): Transaction[] => {
  const categories = {
    encaissement: [
      { cat: 'Ventes Énergie', subs: ['Particuliers', 'Entreprises', 'Industries'] },
      { cat: 'Subventions', subs: ['État', 'Collectivités'] },
      { cat: 'Autres Produits', subs: ['Intérêts', 'Cessions', 'Divers'] },
    ],
    decaissement: [
      { cat: 'Achats Énergie', subs: ['CI-ENERGIES', 'IPP'] },
      { cat: 'Personnel', subs: ['Salaires', 'Charges Sociales', 'Primes'] },
      { cat: 'Fonctionnement', subs: ['Fournitures', 'Services', 'Déplacements'] },
      { cat: 'Investissements', subs: ['Équipements', 'Infrastructures'] },
      { cat: 'Impôts', subs: ['TVA', 'IS', 'Autres Taxes'] },
    ],
  };

  const counterparties = {
    encaissement: ['Client A', 'Client B', 'Client C', 'Ministère Finances', 'SODECI', 'Particulier'],
    decaissement: ['CI-ENERGIES', 'AZITO', 'CIPREL', 'CNPS', 'DGI', 'Fournisseur X', 'Banque Y'],
  };

  const bankAccounts = ['BIAO CI - 001234', 'NSIA - 005678', 'SG - 009012', 'Ecobank - 003456'];
  const users = ['KOUASSI M.', 'TRAORE A.', 'KONAN B.', 'DIALLO S.'];
  const validators = ['KONE D.', 'BEDIE R.', 'OUATTARA K.'];
  const paymentMethods: PaymentMethod[] = ['virement', 'cheque', 'especes', 'prelevement', 'carte'];
  const statuses: TransactionStatus[] = ['validated', 'validated', 'validated', 'pending', 'rejected', 'cancelled'];

  const transactions: Transaction[] = [];

  for (let i = 0; i < 150; i++) {
    const type: TransactionType = Math.random() > 0.45 ? 'decaissement' : 'encaissement';
    const catList = categories[type];
    const selectedCat = catList[Math.floor(Math.random() * catList.length)];
    const selectedSub = selectedCat.subs[Math.floor(Math.random() * selectedCat.subs.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const transactionDate = new Date(createdDate);
    transactionDate.setDate(transactionDate.getDate() + Math.floor(Math.random() * 5));

    const baseAmount = type === 'encaissement'
      ? Math.random() * 500000000 + 10000000
      : Math.random() * 200000000 + 5000000;

    transactions.push({
      id: `TRX-${String(i + 1).padStart(5, '0')}`,
      reference: `${type === 'encaissement' ? 'ENC' : 'DEC'}-${2025}-${String(i + 1).padStart(6, '0')}`,
      date: transactionDate,
      type,
      category: selectedCat.cat,
      subCategory: selectedSub,
      description: `${selectedCat.cat} - ${selectedSub}`,
      amount: Math.round(baseAmount),
      status,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      bankAccount: bankAccounts[Math.floor(Math.random() * bankAccounts.length)],
      counterparty: counterparties[type][Math.floor(Math.random() * counterparties[type].length)],
      createdBy: users[Math.floor(Math.random() * users.length)],
      createdAt: createdDate,
      validatedBy: status === 'validated' ? validators[Math.floor(Math.random() * validators.length)] : undefined,
      validatedAt: status === 'validated' ? new Date(createdDate.getTime() + 86400000 * (1 + Math.random() * 3)) : undefined,
      tags: Math.random() > 0.7 ? ['urgent', 'prioritaire'].slice(0, Math.floor(Math.random() * 2) + 1) : undefined,
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const mockTransactions = generateMockTransactions();

const formatAmount = (value: number): string => {
  return value.toLocaleString('fr-FR') + ' FCFA';
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getStatusConfig = (status: TransactionStatus) => {
  const configs = {
    validated: { label: 'Validée', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: 'check_circle' },
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'schedule' },
    rejected: { label: 'Rejetée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: 'cancel' },
    cancelled: { label: 'Annulée', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400', icon: 'block' },
  };
  return configs[status];
};

const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels = {
    virement: 'Virement',
    cheque: 'Chèque',
    especes: 'Espèces',
    prelevement: 'Prélèvement',
    carte: 'Carte',
  };
  return labels[method];
};

const HistoriqueEcrituresPage: React.FC = () => {
  // State
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '2025-01-01',
    end: '2025-12-31',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | TransactionStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortField, setSortField] = useState<'date' | 'amount' | 'reference'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get unique values for filters
  const categories = useMemo(() => {
    const cats = new Set(mockTransactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, []);

  const bankAccounts = useMemo(() => {
    const banks = new Set(mockTransactions.map((t) => t.bankAccount));
    return Array.from(banks).sort();
  }, []);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    let result = mockTransactions.filter((t) => {
      // Date range
      if (t.date < startDate || t.date > endDate) return false;
      // Type
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      // Status
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      // Category
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      // Bank
      if (selectedBank !== 'all' && t.bankAccount !== selectedBank) return false;
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.reference.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.counterparty.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.getTime() - b.date.getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'reference') {
        comparison = a.reference.localeCompare(b.reference);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [dateRange, selectedType, selectedStatus, selectedCategory, selectedBank, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const stats = useMemo(() => {
    const filtered = filteredTransactions;
    const encaissements = filtered.filter((t) => t.type === 'encaissement');
    const decaissements = filtered.filter((t) => t.type === 'decaissement');

    return {
      total: filtered.length,
      totalEncaissements: encaissements.reduce((sum, t) => sum + t.amount, 0),
      totalDecaissements: decaissements.reduce((sum, t) => sum + t.amount, 0),
      countEncaissements: encaissements.length,
      countDecaissements: decaissements.length,
    };
  }, [filteredTransactions]);

  // Handle sort
  const handleSort = (field: 'date' | 'amount' | 'reference') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedBank('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Historique des Écritures
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Consultez l'ensemble des transactions enregistrées
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => {
              setDateRange(range);
              setCurrentPage(1);
            }}
          />
          <Button variant="outline" size="sm" icon="download">
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-zinc-600 dark:text-zinc-400">receipt_long</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase">Total Écritures</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600">trending_up</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase">Encaissements ({stats.countEncaissements})</p>
              <p className="text-lg font-black text-emerald-600">{(stats.totalEncaissements / 1000000000).toFixed(2)} Mds</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600">trending_down</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase">Décaissements ({stats.countDecaissements})</p>
              <p className="text-lg font-black text-red-600">{(stats.totalDecaissements / 1000000000).toFixed(2)} Mds</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase">Solde Net</p>
              <p className={`text-lg font-black ${stats.totalEncaissements - stats.totalDecaissements >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {((stats.totalEncaissements - stats.totalDecaissements) / 1000000000).toFixed(2)} Mds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher par référence, description, tiers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as 'all' | TransactionType);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tous types</option>
              <option value="encaissement">Encaissements</option>
              <option value="decaissement">Décaissements</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as 'all' | TransactionStatus);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tous statuts</option>
              <option value="validated">Validées</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejetées</option>
              <option value="cancelled">Annulées</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              icon={showFilters ? 'expand_less' : 'tune'}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtres
            </Button>

            {(searchQuery || selectedType !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedBank !== 'all') && (
              <Button variant="ghost" size="sm" icon="clear" onClick={resetFilters}>
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Compte Bancaire</label>
              <select
                value={selectedBank}
                onChange={(e) => {
                  setSelectedBank(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Tous les comptes</option>
                {bankAccounts.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div
            className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
            onClick={() => handleSort('reference')}
          >
            Référence
            {sortField === 'reference' && (
              <span className="material-symbols-outlined text-sm">
                {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            )}
          </div>
          <div
            className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
            onClick={() => handleSort('date')}
          >
            Date
            {sortField === 'date' && (
              <span className="material-symbols-outlined text-sm">
                {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            )}
          </div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-2">Tiers</div>
          <div
            className="col-span-2 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
            onClick={() => handleSort('amount')}
          >
            Montant
            {sortField === 'amount' && (
              <span className="material-symbols-outlined text-sm">
                {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            )}
          </div>
          <div className="col-span-1 text-center">Statut</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {paginatedTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-zinc-300 dark:text-zinc-600 mb-3">search_off</span>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Aucune écriture trouvée</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            paginatedTransactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              return (
                <div
                  key={transaction.id}
                  className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="col-span-2">
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{transaction.reference}</p>
                    <p className="text-xs text-zinc-500">{transaction.id}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{formatDate(transaction.date)}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${transaction.type === 'encaissement' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{transaction.category}</p>
                        <p className="text-xs text-zinc-500">{transaction.subCategory}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{transaction.counterparty}</p>
                    <p className="text-xs text-zinc-500">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className={`text-sm font-black ${transaction.type === 'encaissement' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {transaction.type === 'encaissement' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </p>
                    <p className="text-xs text-zinc-500">{transaction.bankAccount}</p>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${statusConfig.color}`}>
                      <span className="material-symbols-outlined text-sm">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Voir détails"
                    >
                      <span className="material-symbols-outlined text-lg text-zinc-500">visibility</span>
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Télécharger justificatif"
                    >
                      <span className="material-symbols-outlined text-lg text-zinc-500">download</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTransactions.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                  Détail de l'Écriture
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{selectedTransaction.reference}</p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Type and Status */}
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                  selectedTransaction.type === 'encaissement'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {selectedTransaction.type === 'encaissement' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                  {selectedTransaction.type === 'encaissement' ? 'Encaissement' : 'Décaissement'}
                </span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${getStatusConfig(selectedTransaction.status).color}`}>
                  <span className="material-symbols-outlined text-lg">{getStatusConfig(selectedTransaction.status).icon}</span>
                  {getStatusConfig(selectedTransaction.status).label}
                </span>
              </div>

              {/* Amount */}
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Montant</p>
                <p className={`text-3xl font-black ${
                  selectedTransaction.type === 'encaissement' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {selectedTransaction.type === 'encaissement' ? '+' : '-'}{formatAmount(selectedTransaction.amount)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Date Transaction</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Catégorie</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{selectedTransaction.category}</p>
                    <p className="text-sm text-zinc-500">{selectedTransaction.subCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Tiers</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{selectedTransaction.counterparty}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Mode de Paiement</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{getPaymentMethodLabel(selectedTransaction.paymentMethod)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Compte Bancaire</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{selectedTransaction.bankAccount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Créé par</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{selectedTransaction.createdBy}</p>
                    <p className="text-sm text-zinc-500">{formatDateTime(selectedTransaction.createdAt)}</p>
                  </div>
                  {selectedTransaction.validatedBy && (
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Validé par</p>
                      <p className="font-medium text-zinc-900 dark:text-white">{selectedTransaction.validatedBy}</p>
                      <p className="text-sm text-zinc-500">{selectedTransaction.validatedAt && formatDateTime(selectedTransaction.validatedAt)}</p>
                    </div>
                  )}
                  {selectedTransaction.tags && selectedTransaction.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTransaction.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Description</p>
                <p className="text-zinc-700 dark:text-zinc-300">{selectedTransaction.description}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="outline" size="md" icon="download">
                Télécharger PDF
              </Button>
              <Button variant="primary" size="md" icon="print">
                Imprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriqueEcrituresPage;

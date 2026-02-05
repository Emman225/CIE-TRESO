import React, { useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';

interface ConfigCrudPanelProps<T extends { id: string }> {
  title: string;
  subtitle?: string;
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  onNew: () => void;
  onSave: (item: T) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  renderListItem: (item: T, isSelected: boolean) => React.ReactNode;
  renderEditForm: (item: T, onChange: (item: T) => void) => React.ReactNode;
  isLoading?: boolean;
}

function ConfigCrudPanelInner<T extends { id: string }>({
  title,
  subtitle,
  items,
  selectedItem,
  onSelect,
  onNew,
  onSave,
  onDelete,
  renderListItem,
  renderEditForm,
  isLoading = false,
}: ConfigCrudPanelProps<T>) {
  const [editItem, setEditItem] = useState<T | null>(selectedItem);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync edit state when selected item changes externally
  React.useEffect(() => {
    setEditItem(selectedItem);
  }, [selectedItem]);

  const handleSave = async () => {
    if (!editItem) return;
    setIsSaving(true);
    try {
      await onSave(editItem);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!confirm('Voulez-vous vraiment supprimer cet element ? Cette action est irreversible.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(selectedItem.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleItemChange = (updated: T) => {
    setEditItem(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Panel - List (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/30">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="md"
              icon="add_circle"
              onClick={onNew}
            >
              NOUVEAU
            </Button>
          </div>

          {/* Item List */}
          <div className="p-8">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-zinc-300 dark:text-zinc-600">
                    inbox
                  </span>
                </div>
                <p className="text-sm font-bold text-zinc-400">
                  Aucun element configure
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className={`
                        flex items-center justify-between p-5
                        border rounded-2xl transition-all
                        cursor-pointer group active:scale-[0.99]
                        ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-inner'
                            : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 hover:border-primary/30'
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        {renderListItem(item, isSelected)}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {isSelected && (
                          <span className="hidden sm:inline text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full animate-pulse">
                            Edition active
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(item);
                            setTimeout(handleDelete, 0);
                          }}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Editor (1/3) */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-xl h-fit sticky top-24 overflow-hidden">
        {/* Editor Header */}
        <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/30">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined filled text-xl">
              settings_applications
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              Configuration Expert
            </h3>
            {selectedItem && (
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                ID: {selectedItem.id}
              </p>
            )}
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-8">
          {editItem ? (
            <div className="space-y-8">
              {renderEditForm(editItem, handleItemChange)}

              {/* Actions */}
              <div className="pt-4 flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  icon={isSaving ? undefined : 'save'}
                  isLoading={isSaving}
                  onClick={handleSave}
                  className="w-full shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:translate-y-[-2px] active:translate-y-0"
                >
                  {isSaving ? 'TRAITEMENT...' : 'ENREGISTRER LES MODIFICATIONS'}
                </Button>
                <button
                  onClick={() => setEditItem(selectedItem)}
                  className="w-full py-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                >
                  Annuler les changements
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 gap-4 text-center">
              <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-zinc-300 dark:text-zinc-600">
                  touch_app
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-400">
                Selectionnez un element pour le configurer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ConfigCrudPanel = ConfigCrudPanelInner;
export default ConfigCrudPanel;

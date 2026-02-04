'use client';

import { useState } from 'react';
import { VariantGroup, VariantOption } from '@/types/variants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Plus, Edit2 } from 'lucide-react';

interface VariantManagerProps {
  variants: VariantGroup[];
  onChange: (variants: VariantGroup[]) => void;
}

/**
 * Componente para que el admin gestione variantes de un producto
 * Permite crear, editar y eliminar grupos y opciones de variantes
 */
export function VariantManager({ variants, onChange }: VariantManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'required' | 'optional'>('required');
  const [groupDescription, setGroupDescription] = useState('');
  const [options, setOptions] = useState<VariantOption[]>([]);

  // Abrir dialog para nuevo grupo
  const handleNewGroup = () => {
    setEditingGroupId(null);
    setGroupName('');
    setGroupType('required');
    setGroupDescription('');
    setOptions([]);
    setShowDialog(true);
  };

  // Abrir dialog para editar grupo
  const handleEditGroup = (group: VariantGroup) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupType(group.type);
    setGroupDescription(group.description || '');
    setOptions(group.options);
    setShowDialog(true);
  };

  // Guardar grupo
  const handleSaveGroup = () => {
    if (!groupName.trim() || options.length === 0) {
      alert('Debes ingresar un nombre y al menos una opción');
      return;
    }

    const newGroup: VariantGroup = {
      id: editingGroupId || `group-${Date.now()}`,
      name: groupName,
      type: groupType,
      description: groupDescription,
      options,
    };

    if (editingGroupId) {
      // Editar grupo existente
      onChange(
        variants.map((v) => (v.id === editingGroupId ? newGroup : v))
      );
    } else {
      // Agregar nuevo grupo
      onChange([...variants, newGroup]);
    }

    setShowDialog(false);
  };

  // Eliminar grupo
  const handleDeleteGroup = (groupId: string) => {
    if (confirm('¿Estás seguro que querés eliminar este grupo?')) {
      onChange(variants.filter((v) => v.id !== groupId));
    }
  };

  // Agregar opción
  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        id: `opt-${Date.now()}`,
        label: '',
        priceModifier: 0,
      },
    ]);
  };

  // Actualizar opción
  const handleUpdateOption = (index: number, key: keyof VariantOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [key]: value,
    };
    setOptions(newOptions);
  };

  // Eliminar opción
  const handleDeleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Variantes del producto</Label>
        <Button type="button" onClick={handleNewGroup} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Agregar grupo
        </Button>
      </div>

      {/* Lista de grupos */}
      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Sin variantes. Agrega un grupo para permitir personalizaciones.
        </p>
      ) : (
        <div className="space-y-2">
          {variants.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{group.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      group.type === 'required'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {group.type === 'required' ? 'Obligatorio' : 'Opcional'}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                  )}
                  <div className="text-sm">
                    <p className="font-medium mb-1">Opciones ({group.options.length}):</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {group.options.map((opt) => (
                        <li key={opt.id}>
                          • {opt.label}
                          {opt.priceModifier !== undefined && opt.priceModifier !== 0 && (
                            <span className="text-primary ml-2">
                              +${opt.priceModifier.toFixed(2)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    type="button"
                    onClick={() => handleEditGroup(group)}
                    variant="ghost"
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleDeleteGroup(group.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de edición */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGroupId ? 'Editar grupo' : 'Nuevo grupo de variantes'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nombre del grupo */}
            <div>
              <Label htmlFor="group-name">Nombre del grupo *</Label>
              <Input
                id="group-name"
                placeholder="Ej: Tamaño, Color, Extras"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="group-type">Tipo *</Label>
              <Select value={groupType} onValueChange={(v: any) => setGroupType(v)}>
                <SelectTrigger id="group-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Obligatorio (radio)</SelectItem>
                  <SelectItem value="optional">Opcional (checkbox)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="group-desc">Descripción (opcional)</Label>
              <Input
                id="group-desc"
                placeholder="Ayuda a tus clientes a entender qué elegir"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>

            {/* Opciones */}
            <div>
              <Label className="mb-2 block">Opciones *</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {options.map((option, index) => (
                  <div key={option.id} className="flex gap-2 items-end p-2 bg-secondary/50 rounded">
                    <div className="flex-1">
                      <Input
                        placeholder="Nombre de la opción"
                        value={option.label}
                        onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                        size={30}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Precio"
                        step="0.01"
                        value={option.priceModifier || 0}
                        onChange={(e) => handleUpdateOption(index, 'priceModifier', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleDeleteOption(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={handleAddOption}
                variant="outline"
                size="sm"
                className="mt-2 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar opción
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveGroup}>
              {editingGroupId ? 'Actualizar' : 'Crear'} grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

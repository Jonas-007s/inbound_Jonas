'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import InventoryForm from '@/components/InventoryForm';
import InventoryTable from '@/components/InventoryTable';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  location: string;
  user: string;
  date: string;
  images: string[];
}

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedItems = localStorage.getItem('inventoryItems');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error al cargar datos desde localStorage:', error);
        // Mostrar una notificación al usuario sobre el error de carga
        setNotification({ message: 'Error al cargar los datos guardados. Es posible que estén corruptos.', type: 'error' });
      }
    }
  }, []);

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem('inventoryItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error);
      // Opcional: Mostrar una notificación al usuario sobre el error de guardado
      setNotification({ message: 'Error al guardar los datos. El almacenamiento podría estar lleno.', type: 'error' });
    }
  }, [items]);

  const handleAddItem = (newItem: InventoryItem) => {
    if (itemToEdit) {
      // Actualizar ítem existente
      setItems(prevItems => 
        prevItems.map(item => item.id === newItem.id ? newItem : item)
      );
      setNotification({ message: 'Ítem actualizado correctamente', type: 'success' });
      setShowForm(false); // Ocultar formulario después de editar
      setItemToEdit(null); // Resetear itemToEdit después de editar
    } else {
      // Añadir nuevo ítem
      setItems(prevItems => [...prevItems, newItem]);
      setNotification({ message: 'Ítem añadido correctamente', type: 'success' });
      // No ocultar el formulario (setShowForm(false)) para permitir añadir más ítems.
      // El resetForm dentro de InventoryForm limpiará los campos.
      // No es necesario resetear itemToEdit aquí porque ya es null al añadir.
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setShowForm(true);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    setNotification({ message: 'Ítem eliminado correctamente', type: 'success' });
  };

  const handleCancelEdit = () => {
    setItemToEdit(null);
    setShowForm(false);
  };

  // Limpiar notificación después de 3 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4 md:mb-0">
          <Image
            src="/file.svg" 
            alt="Logo"
            width={32}
            height={32}
            className="mr-3 dark:invert"
          />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Sistema de Registro de Inventario</h1>
        </div>
        <div className="w-full md:w-auto">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-1"
          >
            {showForm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Añadir Nuevo Ítem</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-6">
        {showForm && (
          <InventoryForm 
            onAddItem={handleAddItem} 
            itemToEdit={itemToEdit} 
            onCancelEdit={handleCancelEdit} 
          />
        )}
        
        <InventoryTable 
          items={items} 
          onEditItem={handleEditItem} 
          onDeleteItem={handleDeleteItem} 
        />
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2024 Registro de Inventario - Jonas_007</p>
      </footer>
    </div>
  );
}

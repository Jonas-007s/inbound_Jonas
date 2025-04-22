'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

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

interface InventoryFormProps {
  onAddItem: (item: InventoryItem) => void;
  itemToEdit?: InventoryItem | null;
  onCancelEdit?: () => void;
}

export default function InventoryForm({ onAddItem, itemToEdit, onCancelEdit }: InventoryFormProps) {
  const [name, setName] = useState(itemToEdit?.name || '');
  const [quantity, setQuantity] = useState(itemToEdit?.quantity !== undefined && itemToEdit?.quantity !== null && itemToEdit.quantity !== 0 ? itemToEdit.quantity.toString() : '');
  const [description, setDescription] = useState(itemToEdit?.description || '');
  const [location, setLocation] = useState(itemToEdit?.location || '');
  const [user, setUser] = useState(itemToEdit?.user || '');
  const [images, setImages] = useState<string[]>(itemToEdit?.images || []);
  const [previewImages, setPreviewImages] = useState<string[]>(itemToEdit?.images || []);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !quantity || !location || !user) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    const newItem: InventoryItem = {
      id: itemToEdit?.id || Date.now().toString(),
      name,
      quantity: parseInt(quantity) || 0,
      description,
      location,
      user,
      date: itemToEdit?.date || new Date().toISOString(),
      images: [...previewImages]
    };

    onAddItem(newItem);
    resetForm();
  };

  const resetForm = () => {
    if (!itemToEdit) {
      setName('');
      setQuantity('');
      setDescription('');
      setLocation('');
      setUser('');
      setImages([]);
      setPreviewImages([]);
    }
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviewImages: string[] = [...previewImages];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageUrl = event.target.result as string;
          newImages.push(imageUrl);
          newPreviewImages.push(imageUrl);
          setImages([...images, ...newImages]);
          setPreviewImages(newPreviewImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...previewImages];
    updatedImages.splice(index, 1);
    setPreviewImages(updatedImages);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        {itemToEdit ? 'Editar Ítem' : 'Registrar Nuevo Ítem'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nombre del ítem"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cantidad*
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                // Permitir vacío, solo números
                if (/^\d*$/.test(value)) {
                  setQuantity(value);
                }
              }}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-blue-500 focus:ring-2 focus:ring-blue-400"
              required
              placeholder="Cantidad"
              aria-label="Cantidad"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
            placeholder="Descripción detallada del ítem"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación*
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ubicación del ítem"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usuario*
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nombre del usuario"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Imágenes
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="ml-2">Subir imagen</span>
            </button>
            
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="ml-2">Tomar foto</span>
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              multiple
            />
            
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              capture="environment"
            />
          </div>
          
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {previewImages.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <Image 
                      src={img} 
                      alt={`Preview ${index}`} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          {itemToEdit && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center text-base focus:outline-blue-500 focus:ring-2 focus:ring-blue-400"
              aria-label="Cancelar edición"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm flex items-center justify-center text-base focus:outline-blue-500 focus:ring-2 focus:ring-blue-400"
            aria-label={itemToEdit ? 'Actualizar ítem' : 'Registrar ítem'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {itemToEdit ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
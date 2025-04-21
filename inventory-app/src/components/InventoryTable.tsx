'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

interface InventoryTableProps {
  items: InventoryItem[];
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryTable({ items, onEditItem, onDeleteItem }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(items);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = items.filter(item => {
        return (
          item.name.toLowerCase().includes(lowercasedTerm) ||
          item.description.toLowerCase().includes(lowercasedTerm) ||
          item.location.toLowerCase().includes(lowercasedTerm) ||
          item.user.toLowerCase().includes(lowercasedTerm) ||
          item.quantity.toString().includes(lowercasedTerm) ||
          new Date(item.date).toLocaleDateString().includes(lowercasedTerm)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  const confirmDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleDelete = (id: string) => {
    onDeleteItem(id);
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // La función formatDate ya está definida arriba

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Create a new zip file
      const zip = new JSZip();
      
      // Create a folder for images
      const imgFolder = zip.folder('images');
      
      // Prepare data for Excel
      const excelData = await Promise.all(items.map(async (item, index) => {
        const imageLinks = [];
        
        // Process each image
        for (let i = 0; i < item.images.length; i++) {
          const imgData = item.images[i];
          const imgName = `item_${item.id}_image_${i}.jpg`;
          
          // Convert base64 to blob and add to zip
          if (imgData.startsWith('data:image')) {
            const base64Data = imgData.split(',')[1];
            if (imgFolder && base64Data) {
              imgFolder.file(imgName, base64Data, { base64: true });
            }
          }
          
          imageLinks.push(`images/${imgName}`);
        }
        
        return {
          'ID': item.id,
          'Nombre': item.name,
          'Cantidad': item.quantity,
          'Descripción': item.description,
          'Ubicación': item.location,
          'Usuario': item.user,
          'Fecha/Hora': formatDate(item.date),
          'Imágenes': imageLinks.join(', ')
        };
      }));
      
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
      
      // Convert to binary and add to zip
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      zip.file('inventario.xlsx', excelBuffer);
      
      // Generate and download the zip file
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, 'inventario_completo.zip');
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error al exportar:', error);
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Inventario</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar ítems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <button
            onClick={exportToExcel}
            disabled={isExporting || items.length === 0}
            className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors shadow-sm ${isExporting || items.length === 0 ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white font-medium'}`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportando...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar a Excel
              </>
            )}
          </button>
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {items.length === 0 ? 'No hay ítems registrados' : 'No se encontraron ítems que coincidan con la búsqueda'}
        </div>
      ) : (
        <>
          {/* Mobile view */}
          <div className="block lg:hidden space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {item.quantity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Ubicación:</span> {item.location}
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span> {item.user}
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span> {formatDate(item.date)}
                  </div>
                </div>
                
                {item.images.length > 0 && (
                  <div className="flex overflow-x-auto space-x-2 pb-2 mb-3">
                    {item.images.map((img, index) => (
                      <div key={index} className="flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image src={img} alt={`${item.name} image ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEditItem(item)}
                    className="flex items-center justify-center px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  
                  {showDeleteConfirm === item.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center justify-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 rounded-md transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="flex items-center justify-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cantidad</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ubicación</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha/Hora</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Imágenes</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(item.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.images.length > 0 ? (
                        <div className="flex space-x-1">
                          {item.images.slice(0, 3).map((img, index) => (
                            <div key={index} className="w-8 h-8 relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                              <Image src={img} alt={`${item.name} image ${index + 1}`} fill className="object-cover" />
                            </div>
                          ))}
                          {item.images.length > 3 && (
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 text-xs">
                              +{item.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onEditItem(item)}
                          className="flex items-center justify-center px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        
                        {showDeleteConfirm === item.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center justify-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 rounded-md transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirmar
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => confirmDelete(item.id)}
                            className="flex items-center justify-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 rounded-md transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
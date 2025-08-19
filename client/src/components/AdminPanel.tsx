import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Save, Eye } from 'lucide-react';
import { products } from '../data/products';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductImage {
  productId: string;
  fileName: string;
  file: File;
  preview: string;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products to show only panel products (not accessories)
  const panelProducts = products.filter(product => product.category !== 'accessories');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!selectedProduct) {
      alert('Сначала выберите товар');
      return;
    }

    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const fileName = `${selectedProduct}-${uploadedImages.filter(img => img.productId === selectedProduct).length + index + 1}.${file.name.split('.').pop()}`;
        const preview = URL.createObjectURL(file);
        
        setUploadedImages(prev => [...prev, {
          productId: selectedProduct,
          fileName,
          file,
          preview
        }]);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const saveImages = async () => {
    if (uploadedImages.length === 0) {
      alert('Нет изображений для сохранения');
      return;
    }

    setIsLoading(true);
    try {
      // Group images by product
      const imagesByProduct = uploadedImages.reduce((acc, img) => {
        if (!acc[img.productId]) {
          acc[img.productId] = [];
        }
        acc[img.productId].push(img);
        return acc;
      }, {} as Record<string, ProductImage[]>);

      // Save images for each product
      for (const [productId, images] of Object.entries(imagesByProduct)) {
        const product = products.find(p => p.id === productId);
        if (!product) continue;

        const collection = product.collection;
        const folderName = getFolderName(collection);

        // Create FormData for multiple files
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('collection', collection);
        formData.append('folder', folderName);

        images.forEach((img, index) => {
          formData.append(`image_${index}`, img.file, img.fileName);
        });

        // Send to backend
        const response = await fetch('/api/admin/upload-images', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload images for product ${productId}`);
        }
      }

      alert('Изображения успешно сохранены! Перезагрузите страницу для обновления.');
      setUploadedImages([]);
      onClose();
    } catch (error) {
      console.error('Error saving images:', error);
      alert('Ошибка при сохранении изображений');
    } finally {
      setIsLoading(false);
    }
  };

  const getFolderName = (collection: string): string => {
    const folderMap: Record<string, string> = {
      'МАГИЯ БЕТОНА': 'concrete',
      'ТКАНЕВАЯ РОСКОШЬ': 'fabric',
      'МАТОВАЯ ЭСТЕТИКА': 'matte',
      'МРАМОРНАЯ ФЕЕРИЯ': 'marble',
      'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ': 'accessories'
    };
    return folderMap[collection] || 'concrete';
  };

  const getProductsBySelection = () => {
    if (!selectedProduct) return [];
    return uploadedImages.filter(img => img.productId === selectedProduct);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-[#E95D22] to-[#D84315]">
          <h2 className="text-2xl font-bold text-white">Админ-панель загрузки изображений</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Инструкция по загрузке:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Выберите товар из списка</li>
              <li>2. Загрузите изображения (JPG, PNG)</li>
              <li>3. Изображения будут автоматически переименованы в формат: КОД-НОМЕР.расширение</li>
              <li>4. Нажмите "Сохранить" для применения изменений</li>
              <li>5. Перезагрузите страницу для обновления каталога</li>
            </ol>
          </div>

          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите товар:
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
            >
              <option value="">-- Выберите товар --</option>
              {panelProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.id} - {product.design} ({product.format}) - {product.collection}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Загрузить изображения:
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                selectedProduct 
                  ? 'border-gray-300 hover:border-[#E95D22] cursor-pointer' 
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              }`}
              onClick={() => selectedProduct && fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">
                {selectedProduct 
                  ? 'Нажмите для выбора изображений или перетащите их сюда'
                  : 'Сначала выберите товар'
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Поддерживаются форматы: JPG, PNG
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={!selectedProduct}
            />
          </div>

          {/* Preview Images */}
          {getProductsBySelection().length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Предпросмотр для товара {selectedProduct}:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getProductsBySelection().map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={img.preview}
                        alt={img.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => removeImage(uploadedImages.findIndex(image => image === img))}
                        className="text-white hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate" title={img.fileName}>
                      {img.fileName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All uploaded images summary */}
          {uploadedImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Сводка загруженных изображений:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(
                  uploadedImages.reduce((acc, img) => {
                    if (!acc[img.productId]) acc[img.productId] = 0;
                    acc[img.productId]++;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([productId, count]) => {
                  const product = products.find(p => p.id === productId);
                  return (
                    <div key={productId} className="flex justify-between items-center py-2">
                      <span className="font-medium">
                        {productId} - {product?.design}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} изображени{count === 1 ? 'е' : count < 5 ? 'я' : 'й'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Загружено изображений: {uploadedImages.length}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={saveImages}
              disabled={uploadedImages.length === 0 || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                uploadedImages.length === 0 || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#E95D22] text-white hover:bg-[#D84315]'
              }`}
            >
              <Save size={16} />
              {isLoading ? 'Сохранение...' : `Сохранить (${uploadedImages.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
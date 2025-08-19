import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Save, Eye, FileText, Plus, Edit } from 'lucide-react';
import { products } from '../data/products';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Certificate, insertCertificateSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

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

interface ExistingImage {
  productId: string;
  fileName: string;
  url: string;
}

type AdminTab = 'images' | 'certificates';

const certificateFormSchema = insertCertificateSchema.extend({
  // Form validation schema with required fields
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  issueDate: z.string().min(1, 'Дата выдачи обязательна'),
  validUntil: z.string().min(1, 'Срок действия обязателен'),
  issuer: z.string().min(1, 'Орган выдачи обязателен'),
  number: z.string().min(1, 'Номер сертификата обязателен'),
  size: z.string().min(1, 'Размер файла обязателен'),
});

type CertificateFormData = z.infer<typeof certificateFormSchema>;

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('images');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Certificate form
  const certificateForm = useForm<CertificateFormData>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      title: '',
      description: '',
      issueDate: '',
      validUntil: '',
      issuer: '',
      number: '',
      size: '',
      imageUrl: '',
      fileUrl: '',
      sortOrder: 0,
    },
  });

  // Queries and mutations for certificates
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates'],
  });

  const createCertificateMutation = useMutation({
    mutationFn: async (data: CertificateFormData) => {
      return apiRequest('/api/certificates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      setShowCertificateForm(false);
      certificateForm.reset();
      toast({
        title: 'Успешно',
        description: 'Сертификат создан',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать сертификат',
        variant: 'destructive',
      });
    },
  });

  const updateCertificateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CertificateFormData> }) => {
      return apiRequest(`/api/certificates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      setEditingCertificate(null);
      setShowCertificateForm(false);
      certificateForm.reset();
      toast({
        title: 'Успешно',
        description: 'Сертификат обновлен',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить сертификат',
        variant: 'destructive',
      });
    },
  });

  const deleteCertificateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/certificates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      toast({
        title: 'Успешно',
        description: 'Сертификат удален',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сертификат',
        variant: 'destructive',
      });
    },
  });

  // Certificate form handlers
  const startEditingCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setShowCertificateForm(true);
    certificateForm.reset({
      title: certificate.title,
      description: certificate.description,
      issueDate: certificate.issueDate,
      validUntil: certificate.validUntil,
      issuer: certificate.issuer,
      number: certificate.number,
      size: certificate.size,
      imageUrl: certificate.imageUrl || '',
      fileUrl: certificate.fileUrl || '',
      sortOrder: certificate.sortOrder,
    });
  };

  const handleSubmitCertificate = (data: CertificateFormData) => {
    if (editingCertificate) {
      updateCertificateMutation.mutate({
        id: editingCertificate.id,
        data,
      });
    } else {
      createCertificateMutation.mutate(data);
    }
  };

  const handleDeleteCertificate = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот сертификат?')) {
      deleteCertificateMutation.mutate(id);
    }
  };

  // Filter products to show only panel products (not accessories)
  const panelProducts = products.filter(product => product.category !== 'accessories');

  // Load existing images when product is selected
  const loadExistingImages = async (productId: string) => {
    if (!productId) {
      setExistingImages([]);
      return;
    }

    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const folderName = getFolderName(product.collection);
      const response = await fetch(`/api/admin/product-images/${productId}?folder=${folderName}`);
      
      if (response.ok) {
        const data = await response.json();
        const existingImgs: ExistingImage[] = data.images.map((fileName: string) => ({
          productId,
          fileName,
          url: `/src/assets/products/${folderName}/${fileName}`
        }));
        setExistingImages(existingImgs);
      }
    } catch (error) {
      console.error('Error loading existing images:', error);
      setExistingImages([]);
    }
  };

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

  // Load existing images when product selection changes
  useEffect(() => {
    loadExistingImages(selectedProduct);
  }, [selectedProduct]);

  const processFiles = (files: File[]) => {
    if (!selectedProduct) {
      alert('Сначала выберите товар');
      return;
    }

    // Get current count including both existing and uploaded images
    const currentCount = existingImages.length + uploadedImages.filter(img => img.productId === selectedProduct).length;

    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const fileName = `${selectedProduct}-${currentCount + index + 1}.${file.name.split('.').pop()}`;
        const preview = URL.createObjectURL(file);
        
        setUploadedImages(prev => [...prev, {
          productId: selectedProduct,
          fileName,
          file,
          preview
        }]);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeExistingImage = async (image: ExistingImage) => {
    if (!confirm(`Удалить изображение ${image.fileName}? Это действие необратимо.`)) {
      return;
    }

    try {
      setIsLoading(true);
      const product = products.find(p => p.id === image.productId);
      if (!product) return;

      const folderName = getFolderName(product.collection);
      
      const response = await fetch('/api/admin/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: image.productId,
          fileName: image.fileName,
          folder: folderName
        })
      });

      if (response.ok) {
        // Remove from state
        setExistingImages(prev => prev.filter(img => img !== image));
        alert('Изображение удалено!');
      } else {
        alert('Ошибка при удалении изображения');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Ошибка при удалении изображения');
    } finally {
      setIsLoading(false);
    }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-[#E95D22] to-[#D84315]">
          <h2 className="text-2xl font-bold text-white">Админ-панель</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'border-b-2 border-[#E95D22] text-[#E95D22] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={16} />
              Изображения
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'certificates'
                  ? 'border-b-2 border-[#E95D22] text-[#E95D22] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={16} />
              Сертификаты
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'images' && (
            <div className="p-6 space-y-6">
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
          <div>
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
          <div>
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

          {/* Existing Images */}
          {selectedProduct && existingImages.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Существующие изображения ({existingImages.length})
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={img.url}
                        alt={img.fileName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = '/api/placeholder/150x150';
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => removeExistingImage(img)}
                        className="text-white hover:text-red-400 transition-colors"
                        disabled={isLoading}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Сохранен
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate" title={img.fileName}>
                      {img.fileName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {getProductsBySelection().length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                К загрузке ({getProductsBySelection().length})
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto">
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
                        onClick={() => removeUploadedImage(uploadedImages.findIndex(image => image === img))}
                        className="text-white hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Новый
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate" title={img.fileName}>
                      {img.fileName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compact Summary */}
          {(existingImages.length > 0 || uploadedImages.length > 0) && selectedProduct && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">
                  Товар: {selectedProduct} - {products.find(p => p.id === selectedProduct)?.design}
                </span>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Существующих: {existingImages.length}</span>
                  <span>К загрузке: {uploadedImages.length}</span>
                </div>
              </div>
            </div>
          )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="p-6 space-y-6">
              {/* Certificates Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Управление сертификатами</h3>
                <button
                  onClick={() => {
                    setEditingCertificate(null);
                    setShowCertificateForm(true);
                    certificateForm.reset();
                  }}
                  className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Добавить сертификат
                </button>
              </div>

              {/* Certificate Form */}
              {showCertificateForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4">
                    {editingCertificate ? 'Редактировать сертификат' : 'Новый сертификат'}
                  </h4>
                  <form onSubmit={certificateForm.handleSubmit(handleSubmitCertificate)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                        <input
                          {...certificateForm.register('title')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="Название сертификата"
                        />
                        {certificateForm.formState.errors.title && (
                          <p className="text-red-500 text-sm mt-1">{certificateForm.formState.errors.title.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Номер сертификата</label>
                        <input
                          {...certificateForm.register('number')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="Номер сертификата"
                        />
                        {certificateForm.formState.errors.number && (
                          <p className="text-red-500 text-sm mt-1">{certificateForm.formState.errors.number.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                      <textarea
                        {...certificateForm.register('description')}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                        placeholder="Описание сертификата"
                      />
                      {certificateForm.formState.errors.description && (
                        <p className="text-red-500 text-sm mt-1">{certificateForm.formState.errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Дата выдачи</label>
                        <input
                          {...certificateForm.register('issueDate')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="15.03.2024"
                        />
                        {certificateForm.formState.errors.issueDate && (
                          <p className="text-red-500 text-sm mt-1">{certificateForm.formState.errors.issueDate.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Действителен до</label>
                        <input
                          {...certificateForm.register('validUntil')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="15.03.2027"
                        />
                        {certificateForm.formState.errors.validUntil && (
                          <p className="text-red-500 text-sm mt-1">{certificateForm.formState.errors.validUntil.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Размер файла</label>
                        <input
                          {...certificateForm.register('size')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="2.1 МБ"
                        />
                        {certificateForm.formState.errors.size && (
                          <p className="text-red-500 text-sm mt-1">{certificateForm.formState.errors.size.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Орган выдачи</label>
                      <input
                        {...certificateForm.register('issuer')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                        placeholder="ФБУ Ростест-Москва"
                      />
                      {certificateForm.formState.errors.issuer && (
                        <p className="text-red-500 text-sm mt-1">{certificateForm.formState.errors.issuer.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL изображения (опционально)</label>
                        <input
                          {...certificateForm.register('imageUrl')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL файла (опционально)</label>
                        <input
                          {...certificateForm.register('fileUrl')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="https://example.com/certificate.pdf"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Порядок сортировки</label>
                      <input
                        type="number"
                        {...certificateForm.register('sortOrder', { valueAsNumber: true })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCertificateForm(false);
                          setEditingCertificate(null);
                          certificateForm.reset();
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        disabled={createCertificateMutation.isPending || updateCertificateMutation.isPending}
                        className="bg-[#E95D22] text-white px-6 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors disabled:opacity-50"
                      >
                        {createCertificateMutation.isPending || updateCertificateMutation.isPending
                          ? 'Сохранение...'
                          : editingCertificate
                          ? 'Обновить'
                          : 'Создать'
                        }
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Certificates List */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Список сертификатов</h4>
                {certificatesLoading ? (
                  <div className="text-center py-8">Загрузка сертификатов...</div>
                ) : certificates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Сертификаты не найдены</div>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">{cert.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>Выдан: {cert.issueDate}</span>
                              <span>До: {cert.validUntil}</span>
                              <span>№: {cert.number}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingCertificate(cert)}
                              className="text-blue-600 hover:text-blue-700 p-2"
                              title="Редактировать"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCertificate(cert.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                              title="Удалить"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - показывать только для вкладки изображений */}
        {activeTab === 'images' && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Существующих: {existingImages.length} | Новых для загрузки: {uploadedImages.length}
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
        )}
      </div>
    </div>
  );
}
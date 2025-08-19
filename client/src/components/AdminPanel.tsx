import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Save, Eye, FileText, Plus, Edit, Play, Database, Download } from 'lucide-react';
import { products } from '../data/products';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Certificate, insertCertificateSchema, VideoInstruction, insertVideoInstructionSchema, HeroImage, insertHeroImageSchema } from '@shared/schema';
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

type AdminTab = 'images' | 'certificates' | 'videos' | 'catalog' | 'hero';

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

const videoFormSchema = insertVideoInstructionSchema.extend({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  duration: z.string().min(1, 'Длительность обязательна'),
  category: z.string().min(1, 'Категория обязательна'),
  videoUrl: z.string().min(1, 'URL видео обязателен'),
});

const heroImageFormSchema = insertHeroImageSchema.extend({
  title: z.string().min(1, 'Заголовок обязателен'),
  imageUrl: z.string().min(1, 'URL изображения обязателен'),
});

type CertificateFormData = z.infer<typeof certificateFormSchema>;
type VideoFormData = z.infer<typeof videoFormSchema>;
type HeroImageFormData = z.infer<typeof heroImageFormSchema>;

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('images');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoInstruction | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingHeroImage, setEditingHeroImage] = useState<HeroImage | null>(null);
  const [showHeroForm, setShowHeroForm] = useState(false);
  
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
      return apiRequest('POST', '/api/certificates', data);
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
      return apiRequest('PUT', `/api/certificates/${id}`, data);
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
      return apiRequest('DELETE', `/api/certificates/${id}`);
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

  // Video form
  const videoForm = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: '',
      category: '',
      videoUrl: '',
      thumbnailUrl: '',
      sortOrder: 0,
    },
  });

  // Queries and mutations for videos
  const { data: videos = [], isLoading: videosLoading } = useQuery<VideoInstruction[]>({
    queryKey: ['/api/video-instructions'],
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      return apiRequest('POST', '/api/video-instructions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-instructions'] });
      setShowVideoForm(false);
      videoForm.reset();
      toast({
        title: 'Успешно',
        description: 'Видеоинструкция создана',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать видеоинструкцию',
        variant: 'destructive',
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VideoFormData> }) => {
      return apiRequest('PUT', `/api/video-instructions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-instructions'] });
      setEditingVideo(null);
      setShowVideoForm(false);
      videoForm.reset();
      toast({
        title: 'Успешно',
        description: 'Видеоинструкция обновлена',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить видеоинструкцию',
        variant: 'destructive',
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/video-instructions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-instructions'] });
      toast({
        title: 'Успешно',
        description: 'Видеоинструкция удалена',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить видеоинструкцию',
        variant: 'destructive',
      });
    },
  });

  // Video form handlers
  const startEditingVideo = (video: VideoInstruction) => {
    setEditingVideo(video);
    setShowVideoForm(true);
    videoForm.reset({
      title: video.title,
      description: video.description,
      duration: video.duration,
      category: video.category,
      videoUrl: video.videoUrl || '',
      thumbnailUrl: video.thumbnailUrl || '',
      sortOrder: video.sortOrder ?? 0,
    });
  };

  const handleSubmitVideo = (data: VideoFormData) => {
    if (editingVideo) {
      updateVideoMutation.mutate({
        id: editingVideo.id,
        data,
      });
    } else {
      createVideoMutation.mutate(data);
    }
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту видеоинструкцию?')) {
      deleteVideoMutation.mutate(id);
    }
  };

  // Hero image form
  const heroImageForm = useForm<HeroImageFormData>({
    resolver: zodResolver(heroImageFormSchema),
    defaultValues: {
      title: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: 1,
    },
  });

  // Queries and mutations for hero images
  // Fetch local hero images from admin API
  const { data: localHeroResponse, isLoading: heroImagesLoading, error: heroImagesError } = useQuery({
    queryKey: ['/api/admin/hero-images'],
    retry: 2,
    refetchOnMount: true,
  });

  // Convert local hero files to display format
  const heroImages = React.useMemo(() => {
    if (!localHeroResponse || typeof localHeroResponse !== 'object' || !('success' in localHeroResponse) || !localHeroResponse.success || !('images' in localHeroResponse) || !localHeroResponse.images) return [];
    
    return (localHeroResponse.images as string[]).map((fileName: string, index: number) => ({
      id: `local-hero-${index}`,
      title: `Hero изображение ${index + 1}`,
      imageUrl: `/src/assets/hero/${fileName}`,
      fileName: fileName,
      sortOrder: index,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }, [localHeroResponse]);

  const createHeroImageMutation = useMutation({
    mutationFn: async (data: HeroImageFormData) => {
      return apiRequest('POST', '/api/hero-images', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      setShowHeroForm(false);
      heroImageForm.reset();
      toast({
        title: 'Успешно',
        description: 'Изображение героя добавлено',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить изображение',
        variant: 'destructive',
      });
    },
  });

  const updateHeroImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HeroImageFormData> }) => {
      return apiRequest('PUT', `/api/hero-images/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-images'] });
      setEditingHeroImage(null);
      setShowHeroForm(false);
      heroImageForm.reset();
      toast({
        title: 'Успешно',
        description: 'Изображение героя обновлено',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить изображение',
        variant: 'destructive',
      });
    },
  });

  const deleteHeroImageMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const response = await fetch('/api/admin/delete-hero-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hero-images'] });
      toast({
        title: 'Успешно',
        description: 'Hero изображение удалено',
      });
    },
    onError: (error) => {
      console.error('Delete hero image error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить изображение',
        variant: 'destructive',
      });
    },
  });

  // Hero image form handlers
  const startEditingHeroImage = (heroImage: HeroImage) => {
    setEditingHeroImage(heroImage);
    setShowHeroForm(true);
    heroImageForm.reset({
      title: heroImage.title || '',
      imageUrl: heroImage.imageUrl,
      sortOrder: heroImage.sortOrder ?? 0,
      isActive: heroImage.isActive ?? 1,
    });
  };

  const handleSubmitHeroImage = (data: HeroImageFormData) => {
    if (editingHeroImage) {
      updateHeroImageMutation.mutate({
        id: editingHeroImage.id,
        data,
      });
    } else {
      createHeroImageMutation.mutate(data);
    }
  };

  const handleDeleteHeroImage = (fileName: string) => {
    if (confirm('Вы уверены, что хотите удалить это hero изображение?')) {
      deleteHeroImageMutation.mutate(fileName);
    }
  };

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
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'border-b-2 border-[#E95D22] text-[#E95D22] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Play size={16} />
              Видео
            </button>
            <button
              onClick={() => setActiveTab('hero')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'hero'
                  ? 'border-b-2 border-[#E95D22] text-[#E95D22] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} />
              Герой
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'border-b-2 border-[#E95D22] text-[#E95D22] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database size={16} />
              Каталог
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

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Управление видеоинструкциями</h3>
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setShowVideoForm(true);
                    videoForm.reset();
                  }}
                  className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Добавить видео
                </button>
              </div>

              {/* Video Form */}
              {showVideoForm && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4">
                    {editingVideo ? 'Редактировать видеоинструкцию' : 'Добавить новую видеоинструкцию'}
                  </h4>
                  
                  <form onSubmit={videoForm.handleSubmit(handleSubmitVideo)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Название *
                        </label>
                        <input
                          {...videoForm.register('title')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="Введите название видео"
                        />
                        {videoForm.formState.errors.title && (
                          <p className="text-red-600 text-sm mt-1">{videoForm.formState.errors.title.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Категория *
                        </label>
                        <select
                          {...videoForm.register('category')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                        >
                          <option value="">Выберите категорию</option>
                          <option value="подготовка">Подготовка</option>
                          <option value="монтаж">Монтаж</option>
                          <option value="уход">Уход</option>
                          <option value="обзоры">Обзоры</option>
                        </select>
                        {videoForm.formState.errors.category && (
                          <p className="text-red-600 text-sm mt-1">{videoForm.formState.errors.category.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание *
                      </label>
                      <textarea
                        {...videoForm.register('description')}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                        placeholder="Введите описание видео"
                      />
                      {videoForm.formState.errors.description && (
                        <p className="text-red-600 text-sm mt-1">{videoForm.formState.errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Длительность *
                        </label>
                        <input
                          {...videoForm.register('duration')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="5:30"
                        />
                        {videoForm.formState.errors.duration && (
                          <p className="text-red-600 text-sm mt-1">{videoForm.formState.errors.duration.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL видео *
                        </label>
                        <input
                          {...videoForm.register('videoUrl')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        {videoForm.formState.errors.videoUrl && (
                          <p className="text-red-600 text-sm mt-1">{videoForm.formState.errors.videoUrl.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Изображение превью
                        </label>
                        <div className="space-y-3">
                          <input
                            {...videoForm.register('thumbnailUrl')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                            placeholder="https://... или загрузите файл"
                          />
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">или</span>
                            <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                              <Upload size={16} />
                              Выбрать файл
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const dataUrl = event.target?.result as string;
                                      videoForm.setValue('thumbnailUrl', dataUrl);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          {/* Предварительный просмотр изображения */}
                          {videoForm.watch('thumbnailUrl') && (
                            <div className="mt-3">
                              <div className="relative inline-block">
                                <img
                                  src={videoForm.watch('thumbnailUrl') || ''}
                                  alt="Превью"
                                  className="w-32 h-20 object-cover rounded-lg border border-gray-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => videoForm.setValue('thumbnailUrl', '')}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                  title="Удалить изображение"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Порядок сортировки
                      </label>
                      <input
                        {...videoForm.register('sortOrder', { valueAsNumber: true })}
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowVideoForm(false);
                          setEditingVideo(null);
                          videoForm.reset();
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                        className="px-6 py-2 bg-[#E95D22] text-white rounded-lg hover:bg-[#d54a1a] transition-colors disabled:opacity-50"
                      >
                        {editingVideo ? 'Обновить' : 'Создать'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Videos List */}
              <div>
                {videosLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E95D22]"></div>
                    <p className="mt-2 text-gray-600">Загружаем видеоинструкции...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Видеоинструкции не найдены</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Play className={`w-6 h-6 text-gray-400 ${video.thumbnailUrl ? 'absolute' : ''}`} />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">{video.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>Категория: {video.category}</span>
                              <span>Длительность: {video.duration}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingVideo(video)}
                              className="text-blue-600 hover:text-blue-700 p-2"
                              title="Редактировать"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
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

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Управление каталогом</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Export Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="w-6 h-6 text-[#E95D22]" />
                      <h4 className="text-lg font-semibold text-gray-900">Выгрузка каталога</h4>
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                      Экспортируйте каталог товаров в различных форматах для обмена данными или резервного копирования.
                    </p>
                    
                    <div className="space-y-4">
                      <button className="w-full bg-[#E95D22] text-white px-4 py-3 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center justify-center gap-2">
                        <Download size={16} />
                        Скачать Excel (.xlsx)
                      </button>
                      
                      <button className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                        <Download size={16} />
                        Скачать CSV
                      </button>
                      
                      <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Download size={16} />
                        Скачать JSON
                      </button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Что включается в выгрузку:</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Полная информация о товарах</li>
                        <li>• Цены и характеристики</li>
                        <li>• Ссылки на изображения</li>
                        <li>• Категории и коллекции</li>
                        <li>• Статус наличия</li>
                      </ul>
                    </div>
                  </div>

                  {/* Import Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Upload className="w-6 h-6 text-[#E95D22]" />
                      <h4 className="text-lg font-semibold text-gray-900">Загрузка каталога</h4>
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                      Импортируйте данные каталога из файла для массового обновления товаров.
                    </p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#E95D22] transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Перетащите файл сюда или</p>
                      <button className="text-[#E95D22] hover:text-[#d54a1a] font-medium">
                        выберите файл
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Поддерживаются форматы: .xlsx, .csv, .json
                      </p>
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                      <h5 className="font-medium text-yellow-900 mb-2">Важные замечания:</h5>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Создайте резервную копию перед загрузкой</li>
                        <li>• Файл должен соответствовать шаблону</li>
                        <li>• Существующие товары будут обновлены</li>
                        <li>• Новые товары будут добавлены</li>
                      </ul>
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        Скачать шаблон
                      </button>
                      <button className="flex-1 bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors text-sm" disabled>
                        Загрузить файл
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Statistics Section */}
                <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Статистика каталога</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#E95D22] mb-1">
                        {products.filter(p => p.category !== 'accessories').length}
                      </div>
                      <div className="text-sm text-gray-600">Панели</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#E95D22] mb-1">
                        {products.filter(p => p.category === 'accessories').length}
                      </div>
                      <div className="text-sm text-gray-600">Аксессуары</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#E95D22] mb-1">
                        {new Set(products.map(p => p.collection)).size}
                      </div>
                      <div className="text-sm text-gray-600">Коллекции</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#E95D22] mb-1">
                        {products.filter(p => p.isPremium).length}
                      </div>
                      <div className="text-sm text-gray-600">Премиум</div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Последние операции</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-900">Выгрузка каталога Excel</span>
                      </div>
                      <span className="text-xs text-gray-500">2 часа назад</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-900">Загрузка обновлений цен</span>
                      </div>
                      <span className="text-xs text-gray-500">1 день назад</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-900">Экспорт для поставщика</span>
                      </div>
                      <span className="text-xs text-gray-500">3 дня назад</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Images Tab */}
          {activeTab === 'hero' && (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Изображения героя (главный слайдер)</h3>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Рекомендации:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Используйте изображения в соотношении 4:3 (например, 1920×1440)</li>
                  <li>• Оптимальный размер файла: до 2 МБ</li>
                  <li>• Поддерживаются форматы: JPG, PNG, WebP</li>
                  <li>• Изображения отображаются в порядке возрастания номера сортировки</li>
                </ul>
              </div>

              {/* Existing Hero Images */}
              {heroImagesLoading ? (
                <div className="p-8 text-center text-gray-500">Загрузка изображений...</div>
              ) : heroImages.length > 0 ? (
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Изображения в слайдере ({heroImages.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {heroImages.map((heroImage) => (
                      <div key={heroImage.id} className="relative group">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                          <img
                            src={heroImage.imageUrl}
                            alt={heroImage.title || 'Hero image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-xs text-gray-500">
                            Ошибка загрузки
                          </div>
                        </div>
                        
                        {/* Overlay with controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingHeroImage(heroImage)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                              title="Редактировать"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteHeroImage(heroImage.fileName)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                              title="Удалить"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Image info */}
                        <div className="mt-2 text-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {heroImage.title || 'Без заголовка'}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">#{heroImage.sortOrder}</span>
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                              heroImage.isActive === 1
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {heroImage.isActive === 1 ? 'Активно' : 'Неактивно'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Нет изображений героя</p>
                  <p className="text-sm">Добавьте первое изображение для главного слайдера</p>
                </div>
              )}

              {/* Add New Image Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Добавить новое изображение
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {/* Upload button */}
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#E95D22] hover:bg-orange-50 transition-all cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Выберите изображения для загрузки</p>
                      <p className="text-xs text-gray-500">можно выбрать несколько файлов сразу</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;

                        // Show loading state
                        toast({
                          title: 'Загрузка...',
                          description: `Загружаем ${files.length} изображений локально`,
                        });

                        try {
                          // Upload files to local hero folder
                          const formData = new FormData();
                          for (const file of files) {
                            formData.append('files', file);
                          }

                          const uploadResponse = await fetch('/api/admin/upload-hero-images', {
                            method: 'POST',
                            body: formData,
                          });

                          if (uploadResponse.ok) {
                            const uploadData = await uploadResponse.json();
                            
                            if (uploadData.success && uploadData.files) {
                              const successCount = uploadData.files.length;
                              
                              toast({
                                title: 'Успешно',
                                description: `Загружено ${successCount} hero изображений`,
                              });

                              // Refresh page to show new images
                              window.location.reload();
                            } else {
                              throw new Error('Upload failed');
                            }
                          } else {
                            throw new Error(`Server error: ${uploadResponse.status}`);
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          toast({
                            title: 'Ошибка',
                            description: 'Не удалось загрузить изображения',
                            variant: 'destructive',
                          });
                        }
                        // Reset input
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {/* Manual form */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500">или</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setEditingHeroImage(null);
                      setShowHeroForm(true);
                      heroImageForm.reset({
                        title: '',
                        imageUrl: '',
                        sortOrder: heroImages.length,
                        isActive: 1,
                      });
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Добавить вручную по URL
                  </button>
                </div>
              </div>

              {/* Hero Image Form Modal */}
              {showHeroForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingHeroImage ? 'Редактировать изображение' : 'Добавить изображение героя'}
                      </h3>
                    </div>

                    <form onSubmit={heroImageForm.handleSubmit(handleSubmitHeroImage)} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Заголовок *
                        </label>
                        <input
                          {...heroImageForm.register('title')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="Название изображения"
                        />
                        {heroImageForm.formState.errors.title && (
                          <p className="text-red-600 text-sm mt-1">
                            {heroImageForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL изображения *
                        </label>
                        <input
                          {...heroImageForm.register('imageUrl')}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="https://example.com/image.jpg"
                        />
                        {heroImageForm.formState.errors.imageUrl && (
                          <p className="text-red-600 text-sm mt-1">
                            {heroImageForm.formState.errors.imageUrl.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Рекомендуемый размер: 1920×1440 пикселей (соотношение 4:3)
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Порядок сортировки
                          </label>
                          <input
                            {...heroImageForm.register('sortOrder', { valueAsNumber: true })}
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Статус
                          </label>
                          <select
                            {...heroImageForm.register('isActive', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          >
                            <option value={1}>Активно</option>
                            <option value={0}>Неактивно</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setShowHeroForm(false);
                            setEditingHeroImage(null);
                            heroImageForm.reset();
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          disabled={
                            createHeroImageMutation.isPending || 
                            updateHeroImageMutation.isPending
                          }
                          className="px-4 py-2 bg-[#E95D22] text-white rounded-lg hover:bg-[#D84315] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save size={16} />
                          {createHeroImageMutation.isPending || updateHeroImageMutation.isPending
                            ? 'Сохранение...'
                            : editingHeroImage
                            ? 'Обновить'
                            : 'Создать'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
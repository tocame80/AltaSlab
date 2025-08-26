import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Save, Eye, FileText, Plus, Edit, Play, Database, Download, Image, RotateCw, HardDrive } from 'lucide-react';
import { products } from '../data/products';
import * as XLSX from 'xlsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Certificate, insertCertificateSchema, VideoInstruction, insertVideoInstructionSchema, HeroImage, insertHeroImageSchema, GalleryProject, insertGalleryProjectSchema, CatalogProduct, insertCatalogProductSchema } from '@shared/schema';
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
  rotation: number;
  size: string;
  isFavorite: boolean;
}

interface ExistingImage {
  productId: string;
  fileName: string;
  url: string;
}

type AdminTab = 'images' | 'certificates' | 'videos' | 'catalog' | 'hero' | 'gallery';

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

const galleryProjectFormSchema = insertGalleryProjectSchema.extend({
  title: z.string().min(1, 'Название проекта обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  application: z.string().min(1, 'Тип применения обязателен'),
  images: z.array(z.string()).default([]),
  materialsUsed: z.array(z.string()).default([]),
  location: z.string().optional(),
  area: z.string().optional(),
  year: z.string().optional(),
});

const catalogProductFormSchema = insertCatalogProductSchema.extend({
  productCode: z.string().min(1, 'Артикул обязателен'),
  name: z.string().min(1, 'Название обязательно'),
  unit: z.string().min(1, 'Единица измерения обязательна'),
  quantity: z.number().min(0, 'Количество не может быть отрицательным'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
});

type CertificateFormData = z.infer<typeof certificateFormSchema>;
type VideoFormData = z.infer<typeof videoFormSchema>;
type HeroImageFormData = z.infer<typeof heroImageFormSchema>;
type GalleryProjectFormData = z.infer<typeof galleryProjectFormSchema>;
type CatalogProductFormData = z.infer<typeof catalogProductFormSchema>;

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
  const [editingGalleryProject, setEditingGalleryProject] = useState<GalleryProject | null>(null);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [materialSearchQuery, setMaterialSearchQuery] = useState<string>('');
  const [editingCatalogProduct, setEditingCatalogProduct] = useState<CatalogProduct | null>(null);
  const [showCatalogForm, setShowCatalogForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalogFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Helper function to filter materials based on search query
  const getFilteredMaterials = () => {
    return products
      .filter(p => p.category !== 'accessories')
      .filter(product => {
        if (!materialSearchQuery.trim()) return true;
        const query = materialSearchQuery.toLowerCase();
        return (
          product.id.toLowerCase().includes(query) ||
          product.name.toLowerCase().includes(query) ||
          product.color.toLowerCase().includes(query) ||
          product.collection.toLowerCase().includes(query)
        );
      });
  };

  // Gallery image upload handlers
  const handleGalleryImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      addGalleryImageFiles(files);
    }
  };

  const handleGalleryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addGalleryImageFiles(files);
    }
  };

  const addGalleryImageFiles = (files: File[]) => {
    // Add files to state
    setGalleryImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImageFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Helper function to filter catalog products based on search query
  const getFilteredCatalogProducts = () => {
    return catalogProducts.filter(product => {
      if (!catalogSearchQuery.trim()) return true;
      const query = catalogSearchQuery.toLowerCase();
      return (
        product.productCode.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        (product.barcode && product.barcode.toLowerCase().includes(query))
      );
    });
  };

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

  // Gallery form
  const galleryForm = useForm<GalleryProjectFormData>({
    resolver: zodResolver(galleryProjectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      application: '',
      images: [],
      materialsUsed: [],
      location: '',
      area: '',
      year: '',
      sortOrder: 0,
      isActive: 1,
    },
  });

  // Catalog product form
  const catalogProductForm = useForm<CatalogProductFormData>({
    resolver: zodResolver(catalogProductFormSchema),
    defaultValues: {
      productCode: '',
      name: '',
      unit: '',
      quantity: 0,
      barcode: '',
      price: 0,
      images: [],
      sortOrder: 0,
      isActive: 1,
    },
  });

  // Queries and mutations for gallery projects
  const { data: galleryProjects = [], isLoading: galleryProjectsLoading } = useQuery<GalleryProject[]>({
    queryKey: ['/api/gallery-projects'],
  });

  const createGalleryProjectMutation = useMutation({
    mutationFn: async (data: GalleryProjectFormData) => {
      console.log('Mutation: Sending POST request with data:', data);
      const result = await apiRequest('POST', '/api/gallery-projects', data);
      console.log('Mutation: Received response:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-projects'] });
      setShowGalleryForm(false);
      galleryForm.reset();
      setSelectedMaterials([]);
      setGalleryImages([]);
      setGalleryImageFiles([]);
      setGalleryImagePreviews([]);
      setIsDragging(false);
      setMaterialSearchQuery('');
      toast({
        title: 'Успешно',
        description: 'Проект галереи создан',
      });
    },
    onError: (error) => {
      console.error('Mutation: Create project failed with error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать проект галереи',
        variant: 'destructive',
      });
    },
  });

  const updateGalleryProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GalleryProjectFormData> }) => {
      return apiRequest('PUT', `/api/gallery-projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-projects'] });
      setEditingGalleryProject(null);
      setShowGalleryForm(false);
      galleryForm.reset();
      setSelectedMaterials([]);
      setGalleryImages([]);
      setGalleryImageFiles([]);
      setGalleryImagePreviews([]);
      setIsDragging(false);
      setMaterialSearchQuery('');
      toast({
        title: 'Успешно',
        description: 'Проект галереи обновлен',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить проект галереи',
        variant: 'destructive',
      });
    },
  });

  const deleteGalleryProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/gallery-projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-projects'] });
      toast({
        title: 'Успешно',
        description: 'Проект галереи удален',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить проект галереи',
        variant: 'destructive',
      });
    },
  });

  // Queries and mutations for catalog products
  const { data: catalogProducts = [], isLoading: catalogProductsLoading } = useQuery<CatalogProduct[]>({
    queryKey: ['/api/catalog-products'],
  });

  const createCatalogProductMutation = useMutation({
    mutationFn: async (data: CatalogProductFormData) => {
      return apiRequest('POST', '/api/catalog-products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/catalog-products'] });
      setShowCatalogForm(false);
      catalogProductForm.reset();
      toast({
        title: 'Успешно',
        description: 'Товар каталога создан',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать товар каталога',
        variant: 'destructive',
      });
    },
  });

  const updateCatalogProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CatalogProductFormData> }) => {
      return apiRequest('PUT', `/api/catalog-products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/catalog-products'] });
      setEditingCatalogProduct(null);
      setShowCatalogForm(false);
      catalogProductForm.reset();
      toast({
        title: 'Успешно',
        description: 'Товар каталога обновлен',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить товар каталога',
        variant: 'destructive',
      });
    },
  });

  const deleteCatalogProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/catalog-products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/catalog-products'] });
      toast({
        title: 'Успешно',
        description: 'Товар каталога удален',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар каталога',
        variant: 'destructive',
      });
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

  // Catalog product form handlers
  const startEditingCatalogProduct = (catalogProduct: CatalogProduct) => {
    setEditingCatalogProduct(catalogProduct);
    setShowCatalogForm(true);
    catalogProductForm.reset({
      productCode: catalogProduct.productCode,
      name: catalogProduct.name,
      unit: catalogProduct.unit,
      quantity: catalogProduct.quantity ?? 0,
      barcode: catalogProduct.barcode || '',
      price: parseFloat(catalogProduct.price || '0'),
      images: catalogProduct.images || [],
      sortOrder: catalogProduct.sortOrder ?? 0,
      isActive: catalogProduct.isActive ?? 1,
    });
  };

  const handleSubmitCatalogProduct = (data: CatalogProductFormData) => {
    if (editingCatalogProduct) {
      updateCatalogProductMutation.mutate({
        id: editingCatalogProduct.id,
        data,
      });
    } else {
      createCatalogProductMutation.mutate(data);
    }
  };

  const handleDeleteCatalogProduct = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар каталога?')) {
      deleteCatalogProductMutation.mutate(id);
    }
  };

  // Download Excel template function
  const downloadTemplate = () => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Template data with examples
    const templateData = [
      {
        'Артикул': 'ABC123',
        'Название товара': 'Панель SPC Дуб Классик',
        'Единица измерения': 'м²',
        'Количество': 100,
        'Цена': 1250.50,
        'Штрихкод': '1234567890123',
        'Ссылки на фото': 'https://example.com/photo1.jpg;https://example.com/photo2.jpg',
        'Порядок сортировки': 1,
        'Активный (1/0)': 1
      },
      {
        'Артикул': 'DEF456',
        'Название товара': 'Плинтус универсальный белый',
        'Единица измерения': 'м',
        'Количество': 50,
        'Цена': 350.00,
        'Штрихкод': '2345678901234',
        'Ссылки на фото': 'https://example.com/photo3.jpg',
        'Порядок сортировки': 2,
        'Активный (1/0)': 1
      },
      {
        'Артикул': 'GHI789',
        'Название товара': 'Уголок наружный',
        'Единица измерения': 'шт',
        'Количество': 25,
        'Цена': 125.00,
        'Штрихкод': '3456789012345',
        'Ссылки на фото': '',
        'Порядок сортировки': 3,
        'Активный (1/0)': 1
      }
    ];

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Артикул
      { wch: 30 }, // Название товара
      { wch: 18 }, // Единица измерения
      { wch: 12 }, // Количество
      { wch: 12 }, // Цена
      { wch: 18 }, // Штрихкод
      { wch: 40 }, // Ссылки на фото
      { wch: 20 }, // Порядок сортировки
      { wch: 15 }  // Активный
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Каталог товаров');
    
    // Create and download Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Шаблон_каталог_товаров.xlsx';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Export functions for catalog data
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/catalog-products/export');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных каталога');
      }
      
      const products = await response.json();
      
      if (products.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }

      const workbook = XLSX.utils.book_new();
      
      const exportData = products.map((product: any) => ({
        'Артикул': product.productCode,
        'Название товара': product.name,
        'Единица измерения': product.unit,
        'Количество': product.quantity,
        'Цена': product.price,
        'Штрихкод': product.barcode || '',
        'Ссылки на фото': product.images ? product.images.join(';') : '',
        'Порядок сортировки': product.sortOrder ?? 0,
        'Активный (1/0)': product.isActive ?? 1
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const columnWidths = [
        { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 12 },
        { wch: 12 }, { wch: 18 }, { wch: 40 }, { wch: 20 }, { wch: 15 }
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Каталог товаров');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Каталог_товаров_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Ошибка экспорта Excel:', error);
      alert('Ошибка при экспорте данных в Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/catalog-products/export');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных каталога');
      }
      
      const products = await response.json();
      
      if (products.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }

      const headers = ['Артикул', 'Название товара', 'Единица измерения', 'Количество', 'Цена', 'Штрихкод', 'Ссылки на фото', 'Порядок сортировки', 'Активный (1/0)'];
      
      const csvContent = [
        headers.join(','),
        ...products.map((product: any) => [
          product.productCode,
          `"${product.name}"`,
          product.unit,
          product.quantity,
          product.price,
          product.barcode || '',
          `"${product.images ? product.images.join(';') : ''}"`,
          product.sortOrder ?? 0,
          product.isActive ?? 1
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Каталог_товаров_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Ошибка экспорта CSV:', error);
      alert('Ошибка при экспорте данных в CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/catalog-products/export');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных каталога');
      }
      
      const products = await response.json();
      
      if (products.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }

      const exportData = products.map((product: any) => ({
        productCode: product.productCode,
        name: product.name,
        unit: product.unit,
        quantity: product.quantity,
        price: product.price,
        barcode: product.barcode || '',
        images: product.images || [],
        sortOrder: product.sortOrder ?? 0,
        isActive: product.isActive ?? 1
      }));

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Каталог_товаров_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Ошибка экспорта JSON:', error);
      alert('Ошибка при экспорте данных в JSON');
    } finally {
      setIsExporting(false);
    }
  };

  // Import functions for catalog data
  const importCatalogFromExcel = async (file: File) => {
    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        toast({
          title: 'Ошибка',
          description: 'Файл Excel пуст или имеет неправильный формат',
        });
        return;
      }

      // Преобразуем данные Excel в формат для API
      const productsToImport = jsonData.map((row: any, index: number) => {
        // Определяем артикул
        let productCode = '';
        if (row['Артикул'] && !isNaN(row['Артикул'])) {
          productCode = `SPC${parseInt(row['Артикул'])}`;
        } else {
          productCode = `AUTO_${index}`;
        }

        // Извлекаем формат из названия
        const name = String(row['Название товара'] || '').trim();
        let format = '';
        if (name.includes('×')) {
          const formatMatch = name.match(/(\d+×\d+×[\d,]+мм)/);
          if (formatMatch) {
            format = formatMatch[1];
          }
        }

        return {
          productCode,
          name,
          unit: String(row['Единица измерения'] || 'упак').trim(),
          quantity: parseInt(row['Количество'] || '0') || 0,
          price: String(row['Цена за единицу измерения'] || '0'),
          barcode: String(row['Штрихкод упаковки'] || '').trim() || null,
          category: 'SPC панели',
          collection: String(row['Коллекция'] || '').trim(),
          color: String(row['Цвета'] || 'Стандарт').trim(),
          format,
          surface: 'упак',
          imageUrl: String(row['Ссылки на фото'] || '').trim() || null,
          images: row['Ссылки на фото'] ? [String(row['Ссылки на фото']).trim()] : [],
          description: `Панель ${name}`,
          specifications: {},
          profile: null,
          availability: String(row['Наличие '] || 'В наличии').trim(),
          isActive: 1,
          sortOrder: index,
        };
      }).filter(product => product.name && product.collection); // Убираем пустые строки

      console.log('Импортируем товары:', productsToImport.length);

      // Отправляем на сервер
      const response = await apiRequest('POST', '/api/catalog-products/import', {
        products: productsToImport
      });

      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: ['/api/catalog-products'] });

      toast({
        title: 'Успешно',
        description: `Импортировано ${productsToImport.length} товаров`,
      });

    } catch (error) {
      console.error('Ошибка импорта:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось импортировать каталог',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCatalogFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importCatalogFromExcel(file);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Поддерживаются только файлы Excel (.xlsx, .xls)',
        });
      }
    }
    
    // Reset file input
    if (catalogFileInputRef.current) {
      catalogFileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    catalogFileInputRef.current?.click();
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
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        
        setUploadedImages(prev => [...prev, {
          productId: selectedProduct,
          fileName,
          file,
          preview,
          rotation: 0,
          size: `${sizeInMB} MB`,
          isFavorite: false
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

  const rotateImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      newImages[index] = {
        ...newImages[index],
        rotation: (newImages[index].rotation + 90) % 360
      };
      return newImages;
    });
  };

  const toggleFavorite = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      newImages[index] = {
        ...newImages[index],
        isFavorite: !newImages[index].isFavorite
      };
      return newImages;
    });
  };

  const downloadOriginal = (img: ProductImage) => {
    const link = document.createElement('a');
    link.href = img.preview;
    link.download = img.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'border-b-2 border-[#E95D22] text-[#E95D22] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Image size={16} />
              Галерея
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
                  ? isDragOver
                    ? 'border-[#E95D22] bg-orange-50'
                    : 'border-gray-300 hover:border-[#E95D22] cursor-pointer'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              }`}
              onClick={() => selectedProduct && fileInputRef.current?.click()}
              onDrop={selectedProduct ? handleDrop : undefined}
              onDragOver={selectedProduct ? handleDragOver : undefined}
              onDragLeave={selectedProduct ? handleDragLeave : undefined}
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
                        className="w-full h-full object-cover transition-transform duration-300"
                        style={{ transform: `rotate(${img.rotation}deg)` }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => rotateImage(uploadedImages.findIndex(image => image === img))}
                        className="text-white hover:text-blue-400 transition-colors p-1 bg-black/20 rounded"
                        title="Повернуть"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button
                        onClick={() => downloadOriginal(img)}
                        className="text-white hover:text-green-400 transition-colors p-1 bg-black/20 rounded"
                        title="Скачать оригинал"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => toggleFavorite(uploadedImages.findIndex(image => image === img))}
                        className={`transition-colors p-1 bg-black/20 rounded ${
                          img.isFavorite ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
                        }`}
                        title="Добавить в избранное"
                      >
                        <HardDrive size={16} />
                      </button>
                      <button
                        onClick={() => removeUploadedImage(uploadedImages.findIndex(image => image === img))}
                        className="text-white hover:text-red-400 transition-colors p-1 bg-black/20 rounded"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Новый
                    </div>
                    {img.isFavorite && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        ★
                      </div>
                    )}
                    <div className="mt-1">
                      <p className="text-xs text-gray-600 truncate" title={img.fileName}>
                        {img.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({img.size})
                      </p>
                    </div>
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Каталог продукции</h3>
                <button
                  onClick={() => setShowCatalogForm(true)}
                  className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2"
                  data-testid="button-add-catalog-product"
                >
                  <Plus size={16} />
                  Добавить товар
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Поиск по артикулу, названию или штрихкоду..."
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                  data-testid="input-search-catalog"
                />
                {catalogSearchQuery && (
                  <div className="mt-2 text-sm text-gray-600">
                    Найдено товаров: {getFilteredCatalogProducts().length}
                    <button
                      onClick={() => setCatalogSearchQuery('')}
                      className="ml-4 text-[#E95D22] hover:text-[#d54a1a]"
                      data-testid="button-clear-search"
                    >
                      Очистить поиск
                    </button>
                  </div>
                )}
              </div>

              {catalogProductsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Загрузка товаров...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Артикул</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Название</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ед. изм.</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Кол-во</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Цена</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Штрихкод</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredCatalogProducts().length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            {catalogSearchQuery ? 'Товары не найдены' : 'Нет товаров в каталоге'}
                          </td>
                        </tr>
                      ) : (
                        getFilteredCatalogProducts().map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50" data-testid={`row-catalog-product-${product.id}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.productCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.unit}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.price} ₽</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.barcode || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => startEditingCatalogProduct(product)}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  title="Редактировать"
                                  data-testid={`button-edit-catalog-product-${product.id}`}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCatalogProduct(product.id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Удалить"
                                  data-testid={`button-delete-catalog-product-${product.id}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Import/Export Section */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                {/* Export Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Download className="w-6 h-6 text-[#E95D22]" />
                    <h4 className="text-lg font-semibold text-gray-900">Выгрузка каталога</h4>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Экспортируйте каталог товаров в различных форматах для обмена данными или резервного копирования.
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={exportToExcel}
                      disabled={isExporting}
                      className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isExporting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#E95D22] hover:bg-[#d54a1a]'
                      } text-white`}
                      data-testid="button-export-excel"
                    >
                      <Download size={16} />
                      {isExporting ? 'Экспорт...' : 'Скачать Excel (.xlsx)'}
                    </button>
                    
                    <button 
                      onClick={exportToCSV}
                      disabled={isExporting}
                      className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isExporting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      } text-white`}
                      data-testid="button-export-csv"
                    >
                      <Download size={16} />
                      {isExporting ? 'Экспорт...' : 'Скачать CSV'}
                    </button>
                    
                    <button 
                      onClick={exportToJSON}
                      disabled={isExporting}
                      className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isExporting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                      data-testid="button-export-json"
                    >
                      <Download size={16} />
                      {isExporting ? 'Экспорт...' : 'Скачать JSON'}
                    </button>
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
                  
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-1">Шаблон файла содержит:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Правильные названия колонок</li>
                      <li>• Примеры заполнения данных</li>
                      <li>• Допустимые значения полей</li>
                    </ul>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#E95D22] transition-colors">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Перетащите файл сюда или</p>
                    <button 
                      onClick={triggerFileSelect}
                      className="text-[#E95D22] hover:text-[#d54a1a] font-medium"
                      data-testid="button-choose-file"
                    >
                      выберите файл
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Поддерживаются форматы: .xlsx, .xls
                    </p>
                  </div>
                  
                  <input
                    ref={catalogFileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleCatalogFileSelect}
                    className="hidden"
                  />
                  
                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={downloadTemplate}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      data-testid="button-download-template"
                    >
                      Скачать шаблон
                    </button>
                    <button 
                      onClick={triggerFileSelect}
                      disabled={isImporting}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                        isImporting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#E95D22] hover:bg-[#d54a1a]'
                      } text-white`}
                      data-testid="button-upload-file"
                    >
                      {isImporting ? 'Загрузка...' : 'Загрузить файл'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Статистика каталога</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-[#E95D22]">{catalogProducts.length}</div>
                    <div className="text-sm text-gray-600">Всего товаров</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#E95D22]">
                      {catalogProducts.reduce((sum, p) => sum + (p.quantity ?? 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Общее кол-во</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#E95D22]">
                      {catalogProducts.reduce((sum, p) => {
                        const price = parseFloat(p.price || '0');
                        const quantity = p.quantity ?? 0;
                        return sum + (price * quantity);
                      }, 0).toLocaleString()} ₽
                    </div>
                    <div className="text-sm text-gray-600">Общая стоимость</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#E95D22]">
                      {catalogProducts.filter(p => (p.quantity ?? 0) > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">В наличии</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Управление галереей проектов</h3>
                <button
                  onClick={() => setShowGalleryForm(true)}
                  className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Добавить проект
                </button>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Инструкция:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Добавляйте URL изображений проектов через запятую</li>
                  <li>• Выбирайте материалы из каталога для отображения в проекте</li>
                  <li>• Укажите тип применения: интерьер, экстерьер, коммерческий, жилой</li>
                  <li>• Заполните дополнительную информацию: локация, площадь, год</li>
                </ul>
              </div>

              {/* Existing Gallery Projects */}
              {galleryProjectsLoading ? (
                <div className="p-8 text-center text-gray-500">Загрузка проектов...</div>
              ) : galleryProjects.length > 0 ? (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Существующие проекты ({galleryProjects.length})</h4>
                  <div className="grid gap-4">
                    {galleryProjects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            {/* Project Image */}
                            {project.images && project.images.length > 0 && (
                              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={project.images[0]}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Project Info */}
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-2">{project.title}</h5>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                              <div className="flex gap-4 text-sm text-gray-500">
                                <span>Тип: {project.application}</span>
                                {project.location && <span>Локация: {project.location}</span>}
                                {project.area && <span>Площадь: {project.area}</span>}
                                {project.year && <span>Год: {project.year}</span>}
                              </div>
                              {project.materialsUsed && project.materialsUsed.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Материалы: {project.materialsUsed.length} шт.</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingGalleryProject(project);
                                setSelectedMaterials(project.materialsUsed || []);
                                setGalleryImages(project.images || []);
                                galleryForm.reset({
                                  title: project.title,
                                  description: project.description,
                                  application: project.application,
                                  images: project.images || [],
                                  materialsUsed: project.materialsUsed || [],
                                  location: project.location || '',
                                  area: project.area || '',
                                  year: project.year || '',
                                  sortOrder: project.sortOrder || 0,
                                  isActive: project.isActive || 1,
                                });
                                setShowGalleryForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 p-2"
                              title="Редактировать"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Удалить этот проект?')) {
                                  deleteGalleryProjectMutation.mutate(project.id);
                                }
                              }}
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
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Проекты не найдены</p>
                  <p className="text-sm">Добавьте первый проект в галерею</p>
                </div>
              )}

              {/* Gallery Form Modal */}
              {showGalleryForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                      <h4 className="text-lg font-semibold">
                        {editingGalleryProject ? 'Редактировать проект' : 'Добавить проект'}
                      </h4>
                      <button
                        onClick={() => {
                          setShowGalleryForm(false);
                          setEditingGalleryProject(null);
                          setSelectedMaterials([]);
                          setGalleryImages([]);
                          setGalleryImageFiles([]);
                          setGalleryImagePreviews([]);
                          setIsDragging(false);
                          setMaterialSearchQuery('');
                          galleryForm.reset();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <form
                      onSubmit={galleryForm.handleSubmit(async (data) => {
                        // Validate that we have at least one image
                        if (galleryImageFiles.length === 0 && galleryImages.length === 0) {
                          toast({
                            title: 'Ошибка',
                            description: 'Добавьте хотя бы одно изображение',
                            variant: 'destructive',
                          });
                          return;
                        }
                        let imageUrls = [];
                        
                        // If there are files to upload, upload them first
                        if (galleryImageFiles.length > 0) {
                          const uploadData = new FormData();
                          galleryImageFiles.forEach((file, index) => {
                            uploadData.append('images', file);
                          });

                          try {
                            const uploadResponse = await fetch('/api/admin/upload-gallery-images', {
                              method: 'POST',
                              body: uploadData,
                            });

                            if (!uploadResponse.ok) {
                              throw new Error('Ошибка загрузки изображений');
                            }

                            const uploadResult = await uploadResponse.json();
                            imageUrls = uploadResult.files.map((f: any) => f.url);
                          } catch (error) {
                            console.error('Upload error:', error);
                            toast({
                              title: 'Ошибка',
                              description: 'Не удалось загрузить изображения',
                              variant: 'destructive',
                            });
                            return;
                          }
                        } else {
                          imageUrls = galleryImages; // Use existing URLs if no files uploaded
                        }
                        
                        const formData = {
                          ...data,
                          images: imageUrls,
                          materialsUsed: selectedMaterials,
                        };
                        
                        if (editingGalleryProject) {
                          updateGalleryProjectMutation.mutate({
                            id: editingGalleryProject.id,
                            data: formData,
                          });
                        } else {
                          console.log('Creating new gallery project with data:', formData);
                          createGalleryProjectMutation.mutate(formData);
                        }
                      })}
                      className="p-6 space-y-6"
                    >
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Название проекта *
                          </label>
                          <input
                            {...galleryForm.register('title')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                            placeholder="Введите название проекта"
                          />
                          {galleryForm.formState.errors.title && (
                            <p className="text-red-600 text-sm mt-1">{galleryForm.formState.errors.title.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Тип применения *
                          </label>
                          <select
                            {...galleryForm.register('application')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          >
                            <option value="">Выберите тип</option>
                            <option value="interior">Интерьер</option>
                            <option value="exterior">Экстерьер</option>
                            <option value="commercial">Коммерческий</option>
                            <option value="residential">Жилой</option>
                          </select>
                          {galleryForm.formState.errors.application && (
                            <p className="text-red-600 text-sm mt-1">{galleryForm.formState.errors.application.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Описание *
                        </label>
                        <textarea
                          {...galleryForm.register('description')}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                          placeholder="Введите описание проекта"
                        />
                        {galleryForm.formState.errors.description && (
                          <p className="text-red-600 text-sm mt-1">{galleryForm.formState.errors.description.message}</p>
                        )}
                      </div>

                      {/* Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Изображения проекта *
                        </label>
                        
                        {/* Drag & Drop Upload Area */}
                        <div
                          onDrop={handleGalleryImageDrop}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragging
                              ? 'border-[#E95D22] bg-orange-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            Перетащите изображения сюда
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            или нажмите для выбора файлов
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryImageSelect}
                            className="hidden"
                            id="gallery-image-upload"
                          />
                          <label
                            htmlFor="gallery-image-upload"
                            className="inline-flex items-center px-4 py-2 bg-[#E95D22] text-white rounded-lg hover:bg-[#d54a1a] cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Выбрать файлы
                          </label>
                        </div>

                        {/* Image Previews */}
                        {galleryImagePreviews.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-3">
                              Загружено изображений: {galleryImagePreviews.length}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {galleryImagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                  />
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => removeGalleryImage(index)}
                                      className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Удалить"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                  {galleryImageFiles[index] && (
                                    <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                      {(galleryImageFiles[index].size / (1024 * 1024)).toFixed(1)} MB
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {galleryImagePreviews.length === 0 && galleryImages.length === 0 && (
                          <p className="text-red-600 text-sm mt-1">Добавьте хотя бы одно изображение</p>
                        )}
                      </div>

                      {/* Materials Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Используемые материалы
                        </label>
                        
                        {/* Search Input */}
                        <div className="mb-3 flex gap-2">
                          <input
                            type="text"
                            value={materialSearchQuery}
                            onChange={(e) => setMaterialSearchQuery(e.target.value)}
                            placeholder="Поиск по артикулу или названию материала..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22] text-sm"
                            data-testid="input-material-search"
                          />
                          {materialSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setMaterialSearchQuery('')}
                              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                              data-testid="button-clear-search"
                            >
                              Очистить
                            </button>
                          )}
                        </div>

                        <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <div className="grid grid-cols-1 gap-2">
                            {getFilteredMaterials().length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <p>Материалы не найдены</p>
                                <p className="text-sm">Попробуйте изменить поисковый запрос</p>
                              </div>
                            ) : (
                              getFilteredMaterials().map((product) => (
                              <label key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedMaterials.includes(product.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMaterials(prev => [...prev, product.id]);
                                    } else {
                                      setSelectedMaterials(prev => prev.filter(id => id !== product.id));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-12 h-8 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{product.color}</p>
                                  <p className="text-xs text-gray-500">{product.collection} - {product.format}</p>
                                  <p className="text-xs text-gray-400">Артикул: {product.id}</p>
                                </div>
                              </label>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex justify-between">
                          <span>Выбрано: {selectedMaterials.length} материалов</span>
                          <span>
                            Показано: {getFilteredMaterials().length} из {products.filter(p => p.category !== 'accessories').length}
                          </span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Локация
                          </label>
                          <input
                            {...galleryForm.register('location')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                            placeholder="Город, регион"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Площадь
                          </label>
                          <input
                            {...galleryForm.register('area')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                            placeholder="85 кв.м"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Год
                          </label>
                          <input
                            {...galleryForm.register('year')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-[#E95D22]"
                            placeholder="2024"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setShowGalleryForm(false);
                            setEditingGalleryProject(null);
                            setSelectedMaterials([]);
                            setGalleryImages([]);
                            galleryForm.reset();
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          disabled={createGalleryProjectMutation.isPending || updateGalleryProjectMutation.isPending}
                          className="flex-1 bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors disabled:opacity-50"
                        >
                          {createGalleryProjectMutation.isPending || updateGalleryProjectMutation.isPending 
                            ? 'Сохранение...' 
                            : editingGalleryProject ? 'Обновить' : 'Создать'
                          }
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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

              {/* Catalog Product Form Modal */}
              {showCatalogForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingCatalogProduct ? 'Редактировать товар' : 'Добавить товар'}
                    </h3>
                    
                    <form onSubmit={catalogProductForm.handleSubmit(handleSubmitCatalogProduct)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Артикул *
                        </label>
                        <input
                          {...catalogProductForm.register('productCode')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                          placeholder="ABC123"
                          data-testid="input-product-code"
                        />
                        {catalogProductForm.formState.errors.productCode && (
                          <p className="mt-1 text-sm text-red-600">
                            {catalogProductForm.formState.errors.productCode.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Название *
                        </label>
                        <input
                          {...catalogProductForm.register('name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                          placeholder="Название товара"
                          data-testid="input-product-name"
                        />
                        {catalogProductForm.formState.errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {catalogProductForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Единица измерения *
                          </label>
                          <select
                            {...catalogProductForm.register('unit')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                            data-testid="select-unit"
                          >
                            <option value="">Выберите</option>
                            <option value="шт">шт</option>
                            <option value="м²">м²</option>
                            <option value="м">м</option>
                            <option value="кг">кг</option>
                            <option value="л">л</option>
                            <option value="упак">упак</option>
                            <option value="комплект">комплект</option>
                          </select>
                          {catalogProductForm.formState.errors.unit && (
                            <p className="mt-1 text-sm text-red-600">
                              {catalogProductForm.formState.errors.unit.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Количество *
                          </label>
                          <input
                            type="number"
                            {...catalogProductForm.register('quantity', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                            placeholder="0"
                            min="0"
                            data-testid="input-quantity"
                          />
                          {catalogProductForm.formState.errors.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {catalogProductForm.formState.errors.quantity.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Цена (₽) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...catalogProductForm.register('price', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                            data-testid="input-price"
                          />
                          {catalogProductForm.formState.errors.price && (
                            <p className="mt-1 text-sm text-red-600">
                              {catalogProductForm.formState.errors.price.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Порядок сортировки
                          </label>
                          <input
                            type="number"
                            {...catalogProductForm.register('sortOrder', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                            placeholder="0"
                            min="0"
                            data-testid="input-sort-order"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Штрихкод
                        </label>
                        <input
                          {...catalogProductForm.register('barcode')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                          placeholder="1234567890123"
                          data-testid="input-barcode"
                        />
                        {catalogProductForm.formState.errors.barcode && (
                          <p className="mt-1 text-sm text-red-600">
                            {catalogProductForm.formState.errors.barcode.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...catalogProductForm.register('isActive', { 
                            setValueAs: (value) => value ? 1 : 0 
                          })}
                          className="h-4 w-4 text-[#E95D22] focus:ring-[#E95D22] border-gray-300 rounded"
                          data-testid="checkbox-is-active"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Активный товар
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCatalogForm(false);
                            setEditingCatalogProduct(null);
                            catalogProductForm.reset();
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          data-testid="button-cancel-catalog-form"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          disabled={
                            createCatalogProductMutation.isPending || 
                            updateCatalogProductMutation.isPending
                          }
                          className="flex-1 px-4 py-2 bg-[#E95D22] text-white rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-submit-catalog-form"
                        >
                          <Save size={16} />
                          {createCatalogProductMutation.isPending || updateCatalogProductMutation.isPending
                            ? 'Сохранение...'
                            : editingCatalogProduct
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
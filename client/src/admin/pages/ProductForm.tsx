import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  Plus,
  Trash2,
  ImagePlus,
  Palette,
  Tag,
  DollarSign,
  Package,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/admin/components/layout/PageHeader';
import LoadingSpinner from '@/admin/components/shared/LoadingSpinner';
import { productService } from '@/admin/services/productService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { productSchema, ProductFormData } from '@/admin/utils/validators';
import { toast } from 'sonner';
import { Product } from '@/admin/types';


const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { admin } = useAuthStore();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      longDescription: '',
      price: 0,
      originalPrice: undefined,
      category: 'Clothing',
      badge: '',
      stock: 0,
      sizes: [],
      colors: [{ name: '', hex: '#000000', image: '' }],
      features: [],
      sizePriceAdjustments: {},
      variantStock: [],
    },
  });

  const {
    fields: variantStockFields,
    replace: replaceVariantStock,
  } = useFieldArray({
    control: form.control,
    name: 'variantStock',
  });

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control: form.control,
    name: 'colors',
  });

  const fetchProduct = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const product = await productService.getById(productId);
      form.reset({
        name: product.name,
        description: product.description,
        longDescription: product.longDescription,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        badge: product.badge || '',
        stock: product.stock,
        sizes: product.sizes,
        colors: product.colors,
        features: product.features,
        sizePriceAdjustments: product.sizePriceAdjustments || {},
        variantStock: product.variantStock || [],
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setIsLoading(false);
    }
  }, [form, navigate]);

  useEffect(() => {
    if (isEditing && id) {
      fetchProduct(id);
    }
  }, [id, isEditing, fetchProduct]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const productData = {
        ...data,
        // Use the first color's price as the main product price if it exists
        price: data.price || data.colors[0]?.price || 0,
        originalPrice: data.originalPrice || data.colors[0]?.originalPrice,
        colors: data.colors.map(c => ({
          name: c.name || '',
          hex: c.hex || '#000000',
          image: c.image || '',
          images: c.images,
          price: c.price,
          originalPrice: c.originalPrice,
        })),
        // Calculate total stock from all variants if variantStock exists
        stock: data.variantStock && data.variantStock.length > 0
          ? data.variantStock.reduce((acc, curr) => acc + (curr.stock || 0), 0)
          : data.stock || 0
      };

      if (isEditing && id) {
        await productService.update(id, productData as unknown as Product);
        toast.success('Product updated successfully');
      } else {
        await productService.create({
          ...productData,
          rating: 0,
          reviewsCount: 0,
          reviews: [],
        } as unknown as Omit<Product, '_id' | 'createdAt' | 'updatedAt'>);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(isEditing ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = form.getValues('features');
      form.setValue('features', [...currentFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const currentFeatures = form.getValues('features');
    form.setValue(
      'features',
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  const generateVariants = () => {
    const colors = form.getValues('colors');
    const sizes = form.getValues('sizes');
    const currentVariants = form.getValues('variantStock') || [];

    // Fallbacks if nothing is selected
    const activeColors = colors.filter(c => c.name).length > 0 ? colors.filter(c => c.name) : [{ name: 'Default' }];
    const activeSizes = sizes.length > 0 ? sizes : ['One Size'];

    const newVariants: { color: string; size: string; stock: number }[] = [];

    activeColors.forEach(color => {
      activeSizes.forEach(size => {
        // Check if this variant already exists to preserve stock count
        const existing = currentVariants.find(v =>
          v.color === (color.name || 'Default') && v.size === size
        );
        newVariants.push({
          color: color.name || 'Default',
          size: size,
          stock: existing ? existing.stock : 0
        });
      });
    });

    replaceVariantStock(newVariants);
    toast.success(`Generated ${newVariants.length} variants`);
  };

  const handleSizeToggle = (size: string, checked: boolean) => {
    const currentSizes = form.getValues('sizes');
    if (checked) {
      form.setValue('sizes', [...currentSizes, size]);
    } else {
      form.setValue(
        'sizes',
        currentSizes.filter((s) => s !== size)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Product' : 'Add New Product'}
        breadcrumbs={[
          { label: 'Products', href: '/admin/products' },
          { label: isEditing ? 'Edit' : 'New' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/products')}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving || admin?.role === 'demo_admin'}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Premium Leather Watch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief product summary (max 200 chars)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Shown in product listings and cards
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed product description..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Color Variants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {colorFields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-4 p-4 rounded-lg border border-border"
                    >
                      <FormField
                        control={form.control}
                        name={`colors.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-32">
                            <FormLabel>Color Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Midnight Black" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`colors.${index}.hex`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Hex</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-10 w-10 rounded border-0 cursor-pointer"
                                />
                                <Input {...field} className="w-24" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`colors.${index}.image`}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-48">
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`colors.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Mandatory"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`colors.${index}.originalPrice`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Compare ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Optional"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {colorFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="self-end text-destructive"
                          onClick={() => removeColor(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendColor({ name: '', hex: '#000000', image: '' })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color Variant
                  </Button>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature..."
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.watch('features').map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-destructive/20"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing section removed as requested - prices are now in Color Variants */}

              {/* Organization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Accessories">Accessories</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Best Seller, New" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stock Quantity removed as requested - stock is now in Variant Stock */}
                </CardContent>
              </Card>

              {/* Sizes */}
              <Card>
                <CardHeader>
                  <CardTitle>Sizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <label
                        key={size}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={form.watch('sizes').includes(size)}
                          onCheckedChange={(checked) =>
                            handleSizeToggle(size, checked as boolean)
                          }
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                  {form.formState.errors.sizes && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.sizes.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Variant Stock Management - Always available */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Variant Stock
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={generateVariants}>
                      Sync Variants
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {variantStockFields.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Click "Sync Variants" to generate stock fields for all color/size combinations.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {variantStockFields.map((field, index) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`variantStock.${index}.stock`}
                            render={({ field: inputField }) => (
                              <FormItem className="border rounded-lg p-3">
                                <FormLabel className="text-xs font-normal text-muted-foreground mb-1 block">
                                  {form.getValues(`variantStock.${index}.color`)} - {form.getValues(`variantStock.${index}.size`)}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...inputField}
                                    onChange={(e) => inputField.onChange(Number(e.target.value))}
                                    placeholder="0"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </form>
      </Form>
    </div >
  );
};

export default ProductForm;

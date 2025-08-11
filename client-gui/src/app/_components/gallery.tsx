"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import * as React from "react"
import dynamic from 'next/dynamic'
import {
  ColumnDef,
  ColumnFiltersState, 
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  ChevronDown, 
  MoreHorizontal, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Download,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  FileImage,
  Loader2
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import useDataStore from "../_store/data"
import useServerStore from "../_store/server"
import useImageStore from "../_store/img"
import useCanvasStore from "../_store/canvas"

export type ImgInfo = {
    name: string
    status: boolean //annotated
    // time: 
}

// Enhanced animation variants for smoother transitions
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// Disable SSR for DataTableDemo to prevent hydration issues
const DataTableDemo = dynamic(() => Promise.resolve(DataTableDemoComponent), {
    ssr: false
});

function DataTableDemoComponent() {
    const [isClient, setIsClient] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');
    const [filterStatus, setFilterStatus] = React.useState<'all' | 'annotated' | 'pending'>('all');
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedImages, setSelectedImages] = React.useState<string[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const setRegions = useCanvasStore((s) => s.setRegions);
    const setBorders = useCanvasStore((s) => s.setBorders);
    const setImageUrl = useImageStore((s) => s.setImageUrl)
    const imageUrl = useImageStore((s) => s.imageUrl)
    const baseServerURL = useServerStore((s) => s.baseServerURL)
    
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const imgs = useDataStore((s) => s.imgs)

    // Enhanced data processing with filtering
    const data: ImgInfo[] = React.useMemo(() => {
        let processedData = imgs.map((img) => ({ 
            name: img, 
            status: Math.random() > 0.6, // Simulated status for demo
        }));

        // Apply status filter
        if (filterStatus !== 'all') {
            processedData = processedData.filter(img => 
                filterStatus === 'annotated' ? img.status : !img.status
            );
        }

        // Apply search filter
        if (searchTerm) {
            processedData = processedData.filter(img =>
                img.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return processedData;
    }, [imgs, filterStatus, searchTerm]);

    // Enhanced statistics
    const statistics = React.useMemo(() => {
        const total = imgs.length;
        const annotated = data.filter(img => img.status).length;
        const pending = total - annotated;
        const completionRate = total > 0 ? (annotated / total) * 100 : 0;

        return { total, annotated, pending, completionRate };
    }, [imgs, data]);

    // Memoize the HandleEdit function (preserved as requested)
    const HandleEdit = React.useCallback(async (filename: string) => {
        console.log("HandleEdit called with:", filename);
        setIsLoading(true);

        const img_path = baseServerURL + "/raw_upload/" + filename;
        console.log("Fetching from:", baseServerURL + "/db/getImage/?img_path=" + encodeURIComponent(img_path));

        try {
            const response = await fetch(baseServerURL + "/db/getImage/?img_path=" + encodeURIComponent(img_path), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            console.log("Fetch completed");

            const images = await response.json(); 
            console.log("Images received:", images);

            if (images.length > 0) { 
                const image = images[0];
                console.log("Image data:", image.img_path);
                setImageUrl(image.img_path);
                
                setRegions(image.regions ?? []);
                setBorders(image.boxes ?? []); 
                console.log("State updated");
            }
        } catch (error) {
            console.error("Error fetching image:", error);
        } finally {
            setIsLoading(false);
        }
    }, [baseServerURL, setImageUrl]);

    // Enhanced status cell component
    const StatusCell = ({ status }: { status: boolean }) => (
        <div className="flex items-center gap-2">
            {status ? (
                <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Annotated
                    </Badge>
                </>
            ) : (
                <>
                    <Clock className="h-4 w-4 text-orange-600" />
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                        Pending
                    </Badge>
                </>
            )}
        </div>
    );

    // Enhanced image preview component
    const ImagePreview = ({ name }: { name: string }) => (
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <FileImage className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-sm">{name}</span>
                <span className="text-xs text-muted-foreground">Image file</span>
            </div>
        </div>
    );

    // Memoize columns with enhanced styling (preserved structure)
    const columns: ColumnDef<ImgInfo>[] = React.useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="border-2"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="border-2"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <StatusCell status={row.getValue("status")} />,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <ImagePreview name={row.getValue("name")} />,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const imginfo = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-semibold">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => HandleEdit(imginfo.name)}
                                className="cursor-pointer"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Annotation
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <Download className="mr-2 h-4 w-4" />
                                Download Image
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Download className="mr-2 h-4 w-4" />
                                Download Annotations
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [HandleEdit]);

    const table = useReactTable<ImgInfo>({
        data, 
        columns, 
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    // Grid view component
    const GridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {data.map((img, index) => (
                <Card key={img.name} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                            <FileImage className="h-12 w-12 text-slate-400" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => HandleEdit(img.name)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium text-sm truncate" title={img.name}>
                                {img.name}
                            </h3>
                            <StatusCell status={img.status} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    // Enhanced loading state
    if (!isClient) {
        return (
            <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    } 

    return (
        <div className="w-full space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Images</p>
                                <p className="text-lg font-bold">{statistics.total}</p>
                            </div>
                            <ImageIcon className="h-6 w-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Annotated</p>
                                <p className="text-lg font-bold text-green-600">{statistics.annotated}</p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                                <p className="text-lg font-bold text-orange-600">{statistics.pending}</p>
                            </div>
                            <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Progress</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {Math.round(statistics.completionRate)}%
                                </p>
                            </div>
                            <div className="h-6 w-6 flex items-center justify-center">
                                <div className="h-4 w-4 rounded-full bg-purple-100 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                </div>
                            </div>
                        </div>
                        <Progress value={statistics.completionRate} className="mt-1 h-1" />
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Filter and Search Bar */}
            <Card>
                <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search images..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Status: {filterStatus === 'all' ? 'All' : filterStatus === 'annotated' ? 'Annotated' : 'Pending'}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                                        All Images
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus('annotated')}>
                                        Annotated Only
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                                        Pending Only
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className="h-8 px-3"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 px-3"
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading Overlay */}
            {isLoading && (
                <Card>
                    <CardContent className="p-8 flex items-center justify-center">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading image data...</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content Area */}
            {viewMode === 'table' ? (
                <Card>
                    <ScrollArea className="h-[70vh]">
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className="border-b">
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id} className="bg-muted/50">
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                                className="hover:bg-muted/50 transition-colors"
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id} className="py-4">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center py-12">
                                                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                                    <p className="text-lg font-medium">No images found</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Try adjusting your search or filter criteria
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </ScrollArea>
                </Card>
            ) : (
                <Card>
                    <ScrollArea className="h-[70vh]">
                        <GridView />
                    </ScrollArea>
                </Card>
            )}

            {/* Enhanced Pagination */}
            <Card>
                <CardContent className="p-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground order-2 sm:order-1">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="flex items-center space-x-1 order-1 sm:order-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="h-7 px-2 text-xs"
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                                    {table.getPageCount()}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="h-7 px-2 text-xs"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function Gallery() {
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [loadingState, setLoadingState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const setImg = useDataStore((s) => s.setImg)
    const baseServerURL = useServerStore((s) => s.baseServerURL)

    // Enhanced sidebar data load (preserved as requested)
    const HandleLoadSideBar = async() => {
        setLoadingState('loading');
        try {
            const res = await fetch(baseServerURL + "/file/getAllImageNames", {
                method : "GET", 
                headers: { "Content-Type": "application/json" }, 
            })
            const names = await res.json(); 
            console.log(names)
            setImg(names);
            setLoadingState('success');
        } catch (error) {
            console.error('Failed to load images:', error);
            setLoadingState('error');
        }
    }

    const handleOpenSheet = () => {
        setIsSheetOpen(true);
        HandleLoadSideBar();
    };

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild> 
                <Button 
                    variant="outline" 
                    onClick={handleOpenSheet}
                    className="relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                    size="sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <ImageIcon className="mr-1 h-3 w-3" />
                    {loadingState === 'loading' ? (
                        <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        'Gallery'
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent style={{maxWidth: 1600, width: '90vw'}} className="p-0">
                <div className="flex flex-col h-full">
                    <SheetHeader className="px-4 py-2 border-b bg-muted/20">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <SheetTitle className="text-base">Image Gallery</SheetTitle>
                                <SheetDescription className="text-xs">
                                    Manage and annotate your image collection
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-[80vh]">
                            <div className="p-3">
                                {loadingState === 'error' ? (
                                    <Card className="border-red-200">
                                        <CardContent className="p-4 text-center">
                                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Images</h3>
                                            <p className="text-sm text-red-600 mb-4">
                                                There was an error loading your image gallery. Please try again.
                                            </p>
                                            <Button 
                                                onClick={HandleLoadSideBar}
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Retry
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <DataTableDemo/>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="border-t bg-muted/20 px-4 py-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Image management</span>
                            <SheetClose asChild>
                                <Button variant="ghost" size="sm">
                                    Close
                                </Button>
                            </SheetClose>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
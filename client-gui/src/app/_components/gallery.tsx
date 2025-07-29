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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
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
import useDataStore from "../_store/data"
import useServerStore from "../_store/server"
import useImageStore from "../_store/img"
import useCanvasStore from "../_store/canvas"

export type ImgInfo = {
    name: string
    status: boolean //annotated
    // time: 
}

// Disable SSR for DataTableDemo to prevent hydration issues
const DataTableDemo = dynamic(() => Promise.resolve(DataTableDemoComponent), {
    ssr: false
});

function DataTableDemoComponent() {
    const [isClient, setIsClient] = React.useState(false);
    
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

    // Memoize data to prevent recreation on every render
    const data: ImgInfo[] = React.useMemo(() => 
        imgs.map((img) => ({ 
            name: img, 
            status: false, 
        })), [imgs]
    )
    // const data: ImgInfo[] = 
    //     imgs.map((img) => ({ 
    //         name: img, 
    //         status: false, 
    //     }))

    // Memoize the HandleEdit function
    const HandleEdit = React.useCallback(async (filename: string) => {
        console.log("HandleEdit called with:", filename);

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
        }
    }, [baseServerURL, setImageUrl]);

    // Memoize columns to prevent recreation on every render
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
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("status") ? "true" : "false"}</div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const imginfo = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => HandleEdit(imginfo.name)}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                            <DropdownMenuItem>Download Image</DropdownMenuItem>
                            <DropdownMenuItem>Download Annotation Data</DropdownMenuItem>
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
    }) 

    // Prevent rendering on server-side to avoid hydration issues
    if (!isClient) {
        return <div className="w-full h-64 flex items-center justify-center">Loading...</div>;
    } 

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter images..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
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
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function Gallery() {
    return (
        <Sheet>
            <SheetTrigger asChild> 
                <Button variant="outline">Open</Button>
            </SheetTrigger>
            <SheetContent style={{maxWidth: 1000, width: 900}}>
                <SheetHeader>
                    <SheetTitle>Stored Photos</SheetTitle>
                    <SheetDescription>
                        A gallery of photos currently existing on server. 
                    </SheetDescription> 
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4"> 
                    <DataTableDemo/>
                </div>
            </SheetContent>
        </Sheet>
    )
}
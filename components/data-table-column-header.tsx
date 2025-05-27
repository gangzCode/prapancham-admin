"use client"

import type React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Check, EyeOff, SortAsc, SortDesc } from "lucide-react"
import type { Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
    type?: "text" | "date" | "number" | "status" | "custom"
    customSortingOptions?: { label: string; onClick: () => void }[]
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    type = "text",
    customSortingOptions,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>
    }

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                        <span>{title}</span>
                        {column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    {type === "text" && (
                        <>
                            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                                <SortAsc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Sort A-Z
                                {column.getIsSorted() === "asc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                <SortDesc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Sort Z-A
                                {column.getIsSorted() === "desc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        </>
                    )}

                    {type === "number" && (
                        <>
                            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Low to High
                                {column.getIsSorted() === "asc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                High to Low
                                {column.getIsSorted() === "desc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        </>
                    )}

                    {type === "date" && (
                        <>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Newest First
                                {column.getIsSorted() === "desc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                                <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Oldest First
                                {column.getIsSorted() === "asc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        </>
                    )}

                    {type === "status" && (
                        <>
                            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Active First
                                {column.getIsSorted() === "asc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Inactive First
                                {column.getIsSorted() === "desc" && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        </>
                    )}

                    {type === "custom" &&
                        customSortingOptions?.map((option, index) => (
                            <DropdownMenuItem key={index} onClick={option.onClick}>
                                {option.label}
                            </DropdownMenuItem>
                        ))}

                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                        <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Hide Column
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

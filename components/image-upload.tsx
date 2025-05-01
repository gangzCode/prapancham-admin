"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: string
    onChange: (value: string) => void
    previewWidth?: number
    previewHeight?: number
}

export function ImageUpload({ value, onChange, previewWidth = 150, previewHeight = 150 }: ImageUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]
            if (file) {
                const url = URL.createObjectURL(file)
                onChange(url)
            }
        },
        [onChange],
    )

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "image/*": [],
        },
        maxFiles: 1,
        onDrop,
    })

    return (
        <div className={cn("border-dashed border-2 rounded-md p-4", value ? "cursor-default" : "cursor-pointer")}>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                {value ? (
                    <div className="flex items-center justify-center">
                        <img
                            src={value || "/placeholder.svg"}
                            alt="Uploaded Image"
                            style={{ width: previewWidth, height: previewHeight, objectFit: "cover" }}
                            className="rounded-md"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground">
                        <p className="text-sm">Click or drag an image file here to upload</p>
                    </div>
                )}
            </div>
        </div>
    )
}

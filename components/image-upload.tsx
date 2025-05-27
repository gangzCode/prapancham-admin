"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: File | null
    onChange: (value: File | null) => void
    previewWidth?: number
    previewHeight?: number
}

export function ImageUpload({ value, onChange, previewWidth = 150, previewHeight = 150 }: ImageUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (value) {
            const url = URL.createObjectURL(value)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreviewUrl(null)
        }
    }, [value])

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]
            if (file) {
                onChange(file)
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
                {previewUrl ? (
                    <div className="flex items-center justify-center">
                        <img
                            src={previewUrl}
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

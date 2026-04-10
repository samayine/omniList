export declare class UploadController {
    uploadImages(files: Express.Multer.File[]): {
        url: string;
        mimeType: string;
        sizeBytes: number;
        order: number;
    }[];
}

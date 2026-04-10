"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
class ImageDto {
    url;
    mimeType;
    sizeBytes;
    static _OPENAPI_METADATA_FACTORY() {
        return { url: { required: true, type: () => String, format: "uri" }, mimeType: { required: true, type: () => String, enum: ALLOWED_MIME_TYPES }, sizeBytes: { required: true, type: () => Number, minimum: 1, maximum: MAX_IMAGE_SIZE } };
    }
}
exports.ImageDto = ImageDto;
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ImageDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(ALLOWED_MIME_TYPES, {
        message: `mimeType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }),
    __metadata("design:type", String)
], ImageDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Image size must be at least 1 byte.' }),
    (0, class_validator_1.Max)(MAX_IMAGE_SIZE, { message: 'Image size must not exceed 5MB.' }),
    __metadata("design:type", Number)
], ImageDto.prototype, "sizeBytes", void 0);
//# sourceMappingURL=image.dto.js.map
import { Status } from '../../../common/enums/status.enum';
export declare class FilterPropertiesDto {
    search?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: Status;
    page?: number;
    limit?: number;
    onlyMine?: boolean;
}

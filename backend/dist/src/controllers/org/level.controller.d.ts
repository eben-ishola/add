import { LevelService } from '../../services/org/level.service';
export declare class LevelController {
    private readonly levelService;
    constructor(levelService: LevelService);
    createLevel(createLevelDto: any): Promise<any>;
    findAllLevels(page?: number, limit?: number, searchText?: string, entity?: string): Promise<any>;
    findLevels(entity?: string): Promise<any>;
    getLevelByName(name: string): Promise<any>;
    getCategories(): Promise<any>;
    createCategory(payload: any): Promise<any>;
    updateCategory(id: string, payload: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<{
            name: string;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    updateLevel(id: string, payload: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<{
            name: string;
            category?: import("mongoose").Types.ObjectId | null;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
}

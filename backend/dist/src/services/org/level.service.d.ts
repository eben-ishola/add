import mongoose, { Model } from 'mongoose';
import { Level } from 'src/schemas/level.schema';
import { LevelCategory } from 'src/schemas/level-category.schema';
export declare class LevelService {
    private readonly levelModel;
    private readonly levelCategoryModel;
    constructor(levelModel: Model<Level>, levelCategoryModel: Model<LevelCategory>);
    createLevel(createUserDto: any): Promise<any>;
    findAllLevel(page: number, limit: number, searchText: string, entity?: string): Promise<any>;
    findLevels(entity?: string): Promise<any>;
    getLevelByName(name: string): Promise<any>;
    getById(level: string): Promise<any>;
    getLevelByNameAndEntity(name: string): Promise<any>;
    findCategories(): Promise<any>;
    createCategory(payload: any): Promise<any>;
    updateCategory(id: string, payload: any): Promise<{
        status: number;
        data: mongoose.FlattenMaps<{
            name: string;
        }> & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    updateLevel(id: string, payload: any): Promise<{
        status: number;
        data: mongoose.FlattenMaps<{
            name: string;
            category?: mongoose.Types.ObjectId | null;
        }> & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
}

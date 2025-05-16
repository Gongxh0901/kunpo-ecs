/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 系统基类
 */

import { IQueryResult } from "../query/IQuery";
import { World } from "../World";
import { IQueryData, ISystem } from "./ISystem";

export abstract class System implements ISystem {
    /** 
     * 世界
     */
    public world: World;
    /** 
     * 是否启用
     * @internal
     */
    protected enabled: boolean = true;

    /**
     * 系统名称
     */
    public get name(): string {
        return this.constructor.name;
    }

    /**
     * 查询器
     */
    public query: IQueryResult;

    /**
     * 系统初始化
     */
    public init(): void {
        let info = this.defineQuery();
        let includes = info.includes || [];
        let excludes = info.excludes || [];
        let optionals = info.optionals || [];
        this.query = this.world.QueryBuilder.with(...includes).without(...excludes).optional(...optionals).build();
    }

    /**
     * 初始化查询器
     */
    protected abstract defineQuery(): IQueryData;

    /**
     * 系统更新
     * @param {number} dt 时间间隔
     */
    public abstract update(dt: number): void;

    /**
     * 设置系统启用/禁用
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * 获取系统启用/禁用
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * 清除系统
     */
    public clear(): void {
        this.enabled = true;
    }
}
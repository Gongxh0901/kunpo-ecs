/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 系统组 - 可包含多个子系统的容器系统
 */

import { World } from "../World";
import { ISystem } from "./ISystem";

export class SystemGroup implements ISystem {
    /** 
     * 世界引用
     * @internal
     */
    protected _world: World;
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
     * 设置世界
     * @param {World} world 世界
     */
    public set world(world: World) {
        this._world = world;
    }

    /** 
     * 子系统列表
     * @internal
     */
    protected systems: ISystem[] = [];

    /**
     * 系统组描述
     * @param describe
     */
    private describe: string = "";

    constructor(describe: string) {
        this.describe = describe;
    }

    /**
     * 初始化所有子系统
     */
    public init(): void {
        let len = this.systems.length;
        for (let i = 0; i < len; i++) {
            this.systems[i].init();
        }
    }

    /**
     * 添加子系统或子系统组
     */
    public addSystem(system: ISystem): this {
        system.world = this.world;
        this.systems.push(system);
        return this;
    }

    /**
     * 移除子系统或子系统组
     */
    public removeSystem(system: ISystem): boolean {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * 更新所有启用的子系统
     * @param deltaTime 时间间隔
     * @internal
     */
    public update(deltaTime: number): void {
        if (!this.enabled) {
            return;
        }
        let len = this.systems.length;
        for (let i = 0; i < len; i++) {
            this.systems[i].update(deltaTime);
        }
    }

    /**
     * 销毁所有子系统 系统不允许动态删除
     * @internal
     */
    public dispose(): void {
        let len = this.systems.length;
        for (let i = 0; i < len; i++) {
            this.systems[i].dispose();
        }
        this.systems.length = 0;
    }

    /**
     * 启用/禁用系统组
     * @param enabled 是否启用
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * 系统是否启用
     * @returns 是否启用
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * 获取子系统数量
     * @returns 子系统数量
     */
    public getSystemCount(): number {
        return this.systems.length;
    }

    /**
     * 获取所有子系统
     * @returns 子系统列表
     */
    public getSystems(): ISystem[] {
        return this.systems;
    }

    // /**
    //  * 根据名称查找子系统
    //  */
    // public find(system: SystemType<System>): ISystem[] {
    //     let name = system.cname;
    //     return this.systems.filter(subSystem => {
    //         if (subSystem instanceof SystemGroup) {
    //             return subSystem.find(system);
    //         }
    //         return subSystem.name === name;
    //     });
    // }
}
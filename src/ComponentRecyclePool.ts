/**
 * @Author: Gongxh
 * @Date: 2025-05-13
 * @Description: 组件回收池
 */

import { IComponent } from "./interface/IComponent";

export class ComponentRecyclePool<T extends IComponent> {
    private size: number = 0;

    /**
     * 存储可复用的组件实例
     */
    private pool: T[] = [];

    /**
     * 组件的构造函数
     */
    private ctor: new () => T;

    /**
     * 最大大小
     */
    private max: number = 1024;

    /**
     * 创建组件对象池
     * @param ctor 组件的构造函数
     * @param initSize 初始化大小
     * @param maxSize 最大大小
     */
    constructor(ctor: new () => T, min: number = 0, max: number = 256) {
        this.ctor = ctor;
        this.pool.length = 0;
        this.max = max;
        this.size = 0;

        const count = Math.min(min, max);
        for (let i = 0; i < count; i++) {
            const component = new this.ctor();
            this.pool.push(component);
            this.size++;
        }
    }

    /**
     * 回收组件实例到对象池
     * @param component 组件实例
     * @returns 是否成功回收
     */
    public add(component: T): boolean {
        if (this.size >= this.max) {
            return false;
        }
        // 重置组件状态
        component.reset();

        this.pool.push(component);
        this.size++;
        return true;
    }

    /**
     * 获取组件
     * @returns 优先从对象池获取，池为空时创建新实例
     */
    public get(): T {
        if (this.size > 0) {
            this.size--;
            return this.pool.pop();
        }
        return new this.ctor();
    }

    /**
     * 清空对象池
     */
    public clear(): void {
        this.pool.length = 0;
        this.size = 0;
    }
}
/**
 * @Author: Gongxh
 * @Date: 2025-05-13
 * @Description: 组件接口
 */

import { IComponent } from "./interface/IComponent";

export abstract class Component implements IComponent {
    /** 
     * 组件类型, 自动分配
     * @internal
     */
    static componentType: number = 0;
    /** 
     * 组件名称
     */
    static componentName: string = "none";

    /** 组件销毁时 用来重置数据 */
    public abstract reset(): void;
}
import { World } from "../World";

/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 系统接口 - 所有系统和系统组都实现此接口
 */
export interface ISystem {
    /** 系统名称 */
    name: string;
    /** 世界 */
    world: World;

    /** 系统初始化 */
    init(): void;

    /** 系统更新 */
    update(dt: number): void;

    /** 系统销毁 */
    dispose(): void;

    /** 设置系统启用/禁用 */
    setEnabled(enabled: boolean): void;

    /** 获取系统启用/禁用 */
    isEnabled(): boolean;
}
